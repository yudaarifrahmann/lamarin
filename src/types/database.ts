export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          id: string
          user_id: string
          sender_name: string
          sender_email: string
          sender_city: string | null
          default_subject: string | null
          default_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sender_name: string
          sender_email: string
          sender_city?: string | null
          default_subject?: string | null
          default_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sender_name?: string
          sender_email?: string
          sender_city?: string | null
          default_subject?: string | null
          default_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          user_id: string
          template_name: string
          subject: string
          message: string
          is_default: boolean
          layout_config?: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_name: string
          subject: string
          message: string
          is_default?: boolean
          layout_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_name?: string
          subject?: string
          message?: string
          is_default?: boolean
          layout_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          user_id: string
          document_name: string
          original_filename: string
          storage_path: string
          mime_type: string
          file_size: number
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_name: string
          original_filename: string
          storage_path: string
          mime_type: string
          file_size: number
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_name?: string
          original_filename?: string
          storage_path?: string
          mime_type?: string
          file_size?: number
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          id: string
          user_id: string
          recipient_email: string
          company_name: string
          position: string
          subject: string
          message: string
          selected_documents: Json
          resend_message_id: string | null
          status: 'queued' | 'sent' | 'failed' | 'delivered' | 'bounced'
          application_status: 'pending' | 'accepted' | 'rejected'
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient_email: string
          company_name: string
          position?: string
          subject: string
          message: string
          selected_documents?: Json
          resend_message_id?: string | null
          status?: 'queued' | 'sent' | 'failed' | 'delivered' | 'bounced'
          application_status?: 'pending' | 'accepted' | 'rejected'
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipient_email?: string
          company_name?: string
          position?: string
          subject?: string
          message?: string
          selected_documents?: Json
          resend_message_id?: string | null
          status?: 'queued' | 'sent' | 'failed' | 'delivered' | 'bounced'
          application_status?: 'pending' | 'accepted' | 'rejected'
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      gmail_connections: {
        Row: {
          id: string
          user_id: string
          gmail_email: string
          refresh_token_encrypted: string
          connected_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gmail_email: string
          refresh_token_encrypted: string
          connected_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gmail_email?: string
          refresh_token_encrypted?: string
          connected_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
