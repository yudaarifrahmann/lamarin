import { Database } from './database'

export type GmailConnectionRow = Database['public']['Tables']['gmail_connections']['Row']
export type GmailConnectionInsert = Database['public']['Tables']['gmail_connections']['Insert']
export type GmailConnectionUpdate = Database['public']['Tables']['gmail_connections']['Update']

export interface GmailConnectionStatus {
  isConnected: boolean
  gmailEmail?: string
  connectedAt?: string
}

