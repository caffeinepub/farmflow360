# Plantation 360

## Current State
The app has an Admin Panel tab (visible only when admin token is entered). The current admin panel shows the **logged-in admin's own** estate count, labour entries, revenue, and rainfall stats -- the same data any user sees about themselves. There is a Role Management section to assign roles to other users by Principal ID. There is no ability to see or manage other users' data.

Backend only provides `getUserXxx()` functions that filter by the caller's Principal. No admin-level "get all" or "delete any" functions exist.

## Requested Changes (Diff)

### Add
- Backend: `adminGetAllEstates()` - returns all estates across all users (admin only)
- Backend: `adminGetAllLabourEntries()` - returns all labour entries across all users (admin only)
- Backend: `adminGetAllRainfallLogs()` - returns all rainfall logs across all users (admin only)
- Backend: `adminGetAllDailyLogs()` - returns all daily logs across all users (admin only)
- Backend: `adminGetAllRevenueEntries()` - returns all revenue entries across all users (admin only)
- Backend: `adminGetAllCropYields()` - returns all crop yields across all users (admin only)
- Backend: `adminDeleteEstate(estateId)` - admin can delete any estate (admin only)
- Backend: `adminDeleteLabourEntry(entryId)` - admin can delete any labour entry (admin only)
- Backend: `adminDeleteRainfallLog(logId)` - admin can delete any rainfall log (admin only)
- Backend: `adminDeleteDailyLog(logId)` - admin can delete any daily log (admin only)
- Backend: `adminDeleteRevenueEntry(entryId)` - admin can delete any revenue entry (admin only)
- Backend: `adminDeleteCropYield(yieldId)` - admin can delete any crop yield (admin only)
- Backend: `adminGetAllUsers()` - returns list of all user Principals with profiles (admin only)
- Backend: `adminGetUserStats(userId)` - returns aggregated stats for a specific user (admin only)
- Frontend: Admin panel "Users" tab - list all registered users with their estate count, entry counts
- Frontend: Admin panel "All Data" tabs - tabbed view showing all data across all users (Estates, Labour, Rainfall, Harvest, Daily Logs, Revenue)
- Frontend: Delete buttons on each record in admin view (calls adminDelete* endpoints)
- Frontend: Per-user drill-down: tap a user to see all their data (estates, logs, etc.)

### Modify
- AdminPanelScreen: Replace "your own stats" cards with platform-wide aggregated stats (total users, total estates across all users, total labour entries, total revenue)
- AdminPanelScreen: Add tabbed navigation within admin panel (Overview, Users, Data)
- useQueries.ts: Add admin query hooks for all the new admin backend functions

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` with all `adminGet*` and `adminDelete*` functions, all guarded by `isAdmin` check
2. Regenerate `backend.d.ts` with new admin function signatures
3. Update `useQueries.ts` with new admin hooks
4. Rebuild `AdminPanelScreen.tsx` with:
   - Tabbed layout: Overview | Users | Data
   - Overview: platform-wide stats (total users, estates, labour, revenue)
   - Users tab: list of all users, each expandable to show their estates and data counts
   - Data tab: sub-tabs for each data type (Estates, Labour, Rainfall, DailyLogs, Harvest, Revenue) with delete capability
