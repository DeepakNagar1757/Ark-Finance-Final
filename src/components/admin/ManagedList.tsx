import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ConfirmButton } from "@/components/admin/ui";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "features" | "textareaLg";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  options?: { label: string; value: string }[];
};

type Row = Record<string, any> & { id?: string };

function FormField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = (
    <Label htmlFor={`f-${field.name}`} className="mb-1.5 block text-sm font-medium text-zinc-200">
      {field.label}
      {field.required ? <span className="text-red-400"> *</span> : null}
    </Label>
  );
  const hint = field.hint ? <p className="mt-1 text-xs text-zinc-500">{field.hint}</p> : null;

  switch (field.type) {
    case "textarea":
    case "textareaLg":
      return (
        <div>
          {label}
          <Textarea
            id={`f-${field.name}`}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            rows={field.type === "textareaLg" ? 12 : 4}
            className="bg-white/5 text-zinc-100"
          />
          {hint}
        </div>
      );
    case "features":
      return (
        <div>
          {label}
          <Textarea
            id={`f-${field.name}`}
            value={(Array.isArray(value) ? value.join("\n") : "") as string}
            onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
            placeholder="One feature per line"
            rows={5}
            className="bg-white/5 font-mono text-xs text-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-500">One item per line.</p>
        </div>
      );
    case "number":
      return (
        <div>
          {label}
          <Input
            id={`f-${field.name}`}
            type="number"
            value={value == null ? 0 : Number(value)}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            className="bg-white/5 text-zinc-100"
          />
          {hint}
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm font-medium text-zinc-200">{field.label}</span>
          <Switch checked={Boolean(value)} onCheckedChange={(v) => onChange(Boolean(v))} />
        </div>
      );
    case "select":
      return (
        <div>
          {label}
          <Select value={typeof value === "string" ? value : ""} onValueChange={(v) => onChange(v)}>
            <SelectTrigger className="bg-white/5 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hint}
        </div>
      );
    default:
      return (
        <div>
          {label}
          <Input
            id={`f-${field.name}`}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className="bg-white/5 text-zinc-100"
          />
          {hint}
        </div>
      );
  }
}

function SortableRow({
  id,
  children,
  onMove,
  index,
  total,
  hasDrag,
}: {
  id: string;
  children: (dragProps: Record<string, unknown>) => ReactNode;
  onMove: (dir: -1 | 1) => void;
  index: number;
  total: number;
  hasDrag: boolean;
}) {
  const sortable = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  const dragProps: Record<string, unknown> = hasDrag
    ? { ref: sortable.setNodeRef, style, ...sortable.attributes, ...sortable.listeners }
    : {};

  return (
    <div
      ref={sortable.setNodeRef}
      style={hasDrag ? style : undefined}
      className={sortable.isDragging ? "relative z-10 rounded-lg opacity-80" : ""}
    >
      <div className="flex items-center gap-2">
        {hasDrag ? (
          <button
            type="button"
            {...sortable.attributes}
            {...sortable.listeners}
            className="hidden shrink-0 cursor-grab touch-none text-zinc-500 hover:text-zinc-300 sm:block"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}
        {children(dragProps)}
        <div className="flex shrink-0 flex-col gap-0.5">
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500" disabled={index === 0} onClick={() => onMove(-1)}>
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500" disabled={index === total - 1} onClick={() => onMove(1)}>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManagedList({
  items,
  queryKey,
  emptyText = "Nothing here yet. Click “Add” to create the first item.",
  newLabel = "Add",
  fields,
  defaults,
  listLabel,
  onSave,
  onDelete,
  onReorder,
  onToggle,
  toggleField,
}: {
  items: Row[];
  queryKey: string[];
  emptyText?: string;
  newLabel?: string;
  fields: FieldDef[];
  defaults: Row;
  listLabel: (item: Row) => ReactNode;
  onSave: (values: Row) => Promise<{ id?: string | null } | undefined | void>;
  onDelete: (id: string) => Promise<void>;
  onReorder?: (ids: string[]) => Promise<unknown>;
  onToggle?: (item: Row) => Promise<unknown>;
  toggleField?: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const ordered = useMemo(() => items, [items]);

  const openNew = () => {
    setForm({ ...defaults });
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (item: Row) => {
    setForm({ ...item });
    setEditing(item);
    setOpen(true);
  };

  const setField = (name: string, value: unknown) => setForm((f) => ({ ...f, [name]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await onSave(form);
      toast.success(editing ? "Saved changes" : "Created");
      setOpen(false);
      await invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^Error: /, "") : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (ids: string[]) => {
    if (!onReorder) return;
    try {
      await onReorder(ids);
      await invalidate();
    } catch (err) {
      toast.error("Could not reorder");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = arrayMove(items, index, target);
    await handleReorder(next.map((r) => String(r["id"])));
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((r) => String(r["id"]) === String(active.id));
    const newIndex = items.findIndex((r) => String(r["id"]) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    await handleReorder(next.map((r) => String(r["id"])));
  };

  return (
    <>
      {items.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((r) => String(r.id))} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ordered.map((item, index) => (
                <SortableRow
                  key={item.id}
                  id={String(item.id)}
                  index={index}
                  total={ordered.length}
                  hasDrag={Boolean(onReorder)}
                  onMove={(dir) => move(index, dir)}
                >
                  {() => (
                    <div className="flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                      <div className="min-w-0 flex-1">{listLabel(item)}</div>
                      {toggleField && onToggle ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-400">Visible</span>
                          <Switch
                            checked={Boolean(item[toggleField])}
                            onCheckedChange={async (v) => {
                              try {
                                await onToggle({ ...item, [toggleField]: v });
                                await invalidate();
                              } catch (err) {
                                toast.error("Could not toggle");
                              }
                            }}
                          />
                        </div>
                      ) : null}
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-zinc-400" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <ConfirmButton
                        title="Delete this item?"
                        description="This cannot be undone."
                        onConfirm={async () => {
                          await onDelete(String(item.id));
                          await invalidate();
                        }}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-red-400/80 hover:text-red-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  )}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-zinc-500">{emptyText}</div>
      )}

      <div className="sticky bottom-4 mt-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> {newLabel}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#0f1729] text-zinc-100">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : newLabel}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Changes go live on the public site right after saving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map((field) => (
              <FormField key={field.name} field={field} value={form[field.name]} onChange={(v) => setField(field.name, v)} />
            ))}
          </div>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}