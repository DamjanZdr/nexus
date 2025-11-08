# Board System - Immediate Next Steps

## ✅ COMPLETED

### Database Design
- [x] Analyzed requirements thoroughly
- [x] Designed comprehensive schema for both board types
- [x] Created `migration_21_create_boards_system.sql` (467 lines)
- [x] Added TypeScript types to `types/database.ts`
- [x] Created detailed ERD documentation
- [x] Created implementation plan
- [x] Validated all files (no lint errors)

### Documentation Created
1. **BOARD_SYSTEM_PLAN.md** - Complete implementation roadmap
2. **BOARD_SYSTEM_ERD.md** - Database relationships and queries
3. **NEXT_STEPS.md** - This file

---

## 🚀 YOUR IMMEDIATE ACTION REQUIRED

### Step 1: Run Database Migration

**Open your Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **SQL Editor**
4. Create new query
5. Copy the **entire contents** of: `database/migrations/migration_21_create_boards_system.sql`
6. Paste and **Run** the query
7. Verify success

**Verification Queries:**
```sql
-- Check all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('boards', 'board_access', 'board_statuses', 'cards', 'card_assignees')
ORDER BY table_name;

-- Should return 5 rows

-- Check system Cases board exists
SELECT id, name, is_system FROM boards WHERE is_system = true;

-- Should return:
-- id: 00000000-0000-0000-0000-000000000001
-- name: Cases
-- is_system: true
```

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Board List & Navigation (START HERE)
**Estimated Time:** 2-3 hours

**Files to Create:**
```
app/(dashboard)/board/
├── [boardId]/
│   └── page.tsx                      # Individual board view
└── components/
    ├── BoardList.tsx                 # Sidebar list of all boards
    ├── BoardSelector.tsx             # Dropdown to switch boards
    ├── CreateBoardModal.tsx          # Modal to create new board
    └── BoardSettingsModal.tsx        # Rename/delete/share board
```

**Files to Modify:**
```
app/(dashboard)/board/page.tsx        # Add board selector, default to Cases
```

**Server Actions to Create:**
```
app/actions/boards.ts
├── getUserBoards()                   # Get all accessible boards
├── createBoard(name, description)    # Create new custom board
├── updateBoard(boardId, updates)     # Rename board
└── deleteBoard(boardId)              # Delete custom board
```

**Tasks:**
- [ ] Fetch user's accessible boards (system + owned + shared)
- [ ] Display board list in sidebar/dropdown
- [ ] Show "Cases" board by default
- [ ] Add "+ Create Board" button
- [ ] Implement create board modal
- [ ] Navigate to individual board via `/board/[boardId]`

---

### Phase 2: Cases Board (System Board)
**Estimated Time:** 2-3 hours

**Files to Modify:**
```
app/(dashboard)/board/[boardId]/page.tsx
app/(dashboard)/board/components/
├── KanbanBoard.tsx                   # Detect board type, fetch correct data
├── KanbanColumn.tsx                  # Render based on board type
└── KanbanCard.tsx                    # Different card for cases vs tasks
```

**Server Actions:**
```
app/actions/cases.ts                  # (modify existing)
└── updateCaseStatus(caseId, statusId)

app/actions/boards.ts                 # (add)
└── getCasesBoardData()               # Fetch cases + statuses
```

**Tasks:**
- [ ] Detect when viewing Cases board (id === `00000000-0000-0000-0000-000000000001`)
- [ ] Fetch `cases` + `status` tables (not `cards` + `board_statuses`)
- [ ] Display cases as cards (case_code, client name, date)
- [ ] Allow moving cards (updates `cases.status_id`)
- [ ] Link cards to `/cases/[id]` detail page
- [ ] Hide "Create Status" and "Create Card" buttons
- [ ] Show read-only indicator

---

### Phase 3: Custom Boards - Basic CRUD
**Estimated Time:** 3-4 hours

**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
├── CustomBoardView.tsx               # Main custom board component
├── CreateStatusModal.tsx             # Create new status/column
├── EditStatusModal.tsx               # Edit status name/color
└── CreateCardModal.tsx               # Create new card/task
```

**Server Actions:**
```
app/actions/boards.ts                 # (add to existing)
├── getBoardWithData(boardId)         # Fetch board + statuses + cards
├── createBoardStatus(boardId, name, position, color)
├── updateBoardStatus(statusId, updates)
└── deleteBoardStatus(statusId)       # Confirm if has cards

