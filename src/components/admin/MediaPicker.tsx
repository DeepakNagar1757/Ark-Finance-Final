import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { adminMediaQuery } from "@/lib/admin/queries";

export function MediaPicker({
  onSelect,
  trigger,
}: {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const media = useQuery(adminMediaQuery);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm" className="border-white/10 text-zinc-300">
            <ImagePlus className="mr-1.5 h-4 w-4" /> Pick from media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto bg-[#0f1729] text-zinc-100">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>
        {media.isLoading ? (
          <div className="flex items-center justify-center py-10 text-zinc-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : (media.data ?? []).length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-zinc-500">
            No images yet. Upload some in the Media library first.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(media.data ?? []).map((m: any) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelect(m.url);
                  setOpen(false);
                }}
                className="group overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors hover:border-teal-400/50"
              >
                <img src={m.url} alt={m.alt_text || ""} className="aspect-video w-full object-cover" />
                <p className="truncate px-2 py-1.5 text-center text-[11px] text-zinc-400 group-hover:text-teal-300">
                  {m.alt_text || m.filename}
                </p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}