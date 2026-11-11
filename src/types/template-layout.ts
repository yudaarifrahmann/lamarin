export type BlockType =
  | 'date'
  | 'recipient'
  | 'salutation'
  | 'paragraph'
  | 'biodata'
  | 'closing'
  | 'signature'

export type AlignOption = 'left' | 'center' | 'right' | 'justify'
export type BiodataFormat = 'table' | 'inline'
export type PaperSize = 'a4' | 'letter'
export type FontFamily =
  | 'Arial'
  | 'Times New Roman'
  | 'Calibri'
  | 'Georgia'
  | 'Segoe UI'
  | 'Helvetica'
  | 'sans-serif'
  | 'serif'

export interface BiodataField {
  label: string
  value: string
}

export interface BlockStyle {
  fontSize?: number // in px
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  color?: string
  marginBottom?: number // in px
  biodataFormat?: BiodataFormat
  biodataFields?: BiodataField[]
  signaturePosition?: 'left' | 'center' | 'right'
}

export interface TemplateBlock {
  id: string
  type: BlockType
  content: string
  align: AlignOption
  style: BlockStyle
}

export interface PageSettings {
  paperSize: PaperSize
  maxWidth: number // in px (e.g. 680)
  marginTop: number // in px
  marginBottom: number // in px
  marginLeft: number // in px
  marginRight: number // in px
  fontFamily: FontFamily
  fontSize: number // in px (default 15)
  lineHeight: number // default 1.6
  textColor: string // default '#1f2937'
  backgroundColor: string // default '#ffffff'
  sectionSpacing: number // in px (default 16)
}

export interface TemplateLayoutConfig {
  version: 1
  pageSettings: PageSettings
  blocks: TemplateBlock[]
}

