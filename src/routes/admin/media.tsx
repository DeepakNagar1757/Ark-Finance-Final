import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Pencil } from "lucide-react";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { requireEditor } from "@/lib/admin/guard";
import { adminMediaQuery } from "@/lib/admin/queries";
import { adminDeleteMedia, adminUploadMedia, adminUpdateMedia } from "@/routes/api/-admin-media";

export const Route = createFileRoute("/admin/media")({
  loader: () => requireEditor(),
  component: MediaPage,
});

async function toWebpBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not load image"));
      image.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { base64: dataUrl, mimeType: file.type || "image/webp" };
    ctx.drawImage(img, 0, 0);
    const webp = canvas.toDataURL("image/webp", 0.82);
    return { base64: webp, mimeType: "image/webp" };
  } catch {
    return { base64: dataUrl, mimeType: file.type || "image/webp" };
  }
}

function bytesToSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaPage() {
  const queryClient = useQueryClient();
  const media = useQuery(adminMediaQuery);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [altEdit, setAltEdit] = useState<{ id: string; filename: string; alt: string; url: string } | null>(null);
  const [altValue, setAltValue] = useState("");
  const [altSaving, setAltSaving] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image is larger than 15 MB");
      return;
    }
    if (file.size > 300 * 1024) {
      toast.warning("Image is over 300 KB — your upload will be compressed to WebP.");
    }
    setUploading(true);
    try {
      const { base64, mimeType } = await toWebpBase64(file);
      await adminUploadMedia({
        data: {
          filename: `guest-${Date.now()}-${file.name.replace(/\.[^.]+$/, "")}`,
          mimeType,
          sizeBytes: Math.round((base64.length - base64.indexOf(",") - 1) * 0.75),
          base64,
          altText: "",
        },
      });
      toast.success("Image uploaded");
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^Error: /, "") : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveAlt = async () => {
    if (!altEdit) return;
    setAltSaving(true);
    try {
      await adminUpdateMedia({ data: { id: altEdit.id, altText: altValue.trim() } });
      toast.success("Alt text saved");
      setAltEdit(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    } catch {
      toast.error("Could not save alt text");
    } finally {
      setAltSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Media library"
        description="Upload images for posts, services and pages. Images are automatically compressed to WebP."
        actions={
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
              Upload image
            </Button>
          </>
        }
      />

      {uploading ? (
        <div className="mb-4 rounded-lg border border-teal-400/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-200">
          Compressing and uploading… please wait.
        </div>
      ) : null}

      {media.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (media.data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-12 text-center text-sm text-zinc-500">
          No images yet. Upload your first image above.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(media.data ?? []).map((m: any) => (
            <div key={m.id} className="group overflow-hidden rounded-lg border border-white/10 bg-white/5">
              <img src={m.url} alt={m.alt_text || m.filename} className="aspect-video w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-xs font-medium text-zinc-300">{m.alt_text || m.filename}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {m.mime_type?.split("/")[1]?.toUpperCase()} · {bytesToSize(m.size_bytes ?? 0)}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-zinc-400 hover:text-zinc-100"
                    onClick={() => {
                      setAltEdit({ id: m.id, filename: m.filename, alt: m.alt_text ?? "", url: m.url });
                      setAltValue(m.alt_text ?? "");
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Alt
                  </Button>
                  <ConfirmButton
                    title="Delete this image?"
                    description="The image will be removed from storage. Links on the site that use it will break."
                    onConfirm={async () => {
                      await adminDeleteMedia({ data: { id: m.id } });
                      toast.success("Image deleted");
                      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
                    }}
                    trigger={
                      <Button variant="ghost" size="sm" className="text-red-400/80 hover:text-red-300">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(altEdit)} onOpenChange={(o) => !o && setAltEdit(null)}>
        <DialogContent className="bg-[#0f1729] text-zinc-100">
          <DialogHeader>
            <DialogTitle>Edit alt text</DialogTitle>
          </DialogHeader>
          {altEdit ? (
            <div className="space-y-3">
              <img src={altEdit.url} alt="" className="aspect-video w-full rounded-lg border border-white/10 object-cover" />
              <div>
                <Label className="text-sm text-zinc-300">Alt text</Label>
                <Input value={altValue} onChange={(e) => setAltValue(e.target.value)} maxLength={300} className="mt-1.5 bg-white/5 text-zinc-100" />
                <p className="mt-1 text-xs text-zinc-500">
                  Describes the image for screen readers and SEO.
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveAlt} disabled={altSaving}>
              {altSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}