app/actions/cards.ts                  # (new file)
├── createCard(boardId, statusId, data)
├── updateCard(cardId, updates)
└── deleteCard(cardId)
```

**Tasks:**
- [ ] Fetch board data with statuses and cards
- [ ] Display statuses as columns
- [ ] Display cards within columns
- [ ] Implement "Create Status" modal
- [ ] Implement "Create Card" modal
- [ ] Add edit/delete for statuses (confirm if has cards)
- [ ] Add edit/delete for cards

---

### Phase 4: Card Details & Assignments
**Estimated Time:** 2-3 hours

**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
├── CardDetailModal.tsx               # View/edit full card details
├── CardAssigneeSelect.tsx            # Multi-select users
└── DueDatePicker.tsx                 # Date picker for due date
```

**Server Actions:**
```
app/actions/cards.ts                  # (add)
├── assignUser(cardId, userId)
├── unassignUser(cardId, userId)
└── updateCardDueDate(cardId, dueDate)
```

**Tasks:**
- [ ] Show card detail modal on click
- [ ] Edit title, description, due date
- [ ] Assign/unassign users (multi-select)
- [ ] Display assignee avatars on cards
- [ ] Show due date badge (red if overdue)
- [ ] Delete card confirmation

---

### Phase 5: Drag & Drop
**Estimated Time:** 3-4 hours

**Install Dependencies:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Files to Modify:**
```
app/(dashboard)/board/[boardId]/components/
├── KanbanBoard.tsx                   # Add DndContext
├── KanbanColumn.tsx                  # Add useDroppable
└── KanbanCard.tsx                    # Add useDraggable
```

**Server Actions:**
```
app/actions/cards.ts                  # (add)
└── moveCard(cardId, statusId, position)

app/actions/cases.ts                  # (use existing)
└── updateCaseStatus(caseId, statusId)
```

**Tasks:**
- [ ] Install @dnd-kit libraries
- [ ] Wrap board in DndContext
- [ ] Make cards draggable
- [ ] Make columns droppable
- [ ] Handle drag end for Cases board (update case status)
- [ ] Handle drag end for Custom boards (update card status + position)
- [ ] Add optimistic UI updates
- [ ] Add loading indicator during drag

---

### Phase 6: Board Sharing
**Estimated Time:** 2-3 hours

**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
├── BoardSharingModal.tsx             # Manage board access
├── AccessListItem.tsx                # Single user access item
└── ShareUserSelect.tsx               # Search and select users
```

**Server Actions:**
```
app/actions/boardAccess.ts            # (new file)
├── getBoardAccess(boardId)           # Get all users with access
├── grantAccess(boardId, userId, level)
├── updateAccessLevel(accessId, level)
└── revokeAccess(accessId)
```

**Tasks:**
- [ ] Create sharing modal
- [ ] List all users with access
- [ ] Show access level badges (owner/editor/viewer)
- [ ] Add user with access level selector
- [ ] Change user access level
- [ ] Remove user access
- [ ] Show "Shared with X users" indicator on board
- [ ] Disable sharing for system Cases board

---

### Phase 7: Status Reordering
**Estimated Time:** 1-2 hours

**Files to Create:**
```
app/(dashboard)/board/[boardId]/components/
└── StatusDragHandle.tsx              # Drag handle for columns
```

**Server Actions:**
```
app/actions/boards.ts                 # (add)
└── reorderStatuses(boardId, statusIds[])
```

**Tasks:**
- [ ] Enable drag-drop for status columns
- [ ] Update position values on reorder
- [ ] Persist new order to database
- [ ] Show visual feedback during drag
- [ ] Disable for Cases board

---

### Phase 8: Polish & UX
**Estimated Time:** 2-3 hours

**Tasks:**
- [ ] Add loading skeletons for all data fetches
- [ ] Implement error toast notifications
- [ ] Add optimistic updates for smooth UX
- [ ] Create helpful empty states
- [ ] Add keyboard shortcuts (Esc to close modals)
- [ ] Implement search/filter cards
- [ ] Add card sorting options
- [ ] Show card count on status badges
- [ ] Display board description
- [ ] Add "Recent Boards" list
- [ ] Implement breadcrumb navigation
- [ ] Add confirmation dialogs for delete operations

---

## 🎨 UI Components Needed

### New Components to Create
```
components/ui/
├── ColorPicker.tsx                   # For status colors
├── UserAvatar.tsx                    # User profile pictures
├── Badge.tsx                         # Generic badge component
├── Dropdown.tsx                      # Dropdown menu
└── Toast.tsx                         # Toast notifications (improve existing)
```

---

## 🧪 Testing Checklist

### After Each Phase
```markdown
### Cases Board
- [ ] Displays all cases grouped by status
- [ ] Moving case updates status in database
- [ ] Clicking case navigates to detail page
- [ ] Cannot create/delete statuses or cards
- [ ] All authenticated users can view

