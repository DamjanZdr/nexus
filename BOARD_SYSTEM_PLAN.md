# Board System Implementation Plan
**Date:** January 8, 2025  
**Status:** Database Schema Complete - Ready for Frontend Implementation

---

## 📊 System Overview

### Board Types

#### 1. **Cases Board (System Board)**
- **ID:** `00000000-0000-0000-0000-000000000001`
- **Type:** System board (`is_system = true`)
- **Owner:** None (accessible to all authenticated users)
- **Data Source:** `cases` table + `status` table
- **Features:**
  - ❌ Cannot create/delete/rename board
  - ❌ Cannot create/delete/rename statuses (uses existing `status` table)
  - ❌ Cannot create cards (displays actual cases)
  - ✅ Can move cards (updates `cases.status_id`)
  - ✅ Click card → navigate to case detail page
  - ✅ View all cases grouped by their status

#### 2. **Custom Boards (User Boards)**
- **Type:** User-created boards (`is_system = false`)
- **Owner:** Creating user
- **Data Source:** `board_statuses` table + `cards` table
- **Features:**
  - ✅ Create/delete/rename board
  - ✅ Share board with other users
  - ✅ View who has access
  - ✅ Create/delete/rename statuses
  - ✅ Rearrange status columns (position)
  - ✅ Create/edit/delete cards
  - ✅ Assign users to cards
  - ✅ Set due dates
  - ✅ Move cards between statuses

---

## 🗄️ Database Schema

### Tables Created (Migration 21)

```
boards
├── id (UUID, PK)
├── name (TEXT)
├── description (TEXT, nullable)
├── is_system (BOOLEAN) - true for Cases board
├── owner_id (UUID, FK -> users.id, nullable for system)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

board_access (sharing & permissions)
├── id (UUID, PK)
├── board_id (UUID, FK -> boards.id, CASCADE)
├── user_id (UUID, FK -> users.id, CASCADE)
├── access_level (TEXT) - 'owner', 'editor', 'viewer'
├── granted_by (UUID, FK -> users.id, nullable)
├── granted_at (TIMESTAMPTZ)
└── UNIQUE(board_id, user_id)

board_statuses (custom board columns)
├── id (UUID, PK)
├── board_id (UUID, FK -> boards.id, CASCADE)
├── name (TEXT)
├── position (INTEGER)
├── color (TEXT, nullable) - hex color
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

cards (custom board tasks)
├── id (UUID, PK)
├── board_id (UUID, FK -> boards.id, CASCADE)
├── status_id (UUID, FK -> board_statuses.id, CASCADE)
├── title (TEXT)
├── description (TEXT, nullable)
├── position (INTEGER) - order within status
├── due_date (DATE, nullable)
├── created_by (UUID, FK -> users.id, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

card_assignees
├── id (UUID, PK)
├── card_id (UUID, FK -> cards.id, CASCADE)
├── user_id (UUID, FK -> users.id, CASCADE)
├── assigned_at (TIMESTAMPTZ)
└── UNIQUE(card_id, user_id)
```

### Indexes
- `idx_boards_owner`, `idx_boards_is_system`
- `idx_board_access_board`, `idx_board_access_user`
- `idx_board_statuses_board`, `idx_board_statuses_position`
- `idx_cards_board`, `idx_cards_status`, `idx_cards_position`, `idx_cards_created_by`
- `idx_card_assignees_card`, `idx_card_assignees_user`

### RLS Policies
All tables have comprehensive Row Level Security policies:
- **Boards:** Users see system boards + owned boards + shared boards
- **Access:** Board owners can grant/revoke access
- **Statuses:** Owners and editors can CRUD statuses
- **Cards:** Owners and editors can CRUD cards
- **Assignees:** Owners and editors can assign/unassign users

---

## 🎯 Frontend Implementation Plan

### Phase 1: Board List & Navigation ✅ CURRENT
**Files to Modify/Create:**
```
app/(dashboard)/board/
├── page.tsx (MODIFY - board selector)
├── [boardId]/
│   └── page.tsx (CREATE - individual board view)
└── components/
    ├── BoardList.tsx (CREATE - sidebar/dropdown)
    ├── CreateBoardModal.tsx (CREATE)
    └── BoardSettingsModal.tsx (CREATE - rename/delete/share)
```

**Tasks:**
- [ ] Update board/page.tsx to show board list
- [ ] Create board selector UI (dropdown or sidebar)
- [ ] Implement "Create Board" modal
- [ ] Show Cases board by default
- [ ] Navigate to individual board view

---

### Phase 2: Cases Board (System Board)
**Files to Modify:**
```
app/(dashboard)/board/[boardId]/page.tsx
app/(dashboard)/board/components/
├── KanbanBoard.tsx (MODIFY - handle both cases and cards)
├── KanbanColumn.tsx (MODIFY - conditional rendering)
└── KanbanCard.tsx (MODIFY - different display for cases vs cards)
```

