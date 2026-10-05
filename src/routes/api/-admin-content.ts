import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  req,
  listRows,
  createRow,
  updateRow,
  deleteRow,
  reorderRows,
} from "@/lib/server/admin-crud";

type CrudTable =
  | "services"
  | "stats"
  | "process_steps"
  | "team_members"
  | "testimonials";

const contentTables = new Set<string>(["services", "stats", "process_steps", "team_members", "testimonials"]);

function isContentTable(table: string): table is CrudTable {
  return contentTables.has(table);
}

const idSchema = z.object({ id: z.string().min(1) });
const idsSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

const serviceRowSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(140).optional().default(""),
  summary: z.string().trim().max(400).optional().default(""),
  description: z.string().trim().max(4000).optional().default(""),
  icon: z.string().trim().max(40).optional().default("Landmark"),
  features: z.array(z.string().trim().max(200)).max(20).optional().default([]),
  image_url: z.string().trim().max(500).nullable().optional(),
  image_alt: z.string().trim().max(300).optional().default(""),
  is_published: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

const statRowSchema = z.object({
  id: z.string().min(1).optional(),
  value: z.string().trim().min(1).max(30),
  label: z.string().trim().min(1).max(120),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const processRowSchema = z.object({
  id: z.string().min(1).optional(),
  step: z.string().trim().max(10).optional().default(""),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().max(1000).optional().default(""),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const teamRowSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(120),
  designation: z.string().trim().max(200).optional().default(""),
  credential: z.string().trim().max(200).optional().default(""),
  specialization: z.string().trim().max(400).optional().default(""),
  bio: z.string().trim().max(2000).optional().default(""),
  photo_url: z.string().trim().max(500).nullable().optional(),
  is_founder: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

const testimonialRowSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(120),
  designation: z.string().trim().max(200).optional().default(""),
  company: z.string().trim().max(200).optional().default(""),
  quote: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional().default(5),
  service_tag: z.string().trim().max(200).optional().default(""),
  photo_url: z.string().trim().max(500).nullable().optional(),
  is_featured: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

function parseRow(
  schema: z.ZodType<Record<string, unknown>>,
  value: unknown,
): Record<string, unknown> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new Error("Invalid data");
  return parsed.data;
}

type SaveResult = { id: string | null };

async function saveRow(table: string, row: Record<string, unknown>): Promise<SaveResult> {
  const { user } = await req();
  if (row["id"]) {
    const { id, ...rest } = row;
    await updateRow(table, String(id), rest);
    return { id: String(id) };
  }
  return createRow(table, row);
}

export const adminListServices = createServerFn({ method: "GET" }).handler(async () =>
  listRows("services", "sort_order"),
);

export const adminSaveService = createServerFn({ method: "POST" })
  .validator((data: unknown) => serviceRowSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    return saveRow("services", data.data as Record<string, unknown>);
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await deleteRow("services", data.data.id);
    return { ok: true };
  });

export const adminReorderServices = createServerFn({ method: "POST" })
  .validator((data: unknown) => idsSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await reorderRows("services", data.data.ids);
    return { ok: true };
  });

export const adminListStats = createServerFn({ method: "GET" }).handler(async () =>
  listRows("stats", "sort_order"),
);

export const adminSaveStat = createServerFn({ method: "POST" })
  .validator((data: unknown) => statRowSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    return saveRow("stats", data.data as Record<string, unknown>);
  });

export const adminDeleteStat = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await deleteRow("stats", data.data.id);
    return { ok: true };
  });

export const adminReorderStats = createServerFn({ method: "POST" })
  .validator((data: unknown) => idsSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await reorderRows("stats", data.data.ids);
    return { ok: true };
  });

export const adminListProcess = createServerFn({ method: "GET" }).handler(async () =>
  listRows("process_steps", "sort_order"),
);

export const adminSaveProcessStep = createServerFn({ method: "POST" })
  .validator((data: unknown) => processRowSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    return saveRow("process_steps", data.data as Record<string, unknown>);
  });

export const adminDeleteProcessStep = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await deleteRow("process_steps", data.data.id);
    return { ok: true };
  });

export const adminReorderProcess = createServerFn({ method: "POST" })
  .validator((data: unknown) => idsSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await reorderRows("process_steps", data.data.ids);
    return { ok: true };
  });

export const adminListTeam = createServerFn({ method: "GET" }).handler(async () =>
  listRows("team_members", "sort_order"),
);

export const adminSaveTeamMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => teamRowSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    return saveRow("team_members", data.data as Record<string, unknown>);
  });

export const adminDeleteTeamMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await deleteRow("team_members", data.data.id);
    return { ok: true };
  });

export const adminReorderTeam = createServerFn({ method: "POST" })
  .validator((data: unknown) => idsSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await reorderRows("team_members", data.data.ids);
    return { ok: true };
  });

export const adminListTestimonials = createServerFn({ method: "GET" }).handler(async () =>
  listRows("testimonials", "sort_order"),
);

export const adminSaveTestimonial = createServerFn({ method: "POST" })
  .validator((data: unknown) => testimonialRowSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    return saveRow("testimonials", data.data as Record<string, unknown>);
  });

export const adminDeleteTestimonial = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await deleteRow("testimonials", data.data.id);
    return { ok: true };
  });

export const adminReorderTestimonials = createServerFn({ method: "POST" })
  .validator((data: unknown) => idsSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await reorderRows("testimonials", data.data.ids);
    return { ok: true };
  });
