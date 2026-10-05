import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ManagedList, type FieldDef } from "@/components/admin/ManagedList";

export type EntityCrudConfig = {
  title: string;
  description: string;
  queryOptions: UseQueryOptions<any, Error, any, string[]>;
  fields: FieldDef[];
  defaults: Record<string, any>;
  listLabel: (item: any) => React.ReactNode;
  onSave: (values: Record<string, any>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onReorder?: (ids: string[]) => Promise<any>;
  toggleField?: string;
};

export function EntityCrudPage({ config }: { config: EntityCrudConfig }) {
  const query = useQuery(config.queryOptions);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={config.title} description={config.description} />
      <ManagedList
        items={query.data ?? []}
        queryKey={config.queryOptions.queryKey as string[]}
        fields={config.fields}
        defaults={config.defaults}
        listLabel={config.listLabel}
        onSave={config.onSave}
        onDelete={config.onDelete}
        onToggle={config.onSave}
        {...(config.onReorder ? { onReorder: config.onReorder } : {})}
        {...(config.toggleField ? { toggleField: config.toggleField } : {})}
      />
    </div>
  );
}