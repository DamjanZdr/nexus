# Board System - Entity Relationship Diagram

## Database Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BOARD SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────┘

                                ┌──────────┐
                                │  users   │
                                │   (FK)   │
                                └────┬─────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
                     │               │               │
                ┌────▼─────┐    ┌───▼────┐     ┌───▼────┐
                │  boards  │    │  cards │     │ board  │
                │          ├────►│ (FK)   │     │ access │
                │  owner_id│    │created │     │ (FK)   │
                │is_system │    │  _by   │     │user_id │
                └────┬─────┘    └───┬────┘     └───┬────┘
                     │              │               │
                     │              │               │
              ┌──────┼──────┐       │               │
              │             │       │               │
         ┌────▼─────┐  ┌───▼───────▼───┐      ┌────▼────┐
         │  board   │  │  board_statuses│      │  card   │
         │  access  │  │      (FK)      │      │assignees│
         │   (FK)   │  │   board_id     │      │  (FK)   │
         │ board_id │  └───┬────────────┘      │ card_id │
         └──────────┘      │                   │ user_id │
                           │                   └─────────┘
                      ┌────▼─────┐
                      │  cards   │
                      │   (FK)   │
                      │status_id │
                      │ board_id │
                      └──────────┘
```

## Two Board Types

### 1. CASES BOARD (System Board)
```
┌──────────────────────────────────────────────────┐
│              Cases Board Flow                     │
│  (id: 00000000-0000-0000-0000-000000000001)      │
└──────────────────────────────────────────────────┘

boards (is_system = true)
    │
    ├─ Uses EXISTING tables:
    │    │
    │    ├─► status (for columns)
    │    └─► cases (for cards)
    │
    └─ Features:
         ├─ Display only (no create/delete)
         ├─ Move cards = update cases.status_id
         └─ Click card → navigate to /cases/[id]
```

### 2. CUSTOM BOARDS (User Boards)
```
┌──────────────────────────────────────────────────┐
│              Custom Board Flow                    │
│         (is_system = false)                       │
└──────────────────────────────────────────────────┘

boards (owned by user)
    │
    ├─► board_statuses (columns)
    │        │
    │        └─► cards (tasks)
    │                 │
    │                 └─► card_assignees
    │
    └─► board_access (sharing)
```

## Table Details

### boards
```
┌─────────────────────────────────────────┐
│ id            UUID PK                    │
│ name          TEXT NOT NULL              │
│ description   TEXT                       │
│ is_system     BOOLEAN (default false)    │
│ owner_id      UUID → users.id            │
│ created_at    TIMESTAMPTZ                │
│ updated_at    TIMESTAMPTZ                │
└─────────────────────────────────────────┘
    │
    ├─ Cascades to: board_access, board_statuses, cards
    └─ RLS: View if system/owned/shared
```

### board_access
```
┌─────────────────────────────────────────┐
│ id            UUID PK                    │
│ board_id      UUID → boards.id (CASCADE) │
│ user_id       UUID → users.id (CASCADE)  │
│ access_level  TEXT (owner/editor/viewer) │
│ granted_by    UUID → users.id            │
│ granted_at    TIMESTAMPTZ                │
│ UNIQUE(board_id, user_id)                │
└─────────────────────────────────────────┘
    │
    └─ RLS: Only board owner can grant/revoke
```

### board_statuses
```
┌─────────────────────────────────────────┐
│ id            UUID PK                    │
│ board_id      UUID → boards.id (CASCADE) │
│ name          TEXT NOT NULL              │
│ position      INTEGER (default 0)        │
│ color         TEXT (hex color)           │
│ created_at    TIMESTAMPTZ                │
│ updated_at    TIMESTAMPTZ                │
└─────────────────────────────────────────┘
    │
    ├─ Cascades to: cards
    ├─ Indexed: (board_id, position)
    └─ RLS: Owner/editor can CRUD
```

### cards
```
┌─────────────────────────────────────────┐
│ id            UUID PK                    │
│ board_id      UUID → boards.id (CASCADE) │
│ status_id     UUID → board_statuses.id   │
│                     (CASCADE)            │
│ title         TEXT NOT NULL              │
│ description   TEXT                       │
│ position      INTEGER (default 0)        │
│ due_date      DATE                       │
│ created_by    UUID → users.id            │
│ created_at    TIMESTAMPTZ                │
│ updated_at    TIMESTAMPTZ                │
└─────────────────────────────────────────┘
    │
    ├─ Cascades to: card_assignees
    ├─ Indexed: (status_id, position)
    └─ RLS: Owner/editor can CRUD
```

### card_assignees
```
┌─────────────────────────────────────────┐
│ id            UUID PK                    │
│ card_id       UUID → cards.id (CASCADE)  │
│ user_id       UUID → users.id (CASCADE)  │
│ assigned_at   TIMESTAMPTZ                │
│ UNIQUE(card_id, user_id)                 │
└─────────────────────────────────────────┘
    │
    └─ RLS: Owner/editor can assign/unassign