### Custom Boards
- [ ] Create/rename/delete board works
- [ ] Create/rename/delete statuses works
- [ ] Create/edit/delete cards works
- [ ] Assign/unassign users works
- [ ] Move cards between statuses works
- [ ] Due dates display and update correctly

### Permissions
- [ ] Owner can do everything
- [ ] Editor can modify board/cards but not delete board
- [ ] Viewer can only view
- [ ] RLS blocks unauthorized access
- [ ] Cannot see other users' private boards

### Sharing
- [ ] Can share board with users
- [ ] Can change access levels
- [ ] Can revoke access
- [ ] System board cannot be shared
- [ ] Shared users see board in their list
```

---

## 📊 Success Metrics

**Phase 1 Complete When:**
- Can view list of all accessible boards
- Can create new custom board
- Can navigate to individual board
- Cases board shows by default

**Phase 2 Complete When:**
- Cases board displays all cases by status
- Can drag-drop cases to change status
- Clicking case opens detail page
- UI shows it's read-only

**Phase 3 Complete When:**
- Can create/edit/delete custom board statuses
- Can create/edit/delete cards
- Cards display in correct columns

**Phase 4 Complete When:**
- Can assign users to cards
- Can set due dates
- Card detail modal fully functional

**Phase 5 Complete When:**
- Drag-drop works smoothly on both board types
- Position updates persist correctly
- Optimistic updates provide instant feedback

**Phase 6 Complete When:**
- Can share boards with other users
- Access levels work correctly
- Can manage board access

**Phase 7 Complete When:**
- Can reorder status columns
- Order persists correctly

**Phase 8 Complete When:**
- All loading states implemented
- Error handling complete
- Empty states helpful
- UX feels polished

---

## 🔧 Development Tips

### Recommended Order
1. **Database First** ← YOU ARE HERE
2. **Server Actions** - Create all backend logic
3. **UI Components** - Build reusable pieces
4. **Page Integration** - Wire everything together
5. **Drag & Drop** - Add interactive features
6. **Polish** - Refine UX

### Code Structure Pattern
```typescript
// Server Action Pattern
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function action(params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // Perform action
  const { data, error } = await supabase.from('table').insert(...)
  if (error) return { error: error.message }
  
  revalidatePath('/board')
  return { data }
}
```

### Supabase Query Pattern
```typescript
// Fetch board with all relations
const { data, error } = await supabase
  .from('boards')
  .select(`
    *,
    board_statuses (
      *,
      cards (
        *,
        card_assignees (
          *,
          users (id, email, display_name)
        )
      )
    ),
    board_access (
      *,
      users (id, email, display_name)
    )
  `)
  .eq('id', boardId)
  .single()
```

---

## 📞 Questions to Consider Before Starting

1. **UI Framework**: Continue with current Tailwind + components/ui?
2. **Drag Library**: Prefer @dnd-kit or react-beautiful-dnd?
3. **Real-time**: Want live updates when others edit boards?
4. **Notifications**: Toast notifications for all actions?
5. **Mobile**: Responsive design for tablets/phones?

---

## ✨ Ready to Start!

**Current Status:** Database schema complete and documented  
**Next Action:** Run migration_21 in Supabase  
**Then Start:** Phase 1 - Board List & Navigation

All planning documents are in your project root:
- `BOARD_SYSTEM_PLAN.md` - Full implementation guide
- `BOARD_SYSTEM_ERD.md` - Database structure
- `NEXT_STEPS.md` - This file
- `database/migrations/migration_21_create_boards_system.sql` - Migration file
- `types/database.ts` - Updated with board types

**Let me know when you've run the migration and I'll help you build the frontend!** 🚀
