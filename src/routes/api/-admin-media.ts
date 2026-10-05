import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { req } from "@/lib/server/admin-crud";
import { writeAudit } from "@/lib/admin/auth";
import { bumpContentVersion } from "@/lib/server/content";

function signedUrl(path: string): Promise<string> {
  return supabaseAdmin.storage
    .from("site-media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10)
    .then((r) => {
      if (r.error) throw new Error(r.error.message);
      return r.data.signedUrl;
    });
}

export const adminListMedia = createServerFn({ method: "GET" }).handler(async () => {
  await req();
  const { data, error } = await supabaseAdmin
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const uploadSchema = z.object({
  filename: z.string().trim().min(1).max(300),
  mimeType: z.string().trim().max(100).default("image/webp"),
  sizeBytes: z.number().int().nonnegative(),
  base64: z.string().min(1),
  altText: z.string().trim().max(300),
});

export const adminUploadMedia = createServerFn({ method: "POST" })
  .validator((data: unknown) => uploadSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid upload");
    const { user } = await req();
    const bytes = Buffer.from(data.data.base64.split(",")[1] ?? data.data.base64, "base64");
    if (bytes.byteLength > 15 * 1024 * 1024) {
      throw new Response(JSON.stringify({ message: "File too large" }), {
        status: 413,
        headers: { "content-type": "application/json" },
      });
    }
    const clean = data.data.filename.replace(/[^\w.\-]+/g, "-");
    const path = `uploads/${crypto.randomUUID()}-${clean}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("site-media")
      .upload(path, bytes, { contentType: data.data.mimeType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const url = await signedUrl(path);
    const { data: mediaRow, error } = await supabaseAdmin
      .from("media")
      .insert({
        filename: clean,
        path,
        url,
        mime_type: data.data.mimeType,
        size_bytes: data.data.sizeBytes,
        alt_text: data.data.altText,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await bumpContentVersion();
    await writeAudit(user, "upload", "media", mediaRow.id, { filename: clean });
    return mediaRow;
  });

const patchMediaSchema = z.object({
  id: z.string().uuid(),
  altText: z.string().trim().max(300),
});

export const adminUpdateMedia = createServerFn({ method: "POST" })
  .validator((data: unknown) => patchMediaSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user } = await req();
    const { error } = await supabaseAdmin
      .from("media")
      .update({ alt_text: data.data.altText })
      .eq("id", data.data.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "update", "media", data.data.id, { alt_text: data.data.altText });
    return { ok: true };
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { user } = await req();
    const { data: row } = await supabaseAdmin.from("media").select("path").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin.from("media").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (row?.path) {
      await supabaseAdmin.storage.from("site-media").remove([row.path]);
    }
    await writeAudit(user, "delete", "media", data.id);
    return { ok: true };
  });