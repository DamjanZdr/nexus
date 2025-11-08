# Nexus CRM - Frontend Architecture Guide

##  Project Structure

```
nexus/
 app/                          # Next.js App Router (pages)
    (auth)/                   # Auth routes (no navbar)
       login/page.tsx        # Login page
       setup/page.tsx        # New user setup
    (dashboard)/              # Main app (with navbar)
       layout.tsx            # Dashboard layout + navbar
       page.tsx              # Home/Dashboard
       clients/page.tsx      # Clients list
       settings/page.tsx     # Settings
    layout.tsx                # Root layout
    page.tsx                  # Root redirect
    globals.css               # **THEME SYSTEM** 
 components/                   # Reusable components
    ui/                       # Base UI components 
       Button.tsx            # Reusable button
       Input.tsx             # Reusable input field
       Card.tsx              # Reusable card component
       index.ts              # Export all UI components
    layout/                   # Layout components
        Navbar.tsx            # Navigation sidebar
 lib/                          # Utilities & configs
    supabase/
       client.ts             # Client-side Supabase
       server.ts             # Server-side Supabase
    utils.ts                  # Helper functions
 types/                        # TypeScript types
    database.ts               # Database type definitions
 database/                     # SQL schema files
     *.sql                     # Table definitions
```

##  Theme System (globals.css)

**All colors, spacing, shadows, and styles are defined in \pp/globals.css\**

### To Change Theme Colors:

Edit CSS variables in \pp/globals.css\:

```css
:root {
  /* Change background color */
  --color-background: 240 10% 3.9%;
  
  /* Change primary brand color */
  --color-primary: 217 91% 60%;
  
  /* Change border radius */
  --radius-md: 0.5rem;
}
```

**That's it!** The entire app updates automatically.

### Theme Variables Available:

- **Colors**: background, surface, text (primary/secondary/muted), primary, success, warning, error, border
- **Spacing**: xs, sm, md, lg, xl, 2xl
- **Border Radius**: sm, md, lg, xl
- **Shadows**: sm, md, lg, xl, inner

##  Component System

### 3 Levels of Components:

#### 1. Base UI Components (\components/ui/\)
**Reusable, atomic elements - USE THESE EVERYWHERE**

- \<Button>\ - All buttons
- \<Input>\ - All text inputs
- \<Card>\ - All cards/panels

**Example:**
```tsx
import { Button, Input, Card } from '@/components/ui'

<Button variant="primary">Click Me</Button>
<Input label="Email" placeholder="you@example.com" />
<Card>Content here</Card>
```

#### 2. Layout Components (\components/layout/\)
- \<Navbar>\ - Sidebar navigation

#### 3. Feature Components (to be created)
- Business logic components
- Data-fetching components

##  How to Add a New Page

1. Create folder in \pp/(dashboard)/\
2. Add \page.tsx\ file
3. Update navbar in \components/layout/Navbar.tsx\

**Example - Add "Board" page:**

```tsx
// app/(dashboard)/board/page.tsx
import { Card } from '@/components/ui'

export default function BoardPage() {
  return (
    <div>
      <h1>Board</h1>
      <Card>Board content...</Card>
    </div>
  )
}
```

Then update navbar:
```tsx
// components/layout/Navbar.tsx
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/clients', label: 'Clients' },
  { href: '/board', label: 'Board' },  //  Add this
  { href: '/settings', label: 'Settings' },
]
```

##  How to Add a New UI Component

1. Create file in \components/ui/\
2. Follow existing pattern (use \cn\ utility, theme variables)
3. Export from \components/ui/index.ts\

**Example - Add Select component:**

```tsx
// components/ui/Select.tsx
import { cn } from '@/lib/utils'

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'rounded-[var(--radius-md)]',
        'bg-[hsl(var(--color-input-bg))]',
        'border border-[hsl(var(--color-input-border))]',
        className
      )}
      {...props}
    />
  )
}
```

Then export:
```tsx
// components/ui/index.ts
export { Select } from './Select'
```

##  Supabase Integration

### Client-side (use in Client Components):
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('clients').select()
```

### Server-side (use in Server Components):
```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase.from('clients').select()
```

##  Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production server
```

##  Best Practices

1. **Always use UI components** - Never create inline buttons/inputs
2. **Use theme variables** - Never hardcode colors
3. **Keep components small** - One responsibility per component
4. **Type everything** - Use TypeScript types from \	ypes/\

##  Customizing Styles

### Change a single component:
```tsx
<Button className="bg-red-500">Custom button</Button>
```

### Change globally:
Edit \components/ui/Button.tsx\

### Change theme:
Edit \pp/globals.css\ variables

---

**This architecture makes it easy for GPT-4 to:**
- Find and modify components
- Add new pages
- Customize theme
- Understand the codebase structure
