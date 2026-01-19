import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'

interface TranscriptSegment {
  text: string
  startTime: number
  endTime: number
  confidence?: number
  speaker?: string
}

interface Transcript {
  provider: string
  fullText: string
  language: string
  confidence?: number
  wordCount: number
  segments: TranscriptSegment[]
}

/**
 * Export transcript as plain text
 */
export function exportAsText(transcript: Transcript, filename: string = 'transcript.txt') {
  let content = `Transcript - ${transcript.provider}\n`
  content += `Language: ${transcript.language}\n`
  content += `Word Count: ${transcript.wordCount}\n`
  if (transcript.confidence) {
    content += `Confidence: ${(transcript.confidence * 100).toFixed(1)}%\n`
  }
  content += `\n${'-'.repeat(80)}\n\n`

  // Add full text
  content += transcript.fullText

  // Add timestamped segments if available
  if (transcript.segments.length > 0) {
    content += `\n\n${'-'.repeat(80)}\n`
    content += `Timestamped Segments\n`
    content += `${'-'.repeat(80)}\n\n`

    transcript.segments.forEach((segment) => {
      const timestamp = formatTimestamp(segment.startTime)
      const speaker = segment.speaker ? `[${segment.speaker}] ` : ''
      content += `[${timestamp}] ${speaker}${segment.text}\n`
    })
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

/**
 * Export transcript as JSON
 */
export function exportAsJSON(transcript: Transcript, filename: string = 'transcript.json') {
  const json = JSON.stringify(transcript, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  saveAs(blob, filename)
}

/**
 * Export transcript as CSV
 */
export function exportAsCSV(transcript: Transcript, filename: string = 'transcript.csv') {
  let csv = 'Start Time,End Time,Speaker,Text,Confidence\n'

  transcript.segments.forEach((segment) => {
    const row = [
      segment.startTime.toFixed(2),
      segment.endTime.toFixed(2),
      segment.speaker || '',
      `"${segment.text.replace(/"/g, '""')}"`, // Escape quotes
      segment.confidence?.toFixed(4) || '',
    ]
    csv += row.join(',') + '\n'
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, filename)
}

/**
 * Export transcript as PDF
 */
export function exportAsPDF(transcript: Transcript, filename: string = 'transcript.pdf') {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const lineHeight = 7
  let y = margin

  // Helper to add new page if needed
  const checkPageBreak = () => {
    if (y > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Transcript Report', margin, y)
  y += 10

  // Metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Provider: ${transcript.provider}`, margin, y)
  y += lineHeight
  doc.text(`Language: ${transcript.language}`, margin, y)
  y += lineHeight
  doc.text(`Word Count: ${transcript.wordCount}`, margin, y)
  y += lineHeight

  if (transcript.confidence) {
    doc.text(`Confidence: ${(transcript.confidence * 100).toFixed(1)}%`, margin, y)
    y += lineHeight
  }

  y += 5
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // Full Text
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Full Transcript', margin, y)
  y += lineHeight

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const textLines = doc.splitTextToSize(transcript.fullText, pageWidth - 2 * margin)
  textLines.forEach((line: string) => {
    checkPageBreak()
    doc.text(line, margin, y)
    y += lineHeight
  })

  // Timestamped Segments
  if (transcript.segments.length > 0) {
    y += 10
    checkPageBreak()

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Timestamped Segments', margin, y)
    y += lineHeight + 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    transcript.segments.forEach((segment) => {
      checkPageBreak()

      const timestamp = formatTimestamp(segment.startTime)
      const speaker = segment.speaker ? `[${segment.speaker}] ` : ''
      const header = `[${timestamp}] ${speaker}`

      doc.setFont('helvetica', 'bold')
      doc.text(header, margin, y)
      y += lineHeight

      doc.setFont('helvetica', 'normal')
      const segmentLines = doc.splitTextToSize(segment.text, pageWidth - 2 * margin)
      segmentLines.forEach((line: string) => {
        checkPageBreak()
        doc.text(line, margin, y)
        y += lineHeight
      })

      y += 2 // Small gap between segments
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  doc.save(filename)
}

/**
 * Export comparison of multiple transcripts as CSV
 */
export function exportComparisonAsCSV(
  transcripts: Transcript[],
  filename: string = 'comparison.csv'
) {
  let csv = 'Provider,Language,Word Count,Confidence,Full Text\n'

  transcripts.forEach((transcript) => {
    const row = [
      transcript.provider,
      transcript.language,
      transcript.wordCount.toString(),
      transcript.confidence ? (transcript.confidence * 100).toFixed(1) + '%' : 'N/A',
      `"${transcript.fullText.replace(/"/g, '""')}"`,
    ]
    csv += row.join(',') + '\n'
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, filename)
}

/**
 * Format seconds to MM:SS timestamp
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
