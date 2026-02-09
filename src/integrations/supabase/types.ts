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
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      center_contracts: {
        Row: {
          contract_content: string
          contract_type: string
          contract_version: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          signature_data: string | null
          signed_at: string
          signed_by: string
          signer_dni: string
          signer_email: string
          signer_name: string
          signer_position: string
          training_center_id: string
          user_agent: string | null
        }
        Insert: {
          contract_content: string
          contract_type?: string
          contract_version?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          signature_data?: string | null
          signed_at?: string
          signed_by: string
          signer_dni: string
          signer_email: string
          signer_name: string
          signer_position: string
          training_center_id: string
          user_agent?: string | null
        }
        Update: {
          contract_content?: string
          contract_type?: string
          contract_version?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          signature_data?: string | null
          signed_at?: string
          signed_by?: string
          signer_dni?: string
          signer_email?: string
          signer_name?: string
          signer_position?: string
          training_center_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_contracts_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
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
      course_annexes: {
        Row: {
          annex_type: string
          course_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          annex_type: string
          course_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          annex_type?: string
          course_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_annexes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_center_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          course_id: string
          id: string
          is_active: boolean | null
          notes: string | null
          training_center_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          course_id: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          training_center_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          course_id?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          training_center_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_center_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_center_assignments_training_center_id_fkey"
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
          boe_url: string | null
          campus_guide_url: string | null
          category: string | null
          concept_map_url: string | null
          course_code: string | null
          course_type: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          enable_grade_breakdown: boolean | null
          end_date: string | null
          ficha_certificado_url: string | null
          id: string
          internship_hours: number | null
          is_active: boolean | null
          level: string | null
          max_students: number | null
          modality: string | null
          objectives: string | null
          presential_hours: number | null
          professional_family: string | null
          qualification_level: number | null
          scope: string | null
          specific_objectives: Json | null
          start_date: string | null
          student_guide_pdf_url: string | null
          support_email: string | null
          support_phone: string | null
          thumbnail_url: string | null
          title: string
          training_center_id: string | null
          training_program_pdf_url: string | null
          tutor_cv_url: string | null
          tutor_guide_pdf_url: string | null
          tutor_id: string | null
          tutorial_plan: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          boe_url?: string | null
          campus_guide_url?: string | null
          category?: string | null
          concept_map_url?: string | null
          course_code?: string | null
          course_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          enable_grade_breakdown?: boolean | null
          end_date?: string | null
          ficha_certificado_url?: string | null
          id?: string
          internship_hours?: number | null
          is_active?: boolean | null
          level?: string | null
          max_students?: number | null
          modality?: string | null
          objectives?: string | null
          presential_hours?: number | null
          professional_family?: string | null
          qualification_level?: number | null
          scope?: string | null
          specific_objectives?: Json | null
          start_date?: string | null
          student_guide_pdf_url?: string | null
          support_email?: string | null
          support_phone?: string | null
          thumbnail_url?: string | null
          title: string
          training_center_id?: string | null
          training_program_pdf_url?: string | null
          tutor_cv_url?: string | null
          tutor_guide_pdf_url?: string | null
          tutor_id?: string | null
          tutorial_plan?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          boe_url?: string | null
          campus_guide_url?: string | null
          category?: string | null
          concept_map_url?: string | null
          course_code?: string | null
          course_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          enable_grade_breakdown?: boolean | null
          end_date?: string | null
          ficha_certificado_url?: string | null
          id?: string
          internship_hours?: number | null
          is_active?: boolean | null
          level?: string | null
          max_students?: number | null
          modality?: string | null
          objectives?: string | null
          presential_hours?: number | null
          professional_family?: string | null
          qualification_level?: number | null
          scope?: string | null
          specific_objectives?: Json | null
          start_date?: string | null
          student_guide_pdf_url?: string | null
          support_email?: string | null
          support_phone?: string | null
          thumbnail_url?: string | null
          title?: string
          training_center_id?: string | null
          training_program_pdf_url?: string | null
          tutor_cv_url?: string | null
          tutor_guide_pdf_url?: string | null
          tutor_id?: string | null
          tutorial_plan?: string | null
          updated_at?: string | null
          video_url?: string | null
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
          formative_unit_id: string | null
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
          formative_unit_id?: string | null
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
          formative_unit_id?: string | null
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
            foreignKeyName: "development_activities_formative_unit_id_fkey"
            columns: ["formative_unit_id"]
            isOneToOne: false
            referencedRelation: "formative_units"
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
          formative_unit_id: string | null
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
          formative_unit_id?: string | null
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
          formative_unit_id?: string | null
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
            foreignKeyName: "evaluations_formative_unit_id_fkey"
            columns: ["formative_unit_id"]
            isOneToOne: false
            referencedRelation: "formative_units"
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
      formative_units: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          module_id: string
          objectives: string | null
          order_index: number
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          module_id: string
          objectives?: string | null
          order_index?: number
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string
          objectives?: string | null
          order_index?: number
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formative_units_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
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
      invoice_templates: {
        Row: {
          color_scheme: Json | null
          created_at: string | null
          description: string | null
          footer_text: string | null
          header_text: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          logo_url: string | null
          name: string
          show_logo: boolean | null
          show_qr_code: boolean | null
          template_data: Json
          training_center_id: string | null
          updated_at: string | null
        }
        Insert: {
          color_scheme?: Json | null
          created_at?: string | null
          description?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          show_logo?: boolean | null
          show_qr_code?: boolean | null
          template_data?: Json
          training_center_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color_scheme?: Json | null
          created_at?: string | null
          description?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          show_logo?: boolean | null
          show_qr_code?: boolean | null
          template_data?: Json
          training_center_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_templates_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          invoice_data: Json | null
          invoice_number: string
          issue_date: string
          license_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          status: string
          tax_amount: number | null
          total_amount: number
          training_center_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          invoice_data?: Json | null
          invoice_number: string
          issue_date?: string
          license_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          tax_amount?: number | null
          total_amount: number
          training_center_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_data?: Json | null
          invoice_number?: string
          issue_date?: string
          license_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          training_center_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
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
      live_sessions: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string
          description: string | null
          duration_minutes: number
          id: string
          recording_url: string | null
          scheduled_date: string
          session_url: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_minutes?: number
          id?: string
          recording_url?: string | null
          scheduled_date: string
          session_url: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          recording_url?: string | null
          scheduled_date?: string
          session_url?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      module_content: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          embed_url: string | null
          external_url: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          module_id: string
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          embed_url?: string | null
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          module_id: string
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          embed_url?: string | null
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          module_id?: string
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
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
          concept_map_url: string | null
          content: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_date: string | null
          forum_enabled: boolean | null
          id: string
          is_active: boolean | null
          is_visible_to_students: boolean | null
          objectives: string | null
          order_index: number
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          concept_map_url?: string | null
          content?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_date?: string | null
          forum_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          is_visible_to_students?: boolean | null
          objectives?: string | null
          order_index: number
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          concept_map_url?: string | null
          content?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_date?: string | null
          forum_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          is_visible_to_students?: boolean | null
          objectives?: string | null
          order_index?: number
          start_date?: string | null
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
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          order_details: Json | null
          payment_method: string
          payment_status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_details?: Json | null
          payment_method: string
          payment_status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_details?: Json | null
          payment_method?: string
          payment_status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          notes: string | null
          payment_date: string
          payment_method: string
          processed_by: string | null
          training_center_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          notes?: string | null
          payment_date?: string
          payment_method: string
          processed_by?: string | null
          training_center_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          processed_by?: string | null
          training_center_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      presential_grades: {
        Row: {
          course_id: string
          created_at: string | null
          enrollment_id: string
          feedback: string | null
          grade_type: string
          graded_at: string | null
          graded_by: string | null
          id: string
          max_score: number | null
          notes: string | null
          score: number | null
          session_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          enrollment_id: string
          feedback?: string | null
          grade_type: string
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          score?: number | null
          session_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          enrollment_id?: string
          feedback?: string | null
          grade_type?: string
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          score?: number | null
          session_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presential_grades_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presential_grades_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          duration_months: number
          features: Json | null
          id: string
          is_active: boolean | null
          license_type: string
          max_courses: number
          max_students: number
          max_teachers: number
          name: string
          price_per_course: number | null
          price_per_student: number | null
          price_per_teacher: number | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          duration_months?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          license_type: string
          max_courses: number
          max_students: number
          max_teachers: number
          name: string
          price_per_course?: number | null
          price_per_student?: number | null
          price_per_teacher?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          duration_months?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          license_type?: string
          max_courses?: number
          max_students?: number
          max_teachers?: number
          name?: string
          price_per_course?: number | null
          price_per_student?: number | null
          price_per_teacher?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          product_type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          product_type: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          product_type?: string
          updated_at?: string
        }
        Relationships: []
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
          training_center_id: string | null
          updated_at: string | null
          username: string | null
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
          training_center_id?: string | null
          updated_at?: string | null
          username?: string | null
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
          training_center_id?: string | null
          updated_at?: string | null
          username?: string | null
          visibility?: Database["public"]["Enums"]["profile_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
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
      report_audit_log: {
        Row: {
          course_id: string | null
          file_format: string
          filters_applied: Json | null
          generated_at: string
          generated_by: string
          id: string
          metadata: Json | null
          report_name: string
          report_type: string
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          file_format?: string
          filters_applied?: Json | null
          generated_at?: string
          generated_by: string
          id?: string
          metadata?: Json | null
          report_name: string
          report_type: string
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          file_format?: string
          filters_applied?: Json | null
          generated_at?: string
          generated_by?: string
          id?: string
          metadata?: Json | null
          report_name?: string
          report_type?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_audit_log_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
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
      sionline_global_config: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_connected: boolean | null
          last_sync: string | null
          password_hash: string | null
          precio_trimestral: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync?: string | null
          password_hash?: string | null
          precio_trimestral?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync?: string | null
          password_hash?: string | null
          precio_trimestral?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sionline_settings: {
        Row: {
          api_key: string | null
          created_at: string | null
          credenciales_seguimiento: string | null
          enabled: boolean | null
          estado: string | null
          fecha_alta: string | null
          fecha_renovacion: string | null
          id: string
          notas: string | null
          training_center_id: string
          updated_at: string | null
          url_seguimiento: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          credenciales_seguimiento?: string | null
          enabled?: boolean | null
          estado?: string | null
          fecha_alta?: string | null
          fecha_renovacion?: string | null
          id?: string
          notas?: string | null
          training_center_id: string
          updated_at?: string | null
          url_seguimiento?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          credenciales_seguimiento?: string | null
          enabled?: boolean | null
          estado?: string | null
          fecha_alta?: string | null
          fecha_renovacion?: string | null
          id?: string
          notas?: string | null
          training_center_id?: string
          updated_at?: string | null
          url_seguimiento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sionline_settings_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: true
            referencedRelation: "training_centers"
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
      tax_configurations: {
        Row: {
          applies_to: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_inclusive: boolean | null
          metadata: Json | null
          name: string
          rate: number
          start_date: string | null
          tax_type: string
          training_center_id: string | null
          updated_at: string | null
        }
        Insert: {
          applies_to?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_inclusive?: boolean | null
          metadata?: Json | null
          name: string
          rate: number
          start_date?: string | null
          tax_type: string
          training_center_id?: string | null
          updated_at?: string | null
        }
        Update: {
          applies_to?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_inclusive?: boolean | null
          metadata?: Json | null
          name?: string
          rate?: number
          start_date?: string | null
          tax_type?: string
          training_center_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_configurations_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          certifications: Json | null
          created_at: string | null
          education: string | null
          experience_years: number | null
          id: string
          languages: Json | null
          specializations: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certifications?: Json | null
          created_at?: string | null
          education?: string | null
          experience_years?: number | null
          id?: string
          languages?: Json | null
          specializations?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certifications?: Json | null
          created_at?: string | null
          education?: string | null
          experience_years?: number | null
          id?: string
          languages?: Json | null
          specializations?: Json | null
          updated_at?: string | null
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
          address_line: string | null
          campus_url: string | null
          census_code: string | null
          cif: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          custom_domain: string | null
          email: string | null
          footer_text: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          official_badge: string | null
          phone: string | null
          postal_code: string | null
          primary_color: string | null
          province: string | null
          region: string | null
          secondary_color: string | null
          sepe_registry_number: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_line?: string | null
          campus_url?: string | null
          census_code?: string | null
          cif?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_domain?: string | null
          email?: string | null
          footer_text?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          official_badge?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          province?: string | null
          region?: string | null
          secondary_color?: string | null
          sepe_registry_number?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_line?: string | null
          campus_url?: string | null
          census_code?: string | null
          cif?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_domain?: string | null
          email?: string | null
          footer_text?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          official_badge?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          province?: string | null
          region?: string | null
          secondary_color?: string | null
          sepe_registry_number?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tutor_guide_sections: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number
          resources: Json | null
          section_key: string
          section_title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          resources?: Json | null
          section_key: string
          section_title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          resources?: Json | null
          section_key?: string
          section_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_guide_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_content_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          content_id: string
          created_at: string | null
          enrollment_id: string
          id: string
          last_position: string | null
          progress_percentage: number | null
          time_spent_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          content_id: string
          created_at?: string | null
          enrollment_id: string
          id?: string
          last_position?: string | null
          progress_percentage?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          content_id?: string
          created_at?: string | null
          enrollment_id?: string
          id?: string
          last_position?: string | null
          progress_percentage?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "unit_interactive_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_content_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_interactive_content: {
        Row: {
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          file_path: string | null
          formative_unit_id: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_type: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_path?: string | null
          formative_unit_id: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_path?: string | null
          formative_unit_id?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_interactive_content_formative_unit_id_fkey"
            columns: ["formative_unit_id"]
            isOneToOne: false
            referencedRelation: "formative_units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_progress: {
        Row: {
          activities_progress: number | null
          content_progress: number | null
          created_at: string
          enrollment_id: string
          formative_unit_id: string
          id: string
          last_accessed_at: string | null
          overall_progress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activities_progress?: number | null
          content_progress?: number | null
          created_at?: string
          enrollment_id: string
          formative_unit_id: string
          id?: string
          last_accessed_at?: string | null
          overall_progress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activities_progress?: number | null
          content_progress?: number | null
          created_at?: string
          enrollment_id?: string
          formative_unit_id?: string
          id?: string
          last_accessed_at?: string | null
          overall_progress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_progress_formative_unit_id_fkey"
            columns: ["formative_unit_id"]
            isOneToOne: false
            referencedRelation: "formative_units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_syllabus_slides: {
        Row: {
          buttons: Json | null
          checklist_items: Json | null
          content: string | null
          created_at: string | null
          created_by: string | null
          formative_unit_id: string
          highlight_boxes: Json | null
          id: string
          images: Json | null
          is_active: boolean | null
          key_terms: string[] | null
          objectives: Json | null
          order_index: number
          quiz_data: Json | null
          section_title: string | null
          slide_type: string
          table_data: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          buttons?: Json | null
          checklist_items?: Json | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          formative_unit_id: string
          highlight_boxes?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          key_terms?: string[] | null
          objectives?: Json | null
          order_index?: number
          quiz_data?: Json | null
          section_title?: string | null
          slide_type?: string
          table_data?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          buttons?: Json | null
          checklist_items?: Json | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          formative_unit_id?: string
          highlight_boxes?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          key_terms?: string[] | null
          objectives?: Json | null
          order_index?: number
          quiz_data?: Json | null
          section_title?: string | null
          slide_type?: string
          table_data?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_syllabus_slides_formative_unit_id_fkey"
            columns: ["formative_unit_id"]
            isOneToOne: false
            referencedRelation: "formative_units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          training_center_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          training_center_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          training_center_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_training_center_id_fkey"
            columns: ["training_center_id"]
            isOneToOne: false
            referencedRelation: "training_centers"
            referencedColumns: ["id"]
          },
        ]
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
      get_email_by_username: {
        Args: { p_username: string }
        Returns: {
          email: string
        }[]
      }
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
      app_role:
        | "admin"
        | "teacher"
        | "student"
        | "inspector"
        | "auditor"
        | "super_admin"
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
      app_role: [
        "admin",
        "teacher",
        "student",
        "inspector",
        "auditor",
        "super_admin",
      ],
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
