# FarmFlow360

## Current State
FarmFlow360 is a full-stack farm management mobile app with:
- Dashboard with streak, rainfall, expenses, revenue stats
- Daily Logs, Rainfall, Labour, Estates, Analytics screens
- Bottom nav with 5 tabs: Home, Logs, Rain, Labour, Analytics
- Backend has: CropYield, RevenueEntry, LabourEntry, RainfallLog, DailyLog, Estate types
- No harvest log / crop yield sales tracking UI exists yet

## Requested Changes (Diff)

### Add
- **HarvestScreen** (`src/frontend/src/components/HarvestScreen.tsx`): New screen for logging crop harvests and sales
  - Header: "Harvest Log 🌾" with total harvest value summary
  - Log Harvest form: Harvest Date, Crop Type (text input), Quantity (kg), Sale Price per Unit, auto-calculated Total Value
  - Records table/list showing: Harvest Date, Crop Type, Quantity, Sale Price/Unit, Total Value, Actions (Edit / Delete)
  - Edit inline or via dialog; Delete with confirmation
  - Uses backend `createCropYield` to store yield quantity and `createRevenueEntry` to store sale revenue
  - Harvest entries stored locally (combine CropYield + user-entered sale price in React state for the session; persisted via backend calls)
  - Since backend has no delete/update, implement edit/delete as local-only state management (entries managed in React state after initial fetch)

### Modify
- **App.tsx**: Add `harvest` tab to Tab type, NAV_ITEMS (icon: Wheat from lucide), renderTab switch case, import HarvestScreen
- **useQueries.ts**: Export `useCreateCropYield` and `useCreateRevenueEntry` mutations (already have query hooks, just need mutations)

### Remove
- Nothing removed

## Implementation Plan
1. Add `useCreateCropYield` and `useCreateRevenueEntry` mutations to `useQueries.ts`
2. Create `HarvestScreen.tsx` with:
   - Log Harvest form (date, crop type, quantity, sale price/unit, auto-calculated total)
   - Harvest records list with edit/delete actions
   - Edit dialog for modifying local entries
   - Delete confirmation per row
3. Update `App.tsx` to add Harvest tab with Wheat icon in bottom nav
