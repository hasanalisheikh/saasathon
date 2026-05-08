import type { DocumentType } from '@/types'

export const DOCUMENT_BUCKET = 'documents'
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'contract', label: 'Contract' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'rate_card', label: 'Rate card' },
  { value: 'brief', label: 'Brief' },
  { value: 'other', label: 'Other' },
]

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
}

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/markdown',
])

export function parseTags(value: FormDataEntryValue | string | null): string[] {
  if (!value) return []
  return String(value)
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 20)
}

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export function inferMimeType(fileName: string, mimeType: string): string {
  if (mimeType && ALLOWED_DOCUMENT_MIME_TYPES.has(mimeType)) return mimeType
  return MIME_BY_EXTENSION[getFileExtension(fileName)] ?? mimeType
}

export function isAllowedDocument(fileName: string, mimeType: string): boolean {
  const inferred = inferMimeType(fileName, mimeType)
  return ALLOWED_DOCUMENT_MIME_TYPES.has(inferred)
}

export function safeFileName(fileName: string): string {
  const cleaned = fileName
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return cleaned || 'document'
}

export async function extractDocumentText(params: {
  buffer: Buffer
  fileName: string
  mimeType: string
}): Promise<string> {
  const extension = getFileExtension(params.fileName)
  const mimeType = inferMimeType(params.fileName, params.mimeType)

  if (
    mimeType === 'text/plain'
    || mimeType.includes('markdown')
    || extension === 'md'
    || extension === 'markdown'
  ) {
    return normalizeExtractedText(params.buffer.toString('utf8'))
  }

  if (mimeType === 'application/pdf' || extension === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default
    const result = await pdfParse(params.buffer)
    return normalizeExtractedText(result.text)
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || extension === 'docx'
  ) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer: params.buffer })
    return normalizeExtractedText(result.value)
  }

  throw new Error('Unsupported document type')
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
