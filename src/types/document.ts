import { Database } from './database'

export type DocumentRow = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export interface DocumentUploadPayload {
  document_name: string
  file: File
}