**Tasks:**
- [ ] Detect when viewing Cases board (id === '00000000-0000-0000-0000-000000000001')
- [ ] Fetch cases + status table instead of cards + board_statuses
- [ ] Display cases as cards (case_code, client name, created date)
- [ ] Implement drag-drop to update `cases.status_id`
- [ ] Link cards to `/cases/[id]` page
- [ ] Hide create/delete buttons for statuses and cards

**Server Actions Needed:**
```
app/actions/boards.ts
└── updateCaseStatus(caseId: string, newStatusId: string)
```

---

### Phase 3: Custom Boards - Basic View
**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
├── CustomBoardView.tsx
├── StatusColumn.tsx
├── CardItem.tsx
├── CreateStatusModal.tsx
└── CreateCardModal.tsx
```

**Tasks:**
- [ ] Fetch board + board_statuses + cards with relations
- [ ] Display statuses as columns
- [ ] Display cards within columns
- [ ] Show empty state if no statuses
- [ ] Show "+ Add Status" button
- [ ] Show "+ Add Card" button in each column

**Server Actions Needed:**
```
app/actions/boards.ts
├── createBoard(name, description)
├── updateBoard(boardId, updates)
├── deleteBoard(boardId)
├── createBoardStatus(boardId, name, position, color)
├── updateBoardStatus(statusId, updates)
├── deleteBoardStatus(statusId)
├── reorderStatuses(boardId, statusIds[])
└── getBoardWithData(boardId)
```

---

### Phase 4: Card Management
**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
├── CardDetailModal.tsx (view/edit card)
├── CardForm.tsx (create/edit form)
└── CardAssigneeSelect.tsx (multi-select users)
```

**Tasks:**
- [ ] Create card modal (title, description, due date, assignees)
- [ ] Edit card modal (same fields)
- [ ] Delete card confirmation
- [ ] Assign/unassign users
- [ ] Show assignee avatars on cards
- [ ] Show due date indicator (red if overdue)

**Server Actions Needed:**
```
app/actions/cards.ts
├── createCard(boardId, statusId, data)
├── updateCard(cardId, updates)
├── deleteCard(cardId)
├── moveCard(cardId, newStatusId, newPosition)
├── assignUser(cardId, userId)
└── unassignUser(cardId, userId)
```

---

### Phase 5: Drag & Drop
**Dependencies:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Files to Modify:**
```
app/(dashboard)/board/[boardId]/components/
├── KanbanBoard.tsx (ADD drag context)
├── KanbanColumn.tsx (ADD droppable)
└── KanbanCard.tsx (ADD draggable)
```

**Tasks:**
- [ ] Implement drag context with @dnd-kit
- [ ] Draggable cards
- [ ] Droppable status columns
- [ ] Update position on drop
- [ ] Optimistic UI updates
- [ ] Handle both Cases board and Custom boards

**Server Actions:**
- For Cases: `updateCaseStatus(caseId, statusId)`
- For Custom: `moveCard(cardId, statusId, position)`

---

### Phase 6: Board Sharing & Permissions
**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
├── BoardSharingModal.tsx
├── AccessListItem.tsx
└── ShareUserSelect.tsx
```

**Tasks:**
- [ ] View list of users with access
- [ ] Add user with access level (editor/viewer)
- [ ] Remove user access
- [ ] Change access level
- [ ] Show "Shared with X users" indicator
- [ ] Disable sharing for system board

**Server Actions Needed:**
```
app/actions/boardAccess.ts
├── getBoardAccess(boardId)
├── grantAccess(boardId, userId, accessLevel)
├── revokeAccess(accessId)
└── updateAccessLevel(accessId, newLevel)
```

---

### Phase 7: Status Management
**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
├── StatusSettingsModal.tsx
├── StatusReorderDragDrop.tsx
└── StatusColorPicker.tsx
```

**Tasks:**
- [ ] Edit status name
- [ ] Edit status color
- [ ] Reorder statuses (drag columns)
- [ ] Delete status (confirm if has cards)
- [ ] Create new status with position

**Server Actions:**
Already created in Phase 3

---

### Phase 8: Polish & UX
**Tasks:**
- [ ] Loading states for all operations
- [ ] Error handling with toast notifications
- [ ] Optimistic updates for smooth UX
- [ ] Empty states with helpful messages
- [ ] Keyboard shortcuts (Esc to close modals, etc.)
- [ ] Search/filter cards
- [ ] Sort cards within columns
- [ ] Card count badges on statuses
- [ ] Board description display
- [ ] Recent boards list
- [ ] Breadcrumb navigation

---

## 🔧 Server Actions Structure

