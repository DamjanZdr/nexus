'use client'

import { WikiDocument } from '@/types/database'
import { RichTextEditor } from './RichTextEditor'
import { TableEditor } from './TableEditor'
import { WhiteboardEditor } from './WhiteboardEditor'

interface DocumentViewerProps {
  document: WikiDocument
  canEdit: boolean
  onUpdate: () => void
}

export function DocumentViewer({ document, canEdit, onUpdate }: DocumentViewerProps) {
  const documentType = document.document_type || 'rich-text'

  return (
    <div className="h-full w-full min-w-0">
      {documentType === 'table' && (
        <TableEditor document={document} canEdit={canEdit} onUpdate={onUpdate} />
      )}
      {documentType === 'whiteboard' && (
        <WhiteboardEditor document={document} canEdit={canEdit} onUpdate={onUpdate} />
      )}
      {documentType === 'rich-text' && (
        <RichTextEditor document={document} canEdit={canEdit} onUpdate={onUpdate} />
      )}
    </div>
  )
}
