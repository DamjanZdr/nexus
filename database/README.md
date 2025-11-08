# Database Schema Tracking

This folder contains SQL files for all Supabase database tables.

## Tables

1. **clients** - Client/customer information
2. **cases** - Case management
3. **status** - Case status definitions
4. **case_services** - Services associated with cases
5. **installments** - Payment installments
6. **comments** - Comments on cases
7. **case_attachments** - File attachments (Supabase Storage)
8. **cities** - Polish cities reference
9. **countries** - Countries reference
10. **services** - Available services
11. **themes** - UI themes
12. **notifications** - Notification templates
13. **roles** - User roles
14. **contact_numbers** - Client contact numbers
15. **users** - System users
16. **user_notifications** - User notification instances
17. **notification_preferences** - User notification settings

## Usage

### Run all tables at once:
Copy the contents of `00_setup_all.sql` into Supabase SQL Editor

### Run individual tables:
Copy the contents of any specific table file (e.g., `01_clients.sql`) into Supabase SQL Editor

## Notes

- All tables use UUID primary keys
- Foreign key constraints are defined for referential integrity
- Indexes are created for frequently queried columns
- Timestamps use `TIMESTAMPTZ` for timezone awareness
