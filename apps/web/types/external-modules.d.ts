declare module 'pdf-parse' {
  interface PdfParseResult {
    text: string
  }

  export default function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>
}

declare module 'mammoth' {
  export function extractRawText(input: { buffer: Buffer }): Promise<{ value: string }>
}
