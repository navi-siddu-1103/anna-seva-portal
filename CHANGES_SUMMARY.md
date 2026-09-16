# FPS Shop Listing Integration - Changes Summary

## Overview
When a distributor creates a profile and adds a shop address, that information now automatically appears in the cardholder dashboard's "Find FPS" page.

## Changes Made

### 1. Database Schema Update
**File:** `src/lib/database-types.ts`
- Added new `FPS` interface to define the structure for Fair Price Shop records
- Stores: distributorId, name, shopkeeper, hours, address, lat, lng, stockStatus, timestamps

### 2. Distributor Registration Enhancement
**File:** `src/app/api/auth/register/route.ts`
- Added automatic FPS record creation when a distributor registers
- New FPS records are created with:
  - Shop name from distributor profile
  - Owner name as shopkeeper
  - Address from registration form
  - Default business hours (9 AM - 6 PM)
  - Default stock status (Available)
  - Default coordinates for location (Bangalore coordinates)

### 3. Distributor Profile Update Handler
**File:** `src/app/api/distributor/profile/route.ts`
- Enhanced PUT endpoint to synchronize FPS record updates
- When distributor updates their profile (shop name, owner name, address), the FPS record is automatically updated
- If address changes, coordinates are recalculated

### 4. FPS List API Endpoint
**File:** `src/app/api/fps/list/route.ts` (NEW)
- New GET endpoint to fetch all FPS shops from the database
- Returns transformed data matching the FPS type used by frontend
- Excludes sensitive internal IDs from response

### 5. Cardholder Dashboard Update
**File:** `src/app/(main)/find-fps/page.tsx`
- Modified to fetch FPS data from API instead of using hardcoded fixtures
- Added loading states during data fetch
- Maintains error handling for failed API requests
- Falls back gracefully if FPS shops are unavailable

## How It Works

1. **Distributor Registration**: When a distributor registers with their shop address, an FPS record is created in the database
2. **Profile Updates**: If a distributor updates their shop address or name, the FPS record is synchronized
3. **Cardholder View**: Cardholders visiting the "Find FPS" page see all registered shop addresses in real-time
4. **Map Integration**: Shop locations appear both on the map and in the shop list

## Technical Details

- Uses MongoDB collections: `fps`, `distributors`, `users`
- Coordinates are currently using default Bangalore coordinates (placeholder for real geocoding service)
- FPS records are sorted by creation date (newest first)
- Public API endpoint doesn't expose internal distributor IDs for security

## Future Enhancements

- Integrate real geocoding API (Google Maps, OSM Nominatim) for accurate address-to-coordinates conversion
- Add support for shop hours customization
- Add real-time stock status updates from distributors
- Add shop ratings/reviews from cardholders
