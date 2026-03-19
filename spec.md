# Plantation 360

## Current State
The `adminResetAllUsers` function clears all userRoles, userProfiles, and usersRegistry. However, after reset, when a user logs in, `_initializeAccessControlWithSecret("")` is called automatically and registers them as a regular `#user`. When they then enter the admin token on the Profile tab, the backend's `initialize` function sees they already exist (`case (?_) {}`) and skips -- so they stay as a regular user and can never reclaim admin.

## Requested Changes (Diff)

### Add
- New backend function `claimAdminWithToken(token: Text): async Bool` that:
  - Reads `CAFFEINE_ADMIN_TOKEN` from env
  - If token matches AND `adminAssigned` is false, sets caller as `#admin`, sets `adminAssigned = true`, returns `true`
  - Works regardless of whether caller is already in `userRoles`
  - Returns `false` if token is wrong or admin already assigned

### Modify
- Frontend Profile tab: when admin token is entered and "Claim Admin Access" is clicked, call the new `claimAdminWithToken` instead of (or in addition to) `_initializeAccessControlWithSecret`
- If `claimAdminWithToken` returns true, set `isAdmin` in localStorage and show Admin tab

### Remove
- Nothing removed

## Implementation Plan
1. Add `claimAdminWithToken` to `main.mo` (directly modify the file, no codegen needed)
2. Update frontend Profile tab to call `claimAdminWithToken` when claiming admin access
