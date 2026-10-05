import { queryOptions } from "@tanstack/react-query";
import {
  adminListServices,
  adminListStats,
  adminListProcess,
  adminListTeam,
  adminListTestimonials,
} from "@/routes/api/-admin-content";
import { adminListPosts } from "@/routes/api/-admin-posts";
import { adminListMedia } from "@/routes/api/-admin-media";
import {
  adminDashboard,
  adminListSubscribers,
  adminListUsers,
  adminListAudit,
} from "@/routes/api/-admin-dashboard";
import {
  adminGetSettings,
  adminListLegal,
  adminListSections,
  adminListSeo,
} from "@/routes/api/-admin-pages";
import { adminListLeads, adminLeadsSummary } from "@/routes/api/-admin-leads";

export const adminServicesQuery = queryOptions({
  queryKey: ["admin", "services"],
  queryFn: () => adminListServices(),
});

export const adminStatsQuery = queryOptions({
  queryKey: ["admin", "stats"],
  queryFn: () => adminListStats(),
});

export const adminProcessQuery = queryOptions({
  queryKey: ["admin", "process"],
  queryFn: () => adminListProcess(),
});

export const adminTeamQuery = queryOptions({
  queryKey: ["admin", "team"],
  queryFn: () => adminListTeam(),
});

export const adminTestimonialsQuery = queryOptions({
  queryKey: ["admin", "testimonials"],
  queryFn: () => adminListTestimonials(),
});

export const adminPostsQuery = (search = "", page = 1) =>
  queryOptions({
    queryKey: ["admin", "posts", search, page],
    queryFn: () => adminListPosts({ data: { search, page } }),
  });

export const adminMediaQuery = queryOptions({
  queryKey: ["admin", "media"],
  queryFn: () => adminListMedia(),
});

export const adminDashboardQuery = queryOptions({
  queryKey: ["admin", "dashboard"],
  queryFn: () => adminDashboard(),
});

export const adminSubscribersQuery = (page = 1, search = "", status = "") =>
  queryOptions({
    queryKey: ["admin", "subscribers", page, search, status],
    queryFn: () => adminListSubscribers({ data: { page, search, status } }),
  });

export const adminUsersQuery = queryOptions({
  queryKey: ["admin", "users"],
  queryFn: () => adminListUsers(),
});

export const adminAuditQuery = queryOptions({
  queryKey: ["admin", "audit"],
  queryFn: () => adminListAudit({ data: { limit: 200 } }),
});

export const adminSettingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: () => adminGetSettings(),
});

export const adminLegalQuery = queryOptions({
  queryKey: ["admin", "legal"],
  queryFn: () => adminListLegal(),
});

export const adminSectionsQuery = (page = "") =>
  queryOptions({
    queryKey: ["admin", "sections", page],
    queryFn: () => adminListSections({ data: { page } }),
  });

export const adminSeoQuery = queryOptions({
  queryKey: ["admin", "seo"],
  queryFn: () => adminListSeo(),
});

export const adminLeadsPageQuery = (filters: {
  search: string;
  status: string;
  service: string;
  page: number;
}) =>
  queryOptions({
    queryKey: ["admin", "leads", filters],
    queryFn: () =>
      adminListLeads({
        data: {
          search: filters.search,
          status: filters.status,
          service: filters.service,
          page: filters.page,
          pageSize: 25,
        },
      }),
  });

export const adminLeadsSummaryQuery = queryOptions({
  queryKey: ["admin", "leads-summary"],
  queryFn: () => adminLeadsSummary(),
});
