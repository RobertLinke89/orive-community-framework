export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          facilitator_id: string
          id: string
          is_available: boolean
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          facilitator_id: string
          id?: string
          is_available?: boolean
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          facilitator_id?: string
          id?: string
          is_available?: boolean
          start_time?: string
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string
          is_published: boolean
          published_at: string
          read_time: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          id: string
          image_url: string
          is_published?: boolean
          published_at: string
          read_time: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string
          is_published?: boolean
          published_at?: string
          read_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_attributions: {
        Row: {
          booking_id: string
          created_at: string
          facilitator_id: string
          first_touch_event_id: string | null
          first_utm: Json
          last_touch_event_id: string | null
          last_utm: Json
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          facilitator_id: string
          first_touch_event_id?: string | null
          first_utm?: Json
          last_touch_event_id?: string | null
          last_utm?: Json
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          facilitator_id?: string
          first_touch_event_id?: string | null
          first_utm?: Json
          last_touch_event_id?: string | null
          last_utm?: Json
          updated_at?: string
        }
        Relationships: []
      }
      booking_audit_log: {
        Row: {
          action: string
          booking_id: string
          details: Json | null
          id: string
          ip_address: string | null
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          booking_id: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          booking_id?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          client_email: string
          client_name: string
          client_phone: string | null
          consent_timestamp: string | null
          created_at: string
          duration: number
          facilitator_id: string
          followup_sent: boolean
          gdpr_consent: boolean | null
          id: string
          notes: string | null
          offering_id: string | null
          reminder_sent: boolean
          status: string
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_email: string
          client_name: string
          client_phone?: string | null
          consent_timestamp?: string | null
          created_at?: string
          duration?: number
          facilitator_id: string
          followup_sent?: boolean
          gdpr_consent?: boolean | null
          id?: string
          notes?: string | null
          offering_id?: string | null
          reminder_sent?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_email?: string
          client_name?: string
          client_phone?: string | null
          consent_timestamp?: string | null
          created_at?: string
          duration?: number
          facilitator_id?: string
          followup_sent?: boolean
          gdpr_consent?: boolean | null
          id?: string
          notes?: string | null
          offering_id?: string | null
          reminder_sent?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          download_count: number
          facilitator_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_admin_resource: boolean
          title: string
          updated_at: string
          uploaded_by: string
          visibility: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          download_count?: number
          facilitator_id?: string | null
          file_name: string
          file_path: string
          file_size?: number
          file_type: string
          id?: string
          is_admin_resource?: boolean
          title: string
          updated_at?: string
          uploaded_by: string
          visibility?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          download_count?: number
          facilitator_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_admin_resource?: boolean
          title?: string
          updated_at?: string
          uploaded_by?: string
          visibility?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          facilitator_id: string | null
          id: string
          offering_id: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          facilitator_id?: string | null
          id?: string
          offering_id?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          facilitator_id?: string | null
          id?: string
          offering_id?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_events: {
        Row: {
          booking_id: string | null
          client_token: string | null
          created_at: string
          event_type: string
          facilitator_id: string | null
          id: string
          offering_id: string | null
          page_path: string | null
          page_url: string | null
          profile_id: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          utm: Json
        }
        Insert: {
          booking_id?: string | null
          client_token?: string | null
          created_at?: string
          event_type: string
          facilitator_id?: string | null
          id?: string
          offering_id?: string | null
          page_path?: string | null
          page_url?: string | null
          profile_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm?: Json
        }
        Update: {
          booking_id?: string | null
          client_token?: string | null
          created_at?: string
          event_type?: string
          facilitator_id?: string | null
          id?: string
          offering_id?: string | null
          page_path?: string | null
          page_url?: string | null
          profile_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm?: Json
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          created_at: string
          last_seen_notifications_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_seen_notifications_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_seen_notifications_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offering_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          offering_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          offering_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          offering_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "offering_images_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      offerings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          cancellation_policy: string | null
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          end_at: string | null
          facilitator_id: string
          id: string
          image_url: string | null
          is_online: boolean
          is_recurring: boolean
          location: string | null
          price: string | null
          recurrence_rule: string | null
          start_at: string | null
          status: string | null
          tags: string[] | null
          timezone: string | null
          title: string
          type: string
          updated_at: string | null
          venue_name: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          cancellation_policy?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          end_at?: string | null
          facilitator_id: string
          id?: string
          image_url?: string | null
          is_online?: boolean
          is_recurring?: boolean
          location?: string | null
          price?: string | null
          recurrence_rule?: string | null
          start_at?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
          title: string
          type: string
          updated_at?: string | null
          venue_name?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          cancellation_policy?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          end_at?: string | null
          facilitator_id?: string
          id?: string
          image_url?: string | null
          is_online?: boolean
          is_recurring?: boolean
          location?: string | null
          price?: string | null
          recurrence_rule?: string | null
          start_at?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offerings_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offerings_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pii_access_log: {
        Row: {
          accessed_at: string
          action: string
          id: string
          ip_address: string | null
          record_count: number | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_at?: string
          action: string
          id?: string
          ip_address?: string | null
          record_count?: number | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_at?: string
          action?: string
          id?: string
          ip_address?: string | null
          record_count?: number | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pii_alert_cooldowns: {
        Row: {
          action: string
          baseline_per_hour: number
          created_at: string
          id: string
          last_alert_at: string
          last_count: number
          last_window_end: string
          last_window_start: string
          resource_type: string
          updated_at: string
        }
        Insert: {
          action?: string
          baseline_per_hour: number
          created_at?: string
          id?: string
          last_alert_at?: string
          last_count: number
          last_window_end: string
          last_window_start: string
          resource_type: string
          updated_at?: string
        }
        Update: {
          action?: string
          baseline_per_hour?: number
          created_at?: string
          id?: string
          last_alert_at?: string
          last_count?: number
          last_window_end?: string
          last_window_start?: string
          resource_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pii_alert_overrides: {
        Row: {
          action: string
          cooldown_minutes: number
          created_at: string
          id: string
          is_enabled: boolean
          resource_type: string
          updated_at: string
        }
        Insert: {
          action: string
          cooldown_minutes?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          resource_type: string
          updated_at?: string
        }
        Update: {
          action?: string
          cooldown_minutes?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          resource_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pii_encryption_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_name: string
          rotated_at: string | null
          secret: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_name: string
          rotated_at?: string | null
          secret: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_name?: string
          rotated_at?: string | null
          secret?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          expertise: string | null
          full_name: string
          id: string
          is_visible: boolean
          location: string | null
          onboarding_completed: boolean | null
          professional_title: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          expertise?: string | null
          full_name: string
          id: string
          is_visible?: boolean
          location?: string | null
          onboarding_completed?: boolean | null
          professional_title?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          expertise?: string | null
          full_name?: string
          id?: string
          is_visible?: boolean
          location?: string | null
          onboarding_completed?: boolean | null
          professional_title?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempt_count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action?: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          offering_id: string | null
          rating: number
          reviewer_avatar: string | null
          reviewer_name: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          offering_id?: string | null
          rating: number
          reviewer_avatar?: string | null
          reviewer_name: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          offering_id?: string | null
          rating?: number
          reviewer_avatar?: string | null
          reviewer_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          action: string
          details: Json | null
          id: string
          performed_at: string
          performed_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          performed_at?: string
          performed_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          performed_at?: string
          performed_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          target_user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          facilitator_id: string
          id: string
          position: number
          priority: string | null
          status: string
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          assignee?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          facilitator_id: string
          id?: string
          position?: number
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          assignee?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          facilitator_id?: string
          id?: string
          position?: number
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          converted_at: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          notified_at: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          notified_at?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          notified_at?: string | null
        }
        Relationships: []
      }
      web_vitals_events: {
        Row: {
          client_token: string | null
          created_at: string
          delta: number | null
          id: string
          ip_hash: string | null
          metric_id: string | null
          name: string
          navigation_type: string | null
          page_path: string | null
          page_url: string | null
          rating: string | null
          user_agent: string | null
          value: number
        }
        Insert: {
          client_token?: string | null
          created_at?: string
          delta?: number | null
          id?: string
          ip_hash?: string | null
          metric_id?: string | null
          name: string
          navigation_type?: string | null
          page_path?: string | null
          page_url?: string | null
          rating?: string | null
          user_agent?: string | null
          value: number
        }
        Update: {
          client_token?: string | null
          created_at?: string
          delta?: number | null
          id?: string
          ip_hash?: string | null
          metric_id?: string | null
          name?: string
          navigation_type?: string | null
          page_path?: string | null
          page_url?: string | null
          rating?: string | null
          user_agent?: string | null
          value?: number
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          client_name: string
          client_phone: string
          client_phone_hash: string | null
          created_at: string | null
          facilitator_id: string
          id: string
          last_message_at: string | null
          session_type: string
          status: string
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          client_name: string
          client_phone: string
          client_phone_hash?: string | null
          created_at?: string | null
          facilitator_id: string
          id?: string
          last_message_at?: string | null
          session_type?: string
          status?: string
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          client_phone?: string
          client_phone_hash?: string | null
          created_at?: string | null
          facilitator_id?: string
          id?: string
          last_message_at?: string | null
          session_type?: string
          status?: string
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          auto_followup_24h: boolean | null
          auto_followup_48h: boolean | null
          auto_followup_7d: boolean | null
          created_at: string | null
          facilitator_id: string
          group_session_prompt: string | null
          id: string
          is_enabled: boolean | null
          personal_session_prompt: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          auto_followup_24h?: boolean | null
          auto_followup_48h?: boolean | null
          auto_followup_7d?: boolean | null
          created_at?: string | null
          facilitator_id: string
          group_session_prompt?: string | null
          id?: string
          is_enabled?: boolean | null
          personal_session_prompt?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          auto_followup_24h?: boolean | null
          auto_followup_48h?: boolean | null
          auto_followup_7d?: boolean | null
          created_at?: string | null
          facilitator_id?: string
          group_session_prompt?: string | null
          id?: string
          is_enabled?: boolean | null
          personal_session_prompt?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_settings_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          expertise: string | null
          full_name: string | null
          id: string | null
          location: string | null
          onboarding_completed: boolean | null
          professional_title: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          expertise?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          professional_title?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          expertise?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          professional_title?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_booking_pii: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      decrypt_pii: { Args: { encrypted_text: string }; Returns: string }
      delete_client_booking_data: {
        Args: { p_client_email: string }
        Returns: undefined
      }
      encrypt_pii: { Args: { plaintext: string }; Returns: string }
      get_my_bookings: {
        Args: never
        Returns: {
          booking_date: string
          booking_time: string
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          duration: number
          facilitator_id: string
          id: string
          notes: string
          offering_id: string
          payment_status: string
          status: string
        }[]
      }
      get_my_whatsapp_conversations: {
        Args: never
        Returns: {
          client_name: string
          client_phone: string
          client_phone_hash: string
          created_at: string
          facilitator_id: string
          id: string
          last_message_at: string
          session_type: string
          status: string
          unread_count: number
          updated_at: string
        }[]
      }
      get_offering_remaining_spots: {
        Args: { p_offering_id: string }
        Returns: number
      }
      get_or_create_whatsapp_conversation: {
        Args: {
          p_client_name: string
          p_client_phone: string
          p_session_type?: string
        }
        Returns: string
      }
      get_public_availability: {
        Args: { p_facilitator_id: string }
        Returns: {
          day_of_week: number
          end_time: string
          start_time: string
        }[]
      }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          banner_url: string
          bio: string
          expertise: string
          full_name: string
          id: string
          location: string
          professional_title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
