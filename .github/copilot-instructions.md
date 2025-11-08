<!-- Workspace-specific instructions for GitHub Copilot -->

## Project Overview
This is a Next.js 14 CRM frontend application with the following tech stack:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (for backend/database - to be integrated)

## Development Guidelines
- Use TypeScript for all new files
- Follow Next.js App Router conventions (app directory)
- Use Tailwind CSS for styling
- Ensure all components are properly typed
- Use server components by default, client components only when needed
- Follow React and Next.js best practices

## Environment Variables
- Supabase credentials are stored in .env.local
- Never commit .env.local to version control
- Use NEXT_PUBLIC_ prefix for client-side environment variables

## CRM-Specific Guidelines
- Design components with CRM functionality in mind (contacts, deals, tasks, etc.)
- Keep the UI clean and professional for business use
- Prioritize data tables, forms, and dashboards
- Consider mobile responsiveness for field sales teams
