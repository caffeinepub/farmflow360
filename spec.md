# Plantation 360

## Current State
Full-stack estate management mobile web app with:
- Authentication via Internet Identity
- Estates, Labour, Rainfall, Daily Logs, Harvest, Analytics, Weather, and Profile screens
- Role-based access control (authorization component) with admin/user/guest roles
- Backend exposes `isCallerAdmin()` and `getCallerUserRole()` but has no admin-only data query endpoints
- No admin panel exists in the frontend

## Requested Changes (Diff)

### Add
- Backend: Admin-only query functions to retrieve all users' data aggregates (total users, total estates, total labour entries, total rainfall logs, total harvest logs, total daily logs, total revenue)
- Backend: Admin function to list all registered user principals with their profiles and basic stats
- Frontend: `AdminPanelScreen` component -- admin-only screen showing:
  - App-wide stats: total users, total estates, total logs, total revenue across all users
  - User list: each user's principal (shortened), profile name, and their data counts
  - Role management: ability to assign/revoke admin role for any user
- Frontend: Admin tab in bottom nav, only visible when `isCallerAdmin()` returns true
- Frontend: Route `admin` added to Tab type and App.tsx

### Modify
- Backend `main.mo`: Add admin-only query functions using `AccessControl.isAdmin` guard
- `App.tsx`: Conditionally add "Admin" nav item and render `AdminPanelScreen` based on admin check

### Remove
- Nothing removed

## Implementation Plan
1. Add backend functions in `main.mo`:
   - `getAllEstates()` -- admin only, returns all estates
   - `getAllLabourEntries()` -- admin only
   - `getAllRainfallLogs()` -- admin only
   - `getAllDailyLogs()` -- admin only
   - `getAllRevenueEntries()` -- admin only
   - `getAllUserProfiles()` -- admin only, returns list of {principal, profile}
2. Update `backend.d.ts` to expose new admin functions
3. Create `AdminPanelScreen.tsx` frontend component with stats cards and user list
4. Update `App.tsx` to check `isCallerAdmin()` on mount and conditionally show admin nav tab
