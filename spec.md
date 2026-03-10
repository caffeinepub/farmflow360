# Plantation 360

## Current State
Backend has stable storage for userRoles and userProfiles. All core data maps (estates, labourEntries, rainfallLogs, dailyLogs, cropYields, forecasts, revenueEntries) exist but use in-memory maps with no stable persistence. Admin panel reads user data via adminGetAllUserPrincipals (returns only principals, no names/roles/dates). No persistent users registry exists.

## Requested Changes (Diff)

### Add
- `UserRecord` type: `{ principalId, name, role, createdAt }`
- `usersRegistry` map (Principal → UserRecord) with stable storage
- `ensureUserInRegistry()` - called on login, auto-creates record if not exists
- `updateUserRegistryName(name)` - updates name in registry when user saves profile
- `adminGetAllUsers()` - returns all UserRecord entries for Admin Panel
- `adminDeleteUserFromRegistry(user)` - removes user from registry + roles
- `adminUpdateUserRole(user, role)` - updates role in both accessControl and registry
- Stable vars: `stableUsersRegistry` saved in preupgrade, restored in postupgrade

### Modify
- `preupgrade` / `postupgrade` hooks to also persist/restore `usersRegistry`
- Frontend: call `ensureUserInRegistry` after `_initializeAccessControlWithSecret` on login
- Frontend Admin Panel: use `adminGetAllUsers` to show real user list with names, roles, join date

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add UserRecord type, usersRegistry map, stable vars, preupgrade/postupgrade, and all new functions
2. Update frontend to call `ensureUserInRegistry` after login init
3. Update Admin Panel to call `adminGetAllUsers` and display name, role, join date per user
4. Wire `adminDeleteUserFromRegistry` and `adminUpdateUserRole` to admin panel controls
