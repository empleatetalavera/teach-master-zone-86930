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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_submissions: {
        Row: {
          activity_id: string
          attempt_number: number | null
          created_at: string | null
          enrollment_id: string
          feedback: string | null
          file_name: string | null
          file_path: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          status: string | null
          submission_text: string | null
          submission_url: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          attempt_number?: number | null
          created_at?: string | null
          enrollment_id: string
          feedback?: string | null
          file_name?: string | null
          file_path?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: string | null
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          attempt_number?: number | null
          created_at?: string | null
          enrollment_id?: string
          feedback?: string | null
          file_name?: string | null
          file_path?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: string | null
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_submissions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "development_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          assistant_response: string
          context_course_id: string | null
          context_module_id: string | null
          context_page: string | null
          created_at: string | null
          feedback_text: string | null
          id: string
          response_time_ms: number | null
          user_id: string
          user_message: string
          user_role: Database["public"]["Enums"]["app_role"] | null
          was_helpful: boolean | null
        }
        Insert: {
          assistant_response: string
          context_course_id?: string | null
          context_module_id?: string | null
          context_page?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          response_time_ms?: number | null
          user_id: string
          user_message: string
          user_role?: Database["public"]["Enums"]["app_role"] | null
          was_helpful?: boolean | null
        }
        Update: {
          assistant_response?: string
          context_course_id?: string | null
          context_module_id?: string | null
          context_page?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          response_time_ms?: number | null
          user_id?: string
          user_message?: string
          user_role?: Database["public"]["Enums"]["app_role"] | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_context_course_id_fkey"
            columns: ["context_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_context_module_id_fkey"
            columns: ["context_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_settings: {
        Row: {
          created_at: string | null
          enable_email_alerts: boolean | null
          enable_push_alerts: boolean | null
          id: string
          inactive_days_threshold: number | null
          low_progress_threshold: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enable_email_alerts?: boolean | null
          enable_push_alerts?: boolean | null
          id?: string
          inactive_days_threshold?: number | null
          low_progress_threshold?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enable_email_alerts?: boolean | null
          enable_push_alerts?: boolean | null
          id?: string
          inactive_days_threshold?: number | null
          low_progress_threshold?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          communication_type: Database["public"]["Enums"]["communication_type"]
          course_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          parent_id: string | null
          read_at: string | null
          receiver_id: string | null
          sender_id: string
          subject: string | null
        }
        Insert: {
          communication_type: Database["public"]["Enums"]["communication_type"]
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          parent_id?: string | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id: string
          subject?: string | null
        }
        Update: {
          communication_type?: Database["public"]["Enums"]["communication_type"]
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          parent_id?: string | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
        ]
      }
      content_interactions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          enrollment_id: string
          id: string
          interaction_type: string
          metadata: Json | null
          module_id: string
          sequence_position: number | null
          time_spent_seconds: number
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          module_id: string
          sequence_position?: number | null
          time_spent_seconds?: number
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          module_id?: string
          sequence_position?: number | null
          time_spent_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_interactions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_interactions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      content_orders: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          content_type: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          price: number | null
          priority: string | null
          requested_by: string | null
          status: string
          title: string
          training_center_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          content_type: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          priority?: string | null
          requested_by?: string | null
          status?: string
          title: string
          training_center_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          priority?: string | null
          requested_by?: string | null
          status?: string
          title?: string
          training_center_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_orders_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      course_events: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          is_mandatory: boolean | null
          location: string | null
          meeting_url: string | null
          reminder_sent: boolean | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time?: string | null
          event_type: string
          id?: string
          is_mandatory?: boolean | null
          location?: string | null
          meeting_url?: string | null
          reminder_sent?: boolean | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_mandatory?: boolean | null
          location?: string | null
          meeting_url?: string | null
          reminder_sent?: boolean | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          level: string | null
          thumbnail_url: string | null
          title: string
          training_center_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          thumbnail_url?: string | null
          title: string
          training_center_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          thumbnail_url?: string | null
          title?: string
          training_center_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      development_activities: {
        Row: {
          allow_late_submission: boolean | null
          allowed_file_types: string[] | null
          course_id: string
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          late_penalty_percentage: number | null
          max_file_size_mb: number | null
          max_score: number | null
          module_id: string | null
          submission_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_late_submission?: boolean | null
          allowed_file_types?: string[] | null
          course_id: string
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          late_penalty_percentage?: number | null
          max_file_size_mb?: number | null
          max_score?: number | null
          module_id?: string | null
          submission_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_late_submission?: boolean | null
          allowed_file_types?: string[] | null
          course_id?: string
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          late_penalty_percentage?: number | null
          max_file_size_mb?: number | null
          max_score?: number | null
          module_id?: string | null
          submission_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "development_activities_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_activities_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_attempts: {
        Row: {
          answers: Json | null
          attempt_number: number
          completed_at: string | null
          created_at: string | null
          enrollment_id: string
          evaluation_id: string
          id: string
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["evaluation_status"]
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempt_number?: number
          completed_at?: string | null
          created_at?: string | null
          enrollment_id: string
          evaluation_id: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["evaluation_status"]
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempt_number?: number
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string
          evaluation_id?: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["evaluation_status"]
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_attempts_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_attempts: number | null
          module_id: string | null
          passing_score: number
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          module_id?: string | null
          passing_score?: number
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          module_id?: string | null
          passing_score?: number
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "course_events"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_solution: boolean | null
          parent_reply_id: string | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_solution?: boolean | null
          parent_reply_id?: string | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_solution?: boolean | null
          parent_reply_id?: string | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          created_by: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          module_id: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          created_by: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          module_id?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          module_id?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      inspector_users: {
        Row: {
          access_log: Json | null
          created_at: string | null
          granted_by: string
          id: string
          inspector_code: string
          is_active: boolean | null
          organization: string
          user_id: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          access_log?: Json | null
          created_at?: string | null
          granted_by: string
          id?: string
          inspector_code: string
          is_active?: boolean | null
          organization: string
          user_id: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          access_log?: Json | null
          created_at?: string | null
          granted_by?: string
          id?: string
          inspector_code?: string
          is_active?: boolean | null
          organization?: string
          user_id?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          license_type: string
          max_courses: number
          max_students: number
          max_teachers: number
          notes: string | null
          price: number | null
          start_date: string
          training_center_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          license_type: string
          max_courses?: number
          max_students?: number
          max_teachers?: number
          notes?: string | null
          price?: number | null
          start_date: string
          training_center_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          license_type?: string
          max_courses?: number
          max_students?: number
          max_teachers?: number
          notes?: string | null
          price?: number | null
          start_date?: string
          training_center_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempt_time: string
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempt_time?: string
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          attempt_time?: string
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          enrollment_id: string
          id: string
          last_position: string | null
          module_id: string
          notes: string | null
          time_spent_minutes: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          enrollment_id: string
          id?: string
          last_position?: string | null
          module_id: string
          notes?: string | null
          time_spent_minutes?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          last_position?: string | null
          module_id?: string
          notes?: string | null
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_scorm_content: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          module_id: string
          order_index: number
          scorm_package_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          module_id: string
          order_index?: number
          scorm_package_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          module_id?: string
          order_index?: number
          scorm_package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_scorm_content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_scorm_content_scorm_package_id_fkey"
            columns: ["scorm_package_id"]
            isOneToOne: false
            referencedRelation: "scorm_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          related_course_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_course_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_course_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_course_id_fkey"
            columns: ["related_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          dni_nie: string | null
          full_name: string | null
          gender: string | null
          id: string
          nationality: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["profile_visibility"] | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          dni_nie?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["profile_visibility"] | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          dni_nie?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["profile_visibility"] | null
        }
        Relationships: []
      }
      quick_response_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          name: string
          subject: string
          template_type: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          name: string
          subject: string
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      scorm_packages: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          manifest_data: Json | null
          scorm_version: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          manifest_data?: Json | null
          scorm_version?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          manifest_data?: Json | null
          scorm_version?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      scorm_progress: {
        Row: {
          cmi_data: Json | null
          completion_status: string | null
          created_at: string | null
          enrollment_id: string
          id: string
          last_accessed_at: string | null
          lesson_status: string | null
          module_id: string
          score_max: number | null
          score_min: number | null
          score_raw: number | null
          scorm_package_id: string
          session_time: string | null
          success_status: string | null
          suspend_data: string | null
          total_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cmi_data?: Json | null
          completion_status?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          last_accessed_at?: string | null
          lesson_status?: string | null
          module_id: string
          score_max?: number | null
          score_min?: number | null
          score_raw?: number | null
          scorm_package_id: string
          session_time?: string | null
          success_status?: string | null
          suspend_data?: string | null
          total_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cmi_data?: Json | null
          completion_status?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          last_accessed_at?: string | null
          lesson_status?: string | null
          module_id?: string
          score_max?: number | null
          score_min?: number | null
          score_raw?: number | null
          scorm_package_id?: string
          session_time?: string | null
          success_status?: string | null
          suspend_data?: string | null
          total_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorm_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorm_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorm_progress_scorm_package_id_fkey"
            columns: ["scorm_package_id"]
            isOneToOne: false
            referencedRelation: "scorm_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_employment_data: {
        Row: {
          company_name: string | null
          created_at: string | null
          education_level: string | null
          employment_status: string
          id: string
          job_position: string | null
          professional_sector: string | null
          updated_at: string | null
          user_id: string
          work_experience_years: number | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          education_level?: string | null
          employment_status: string
          id?: string
          job_position?: string | null
          professional_sector?: string | null
          updated_at?: string | null
          user_id: string
          work_experience_years?: number | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          education_level?: string | null
          employment_status?: string
          id?: string
          job_position?: string | null
          professional_sector?: string | null
          updated_at?: string | null
          user_id?: string
          work_experience_years?: number | null
        }
        Relationships: []
      }
      student_support_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal_note: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "student_support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      student_support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          id: string
          message: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          student_id: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          student_id: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          student_id?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_training_history: {
        Row: {
          certificate_number: string | null
          course_name: string
          created_at: string | null
          end_date: string | null
          hours: number | null
          id: string
          is_sepe_certified: boolean | null
          start_date: string | null
          training_center: string | null
          user_id: string
        }
        Insert: {
          certificate_number?: string | null
          course_name: string
          created_at?: string | null
          end_date?: string | null
          hours?: number | null
          id?: string
          is_sepe_certified?: boolean | null
          start_date?: string | null
          training_center?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string | null
          course_name?: string
          created_at?: string | null
          end_date?: string | null
          hours?: number | null
          id?: string
          is_sepe_certified?: boolean | null
          start_date?: string | null
          training_center?: string | null
          user_id?: string
        }
        Relationships: []
      }
      teacher_student_contacts: {
        Row: {
          contact_type: string
          course_id: string
          created_at: string | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          notes: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          contact_type: string
          course_id: string
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          notes: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          contact_type?: string
          course_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          notes?: string
          student_id?: string
          subject?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_student_contacts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_centers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          footer_text: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          official_badge: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          footer_text?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          official_badge?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          footer_text?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          official_badge?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          course_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          ip_address: string | null
          module_id: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          started_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          module_id?: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          started_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          module_id?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          started_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_old_login_attempts: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_locked: {
        Args: { p_email: string }
        Returns: {
          is_locked: boolean
          unlock_time: string
        }[]
      }
      no_roles_exist: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "inspector"
      communication_type: "message" | "forum" | "chat" | "video_call"
      evaluation_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "passed"
        | "failed"
      profile_visibility: "public" | "private" | "authenticated"
      session_type:
        | "login"
        | "logout"
        | "course_view"
        | "module_view"
        | "evaluation"
        | "communication"
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
      app_role: ["admin", "teacher", "student", "inspector"],
      communication_type: ["message", "forum", "chat", "video_call"],
      evaluation_status: [
        "not_started",
        "in_progress",
        "completed",
        "passed",
        "failed",
      ],
      profile_visibility: ["public", "private", "authenticated"],
      session_type: [
        "login",
        "logout",
        "course_view",
        "module_view",
        "evaluation",
        "communication",
      ],
    },
  },
} as const
