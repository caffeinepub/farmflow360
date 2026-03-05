# FarmFlow360

## Current State
- Full-stack farm management app with Dashboard, DailyLogs, Rainfall, Labour, Harvest, Estates, Analytics, Weather screens.
- Bottom nav with 7 tabs (Home, Logs, Rain, Labour, Analytics, Harvest, Weather).
- `ProfileSetup` modal appears once on first login to let users enter their name.
- `useUserProfile` / `useSaveUserProfile` hooks exist and call `getCallerUserProfile` / `saveCallerUserProfile` backend APIs.
- No way to update name after initial setup.

## Requested Changes (Diff)

### Add
- New `ProfileScreen` component: a dedicated settings/profile page accessible from the app.
- A "Profile" tab in the bottom navigation bar (User/person icon).
- Profile screen shows: current name (editable), save button, and a sign-out option.

### Modify
- `App.tsx`: Add "profile" to the `Tab` union type, add profile tab to `NAV_ITEMS`, import and render `ProfileScreen` in the tab switcher.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/components/ProfileScreen.tsx`:
   - Fetch current profile with `useUserProfile`.
   - Pre-fill name input with `profile?.name`.
   - On save, call `useSaveUserProfile` mutation with the updated name.
   - Show success/error toast.
   - Show a sign-out / logout button using `useInternetIdentity`.
   - Match the existing Gen Z farm aesthetic (farm-gradient, rounded-xl cards, etc.).
2. Update `App.tsx`:
   - Add `"profile"` to the `Tab` union.
   - Add `{ id: "profile", label: "Profile", icon: UserCircle }` to `NAV_ITEMS`.
   - Add `case "profile": return <ProfileScreen />;` to the tab switcher.
