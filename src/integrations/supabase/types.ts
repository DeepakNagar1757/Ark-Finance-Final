export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string;
          email: string;
        };
        Insert: {
          created_at?: string;
          email: string;
        };
        Update: {
          created_at?: string;
          email?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          author: string;
          category: string;
          content: string;
          cover_url: string | null;
          created_at: string;
          excerpt: string;
          id: string;
          is_published: boolean;
          og_image: string | null;
          published_at: string;
          seo_description: string;
          seo_title: string;
          slug: string;
          status: string;
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          author?: string;
          category?: string;
          content?: string;
          cover_url?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          is_published?: boolean;
          og_image?: string | null;
          published_at?: string;
          seo_description?: string;
          seo_title?: string;
          slug: string;
          status?: string;
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          author?: string;
          category?: string;
          content?: string;
          cover_url?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          is_published?: boolean;
          og_image?: string | null;
          published_at?: string;
          seo_description?: string;
          seo_title?: string;
          slug?: string;
          status?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          email: string;
          id: string;
          internal_notes: string;
          message: string;
          name: string;
          phone: string;
          service: string;
          source_page: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          internal_notes?: string;
          message?: string;
          name: string;
          phone: string;
          service?: string;
          source_page?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          internal_notes?: string;
          message?: string;
          name?: string;
          phone?: string;
          service?: string;
          source_page?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          source: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          source?: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          source?: string;
          status?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          name: string;
          password_hash: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          password_hash: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          password_hash?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_sessions: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          last_used_at: string;
          token_hash: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          last_used_at?: string;
          token_hash: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          last_used_at?: string;
          token_hash?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          address_area: string;
          address_line1: string;
          address_line2: string;
          address_region: string;
          content_version: number;
          created_at: string;
          established_year: number | null;
          firm_name: string;
          footer_blurb: string;
          footer_copyright: string;
          founder_name: string;
          founder_title: string;
          id: boolean;
          logo_url: string | null;
          maps_link: string;
          notes: string | null;
          office_hours: string;
          phone: string;
          phone_href: string;
          public_email: string;
          seo_defaults: Json;
          short_name: string;
          social_links: Json;
          tagline: string;
          updated_at: string;
          whatsapp_message: string;
          whatsapp_number: string;
        };
        Insert: {
          address_area?: string;
          address_line1?: string;
          address_line2?: string;
          address_region?: string;
          content_version?: number;
          created_at?: string;
          established_year?: number | null;
          firm_name?: string;
          footer_blurb?: string;
          footer_copyright?: string;
          founder_name?: string;
          founder_title?: string;
          id?: boolean;
          logo_url?: string | null;
          maps_link?: string;
          notes?: string | null;
          office_hours?: string;
          phone?: string;
          phone_href?: string;
          public_email?: string;
          seo_defaults?: Json;
          short_name?: string;
          social_links?: Json;
          tagline?: string;
          updated_at?: string;
          whatsapp_message?: string;
          whatsapp_number?: string;
        };
        Update: {
          address_area?: string;
          address_line1?: string;
          address_line2?: string;
          address_region?: string;
          content_version?: number;
          created_at?: string;
          established_year?: number | null;
          firm_name?: string;
          footer_blurb?: string;
          footer_copyright?: string;
          founder_name?: string;
          founder_title?: string;
          id?: boolean;
          logo_url?: string | null;
          maps_link?: string;
          notes?: string | null;
          office_hours?: string;
          phone?: string;
          phone_href?: string;
          public_email?: string;
          seo_defaults?: Json;
          short_name?: string;
          social_links?: Json;
          tagline?: string;
          updated_at?: string;
          whatsapp_message?: string;
          whatsapp_number?: string;
        };
        Relationships: [];
      };
      page_sections: {
        Row: {
          align: string;
          body: string;
          created_at: string;
          cta_label: string;
          cta_target: string;
          eyebrow: string;
          heading: string;
          id: string;
          intro: string;
          is_active: boolean;
          media_url: string | null;
          page: string;
          section_key: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          align?: string;
          body?: string;
          created_at?: string;
          cta_label?: string;
          cta_target?: string;
          eyebrow?: string;
          heading?: string;
          id?: string;
          intro?: string;
          is_active?: boolean;
          media_url?: string | null;
          page: string;
          section_key: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          align?: string;
          body?: string;
          created_at?: string;
          cta_label?: string;
          cta_target?: string;
          eyebrow?: string;
          heading?: string;
          id?: string;
          intro?: string;
          is_active?: boolean;
          media_url?: string | null;
          page?: string;
          section_key?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      stats: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          label: string;
          sort_order: number;
          updated_at: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          sort_order?: number;
          updated_at?: string;
          value: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          sort_order?: number;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      process_steps: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_active: boolean;
          sort_order: number;
          step: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          sort_order?: number;
          step?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          sort_order?: number;
          step?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          alt_text: string;
          bucket: string;
          created_at: string;
          filename: string;
          id: string;
          mime_type: string;
          path: string;
          size_bytes: number;
          updated_at: string;
          url: string;
        };
        Insert: {
          alt_text?: string;
          bucket?: string;
          created_at?: string;
          filename: string;
          id?: string;
          mime_type?: string;
          path: string;
          size_bytes?: number;
          updated_at?: string;
          url: string;
        };
        Update: {
          alt_text?: string;
          bucket?: string;
          created_at?: string;
          filename?: string;
          id?: string;
          mime_type?: string;
          path?: string;
          size_bytes?: number;
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
      seo_meta: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          og_image: string | null;
          robots: string;
          route: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          og_image?: string | null;
          robots?: string;
          route: string;
          title?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          og_image?: string | null;
          robots?: string;
          route?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      legal_pages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          intro: string;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id?: string;
          intro?: string;
          slug: string;
          title?: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          intro?: string;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          action: string;
          created_at: string;
          entity: string;
          entity_id: string | null;
          id: string;
          meta: Json;
          user_id: string | null;
          user_role: string;
        };
        Insert: {
          action?: string;
          created_at?: string;
          entity: string;
          entity_id?: string | null;
          id?: string;
          meta?: Json;
          user_id?: string | null;
          user_role?: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity?: string;
          entity_id?: string | null;
          id?: string;
          meta?: Json;
          user_id?: string | null;
          user_role?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          created_at: string;
          description: string;
          features: string[];
          icon: string;
          id: string;
          image_alt: string;
          image_url: string | null;
          is_published: boolean;
          slug: string;
          sort_order: number;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          features?: string[];
          icon?: string;
          id?: string;
          image_alt?: string;
          image_url?: string | null;
          is_published?: boolean;
          slug: string;
          sort_order?: number;
          summary?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          features?: string[];
          icon?: string;
          id?: string;
          image_alt?: string;
          image_url?: string | null;
          is_published?: boolean;
          slug?: string;
          sort_order?: number;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_images: {
        Row: {
          created_at: string;
          id: string;
          image_url: string;
          key: string;
          label: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url: string;
          key: string;
          label?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string;
          key?: string;
          label?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          bio: string;
          created_at: string;
          credential: string;
          designation: string;
          id: string;
          is_founder: boolean;
          is_published: boolean;
          name: string;
          photo_url: string | null;
          sort_order: number;
          specialization: string;
          updated_at: string;
        };
        Insert: {
          bio?: string;
          created_at?: string;
          credential?: string;
          designation?: string;
          id?: string;
          is_founder?: boolean;
          is_published?: boolean;
          name: string;
          photo_url?: string | null;
          sort_order?: number;
          specialization?: string;
          updated_at?: string;
        };
        Update: {
          bio?: string;
          created_at?: string;
          credential?: string;
          designation?: string;
          id?: string;
          is_founder?: boolean;
          is_published?: boolean;
          name?: string;
          photo_url?: string | null;
          sort_order?: number;
          specialization?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          company: string;
          created_at: string;
          designation: string;
          id: string;
          is_featured: boolean;
          is_published: boolean;
          name: string;
          photo_url: string | null;
          quote: string;
          rating: number;
          service_tag: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          company?: string;
          created_at?: string;
          designation?: string;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          name: string;
          photo_url?: string | null;
          quote: string;
          rating?: number;
          service_tag?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          company?: string;
          created_at?: string;
          designation?: string;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          name?: string;
          photo_url?: string | null;
          quote?: string;
          rating?: number;
          service_tag?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