### File Organization
```
app/actions/
├── boards.ts       - Board CRUD, status CRUD
├── cards.ts        - Card CRUD, movement
├── boardAccess.ts  - Sharing & permissions
└── cases.ts        - (existing, add updateStatus)
```

### Example Action Pattern
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBoard(name: string, description?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('boards')
    .insert({
      name,
      description,
      owner_id: user.id,
      is_system: false
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Grant owner access
  await supabase.from('board_access').insert({
    board_id: data.id,
    user_id: user.id,
    access_level: 'owner',
    granted_by: user.id
  })

  revalidatePath('/board')
  return { data }
}
```

---

## 🎨 UI Components Checklist

### Reusable Components (components/ui)
- [x] Button
- [x] Card
- [x] Modal
- [x] Input
- [x] Select
- [ ] DatePicker (if not exists)
- [ ] ColorPicker (new)
- [ ] UserAvatar (new)
- [ ] Badge (new)
- [ ] Dropdown (new)
- [ ] Toast/Alert (improve existing)

### Board-Specific Components
- [ ] BoardCard (board list item)
- [ ] StatusColumn (draggable column)
- [ ] CardItem (draggable card)
- [ ] UserMultiSelect (assignees)
- [ ] AccessLevelBadge
- [ ] DueDateBadge

---

## 🚀 Migration Instructions

### Run Migration 21
```sql
-- In Supabase SQL Editor:
-- Copy and paste the entire migration_21_create_boards_system.sql file
-- Execute
```

### Verify Tables
```sql
-- Check that all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('boards', 'board_access', 'board_statuses', 'cards', 'card_assignees');

-- Check system board exists
SELECT * FROM boards WHERE is_system = true;
```

---

## 📋 Implementation TODO List

```markdown
### Database (COMPLETE ✅)
- [x] Design schema
- [x] Create migration_21
- [x] Add TypeScript types
- [x] Document RLS policies

### Phase 1: Navigation (NEXT)
- [ ] Modify board/page.tsx for board list
- [ ] Create BoardList component
- [ ] Create CreateBoardModal
- [ ] Create [boardId]/page.tsx
- [ ] Add board switcher to UI

### Phase 2: Cases Board
- [ ] Detect system board
- [ ] Query cases + status tables
- [ ] Implement case card movement
- [ ] Disable create/delete UI
- [ ] Test case status updates

### Phase 3: Custom Boards
- [ ] Create CustomBoardView component
- [ ] Implement status CRUD
- [ ] Create status modals
- [ ] Test board operations

### Phase 4: Cards
- [ ] Create card modals
- [ ] Implement card CRUD
- [ ] Add assignee management
- [ ] Add due date handling

### Phase 5: Drag & Drop
- [ ] Install @dnd-kit
- [ ] Implement drag context
- [ ] Make cards draggable
- [ ] Make columns droppable
- [ ] Test on both board types

### Phase 6: Sharing
- [ ] Create sharing modal
- [ ] Implement access CRUD
- [ ] Show access indicators
- [ ] Test permissions

### Phase 7: Status Reorder
- [ ] Drag to reorder columns
- [ ] Update position values
- [ ] Persist order

### Phase 8: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Optimistic updates
- [ ] Empty states
- [ ] Keyboard shortcuts
```

---

## 🔍 Testing Checklist

### Cases Board
- [ ] Displays all cases grouped by status
- [ ] Moving case updates status_id correctly
- [ ] Click card navigates to case detail
- [ ] Cannot create/delete statuses
- [ ] Cannot create cards
- [ ] Can view by all authenticated users

### Custom Boards
- [ ] Can create new board
- [ ] Can rename board
- [ ] Can delete board
- [ ] Can create/edit/delete statuses
- [ ] Can reorder statuses
- [ ] Can create/edit/delete cards
- [ ] Can assign/unassign users
- [ ] Can move cards between statuses
- [ ] Cards maintain position within column

### Sharing
- [ ] Owner can share board
- [ ] Editor can modify board/cards
- [ ] Viewer can only view
- [ ] Can revoke access
- [ ] Can change access level
- [ ] System board cannot be shared

### Permissions
- [ ] RLS blocks unauthorized access
- [ ] Owner sees all owned boards
- [ ] User sees shared boards
- [ ] Cannot modify boards without permission
- [ ] Cannot see other users' private boards

---

## 📝 Notes

- **System Board ID:** `00000000-0000-0000-0000-000000000001`
- **Cascade Deletes:** Deleting board → deletes statuses, cards, access
- **Position Field:** Used for column order and card order (drag-drop)
- **Color Field:** Optional hex color for status columns
- **Access Levels:** owner (full), editor (modify), viewer (read-only)
- **Cases Board:** Special handling - no board_statuses/cards, uses status/cases tables instead

---

**Ready to proceed with frontend implementation!**