```

## Access Level Matrix

| Access Level | View Board | Edit Board | Delete Board | CRUD Statuses | CRUD Cards | Share Board |
|--------------|------------|------------|--------------|---------------|------------|-------------|
| **Owner**    | ✅          | ✅          | ✅            | ✅             | ✅          | ✅           |
| **Editor**   | ✅          | ❌          | ❌            | ✅             | ✅          | ❌           |
| **Viewer**   | ✅          | ❌          | ❌            | ❌             | ❌          | ❌           |

## Cascade Delete Flow

```
DELETE board
    ├─► Deletes board_access (all sharing)
    ├─► Deletes board_statuses
    │        └─► Deletes cards
    │                 └─► Deletes card_assignees
    └─► Deletes cards (if orphaned)
```

## Query Patterns

### Get User's Accessible Boards
```sql
SELECT b.*
FROM boards b
WHERE b.is_system = true
   OR b.owner_id = $user_id
   OR EXISTS (
     SELECT 1 FROM board_access ba
     WHERE ba.board_id = b.id
       AND ba.user_id = $user_id
   )
ORDER BY b.is_system DESC, b.created_at DESC;
```

### Get Cases Board Data
```sql
-- Board metadata
SELECT * FROM boards WHERE id = '00000000-0000-0000-0000-000000000001';

-- Statuses (columns)
SELECT * FROM status ORDER BY position ASC;

-- Cases (cards)
SELECT c.*, 
       cl.first_name, cl.last_name, cl.contact_email,
       s.name as status_name
FROM cases c
LEFT JOIN clients cl ON cl.id = c.client_id
LEFT JOIN status s ON s.id = c.status_id
ORDER BY c.created_at DESC;
```

### Get Custom Board Data
```sql
-- Board metadata with access
SELECT b.*,
       (SELECT json_agg(ba.*) FROM board_access ba WHERE ba.board_id = b.id) as access_list
FROM boards b
WHERE b.id = $board_id;

-- Statuses (columns)
SELECT * FROM board_statuses
WHERE board_id = $board_id
ORDER BY position ASC;

-- Cards (tasks) with assignees
SELECT c.*,
       bs.name as status_name,
       (SELECT json_agg(
         json_build_object('user_id', ca.user_id, 'email', u.email, 'display_name', u.display_name)
       ) FROM card_assignees ca
       LEFT JOIN users u ON u.id = ca.user_id
       WHERE ca.card_id = c.id
       ) as assignees
FROM cards c
LEFT JOIN board_statuses bs ON bs.id = c.status_id
WHERE c.board_id = $board_id
ORDER BY c.status_id, c.position ASC;
```

## Indexes for Performance

```sql
-- Boards
idx_boards_owner        ON boards(owner_id)
idx_boards_is_system    ON boards(is_system)

-- Board Access
idx_board_access_board  ON board_access(board_id)
idx_board_access_user   ON board_access(user_id)

-- Board Statuses
idx_board_statuses_board     ON board_statuses(board_id)
idx_board_statuses_position  ON board_statuses(board_id, position)

-- Cards
idx_cards_board         ON cards(board_id)
idx_cards_status        ON cards(status_id)
idx_cards_position      ON cards(status_id, position)
idx_cards_created_by    ON cards(created_by)

-- Card Assignees
idx_card_assignees_card ON card_assignees(card_id)
idx_card_assignees_user ON card_assignees(user_id)
```

## Data Flow Examples

### Create Custom Board
```
1. INSERT into boards (name, owner_id, is_system = false)
2. INSERT into board_access (board_id, user_id, access_level = 'owner')
3. Optionally: INSERT into board_statuses (default columns)
```

### Share Board
```
1. Verify: Current user is board owner
2. INSERT into board_access (board_id, user_id, access_level, granted_by)
3. RLS automatically grants view access to new user
```

### Move Card (Custom Board)
```
1. Verify: User has editor access
2. UPDATE cards SET status_id = new_status, position = new_position
3. Revalidate board cache
```

### Move Case (Cases Board)
```
1. Verify: User is authenticated
2. UPDATE cases SET status_id = new_status
3. Revalidate case and board cache
```

### Delete Board
```
1. Verify: User is board owner
2. DELETE FROM boards WHERE id = board_id
3. CASCADE deletes:
   - All board_access records
   - All board_statuses
   - All cards (via board_statuses cascade)
   - All card_assignees (via cards cascade)
```

---

**Migration File:** `migration_21_create_boards_system.sql`  
**TypeScript Types:** `types/database.ts`  
**System Board ID:** `00000000-0000-0000-0000-000000000001`
