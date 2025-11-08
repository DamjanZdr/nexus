<!-- Workspace-specific instructions for GitHub Copilot -->

## Project Overview
This is a Next.js 14 CRM frontend application with the following tech stack:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (for backend/database)

## Project Structure

### Directory Organization
```
app/(dashboard)/
├── home/                    # Dashboard home page
├── clients/                 # Client management
│   ├── components/          # Shared client components
│   ├── [id]/               # Individual client page
│   │   └── components/     # Client detail components
│   └── page.tsx
├── cases/                   # Case management
│   ├── components/          # Shared case components (if any)
│   ├── [id]/               # Individual case page
│   │   └── components/     # Case detail components
│   └── page.tsx
├── board/                   # Kanban board view
│   ├── components/          # Board-specific components
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   └── BoardHeader.tsx
│   └── page.tsx
├── settings/                # Settings page
└── layout.tsx

components/
├── layout/                  # Layout components
│   └── Navbar.tsx
├── ui/                      # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Select.tsx
└── shared/                  # Shared business components
    ├── DeleteConfirmModal.tsx
    ├── ErrorAlert.tsx
    └── LoadingSpinner.tsx

app/actions/                 # Server actions
├── auth.ts
├── cases.ts
├── clients.ts
├── comments.ts
├── notes.ts
├── assignees.ts
├── attachments.ts
└── phones.ts

types/                       # TypeScript types
└── database.ts

lib/                         # Utility functions
├── utils.ts
└── supabase/
    ├── client.ts
    └── server.ts
```

### Component Principles

#### Modularity
- **Small, focused components**: Each component should have a single responsibility
- **Composable**: Components should build on each other
- **Reusable**: Extract common patterns into shared components
- **Self-contained**: Components manage their own state when appropriate

#### File Organization
- **Feature-based folders**: Group components by feature/page
- **Shared components**: Place in `/components/shared` if used across multiple features
- **UI primitives**: Place in `/components/ui` for basic building blocks

#### Component Types
1. **Page Components** (`page.tsx`): Route handlers, data fetching
2. **Section Components**: Large page sections (e.g., `NotesSection`, `AttachmentsSection`)
3. **UI Components**: Reusable UI elements (e.g., `Button`, `Card`, `Modal`)
4. **Shared Components**: Business logic components used across features

## Development Guidelines
- Use TypeScript for all new files
- Follow Next.js App Router conventions (app directory)
- Use Tailwind CSS for styling
- Ensure all components are properly typed
- Use server components by default, client components only when needed
- Follow React and Next.js best practices

## Naming Conventions
- **Components**: PascalCase (e.g., `ClientsTable.tsx`)
- **Actions**: camelCase (e.g., `addClient`)
- **Types/Interfaces**: PascalCase (e.g., `Client`, `CaseWithRelations`)
- **Utilities**: camelCase (e.g., `formatDate`)

## Environment Variables
- Supabase credentials are stored in .env.local
- Never commit .env.local to version control
- Use NEXT_PUBLIC_ prefix for client-side environment variables

## CRM-Specific Guidelines
- Design components with CRM functionality in mind (contacts, deals, tasks, etc.)
- Keep the UI clean and professional for business use
- Prioritize data tables, forms, and dashboards
- Consider mobile responsiveness for field sales teams
- Use optimistic updates to improve UX
- Implement proper error handling and loading states

## Server Actions Pattern
All server actions should:
1. Be placed in `app/actions/` directory
2. Start with `'use server'` directive
3. Return `{ error?: string }` or `{ success: boolean }` pattern
4. Call `revalidatePath()` when data changes
5. Handle errors gracefully

## Component Pattern Examples

### Section Component Pattern
```typescript
interface SectionProps {
  entityId: string
  data: Type[]
  onUpdate: () => void
}

export function Section({ entityId, data, onUpdate }: SectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const handleAction = async () => {
    setSubmitting(true)
    const result = await serverAction(entityId, data)
    if (!result?.error) {
      onUpdate()
      setIsModalOpen(false)
    }
    setSubmitting(false)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Title</CardTitle>
        <Button onClick={() => setIsModalOpen(true)}>Action</Button>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* Modal content */}
      </Modal>
    </Card>
  )
}
```

### Modal Pattern
```typescript
<Modal isOpen={isOpen} onClose={onClose} title="Title">
  <div className="space-y-4">
    {error && <ErrorAlert message={error} />}
    {/* Form fields */}
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="ghost" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </Button>
    </div>
  </div>
</Modal>
```

