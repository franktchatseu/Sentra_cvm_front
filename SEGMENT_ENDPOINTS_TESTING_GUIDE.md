# Segment Compute Endpoints - Testing Guide

This guide shows you **where** and **how** to test each of the three compute endpoints in the UI.

---

## 📍 Testing Locations

### **1. `POST /segments/:id/refresh` - Single Segment Refresh**

**Location:** Segment Management Page → Individual Segment Action Menu

**Steps to Test:**

1. Navigate to `/dashboard/segments` (Segment Management page)
2. Find any existing segment in the table
3. Click the **three dots (⋯)** button in the "Actions" column for that segment
4. Click **"Compute Segment"** from the dropdown menu
5. Confirm the action in the dialog
6. **Expected:** Segment membership is refreshed (lighter operation)

**What it does:**

- Updates segment membership using database function
- Faster, incremental update
- Good for: Query updates, keeping segments current

**UI Flow:**

```
Segment Table → Actions Column (⋯) → "Compute Segment" → Confirm → Refresh
```

---

### **2. `POST /segments/recompute-segment-members` - Full Recompute (Single)**

**Location:** Segment Management Page → Create New Segment

**Steps to Test:**

1. Navigate to `/dashboard/segments`
2. Click **"Create Segment"** button (top right)
3. Fill in segment details:
   - Name
   - Description
   - Category (optional)
   - Add conditions/rules
4. Click **"Save"** or **"Create Segment"**
5. **Expected:**
   - Segment is created
   - Toast: "Segment created. Computing members..."
   - Full recompute runs automatically
   - Toast: "Segment created and computed successfully"

**What it does:**

- Full recomputation with enrichment
- Clears and rebuilds membership
- Good for: New segments (first-time computation)

**UI Flow:**

```
Create Segment Button → Fill Form → Save → Auto-recompute → Success
```

**Note:** This is the ONLY place where `recompute` is automatically called. For existing segments, you must use the refresh endpoint manually.

---

### **3. `POST /segments/batch/refresh` - Bulk Refresh (1-50 segments)**

**Location:** Segment Management Page → Bulk Selection Mode

**Steps to Test:**

1. Navigate to `/dashboard/segments`
2. Click **"Select Segments"** button (top right, next to "Create Segment")
   - This enters selection mode
   - Checkboxes appear in the table
3. Select multiple segments (1-50):
   - Click checkboxes next to segments you want to refresh
   - OR click the header checkbox to "Select All" visible segments
4. A **bulk actions toolbar** appears at the top showing:
   - "X segment(s) selected"
   - "Refresh All" button
5. Click **"Refresh All"** button
6. Confirm the action in the dialog
7. **Expected:** All selected segments are refreshed in bulk

**What it does:**

- Bulk refresh for 1-50 segments (lighter operation)
- Same as single refresh but for multiple segments
- Good for: Scheduled jobs, bulk updates

**UI Flow:**

```
Select Segments Button → Checkboxes Appear → Select Multiple → Bulk Toolbar → "Refresh All" → Confirm → Bulk Refresh
```

**Limitations:**

- Maximum 50 segments per batch
- If you select more than 50, you'll see an error: "Too many segments"

---

### **4. `POST /segments/:id/compute-size` - Size Estimate**

**Status:** ❌ **NOT CURRENTLY USED IN UI**

**What it does:**

- Quick size estimate without full computation
- Returns: `estimated_size`, `confidence`, `method`

**How to Test (if you want to add it):**

- Would need to add a button/action to trigger it
- Could be used in:
  - Segment list to show estimated size
  - Before creating campaigns (preview audience size)
  - Segment details page

**Current Behavior:**

- The UI shows `size_estimate` from the segment object, but doesn't call this endpoint to update it

---

## 🧪 Complete Testing Checklist

### Test 1: Single Segment Refresh

- [ ] Go to Segment Management page
- [ ] Click three dots (⋯) on any segment
- [ ] Click "Compute Segment"
- [ ] Confirm action
- [ ] Verify success message
- [ ] Check segment data is updated

### Test 2: New Segment with Full Recompute

- [ ] Go to Segment Management page
- [ ] Click "Create Segment"
- [ ] Fill in segment details
- [ ] Add at least one condition/rule
- [ ] Click "Save"
- [ ] Verify "Computing members..." message appears
- [ ] Verify "created and computed successfully" message
- [ ] Check new segment appears in list with computed data

### Test 3: Bulk Refresh (Multiple Segments)

- [ ] Go to Segment Management page
- [ ] Click "Select Segments" button
- [ ] Select 2-5 segments (checkboxes)
- [ ] Verify bulk toolbar appears
- [ ] Click "Refresh All"
- [ ] Confirm action
- [ ] Verify success message shows correct count
- [ ] Verify all selected segments are updated

### Test 4: Bulk Refresh Limit (50+ segments)

- [ ] Go to Segment Management page
- [ ] Click "Select Segments"
- [ ] Select more than 50 segments (if available)
- [ ] Click "Refresh All"
- [ ] Verify error: "Too many segments" (max 50)

### Test 5: Exit Selection Mode

- [ ] Enter selection mode
- [ ] Select some segments
- [ ] Click "Exit Selection" button
- [ ] Verify checkboxes disappear
- [ ] Verify bulk toolbar disappears
- [ ] Verify selection is cleared

---

## 🔍 Where to Find Each Action

### Segment Management Page (`/dashboard/segments`)

```
┌─────────────────────────────────────────────────────────┐
│  Segment Management                    [Select Segments] │
│  Create and manage customer segments   [Create Segment]  │
├─────────────────────────────────────────────────────────┤
│  [Stats Cards]                                          │
├─────────────────────────────────────────────────────────┤
│  [Search] [Filters]                                     │
├─────────────────────────────────────────────────────────┤
│  [Bulk Toolbar - appears when segments selected]       │
│  X segment(s) selected          [Refresh All]         │
├─────────────────────────────────────────────────────────┤
│  Segment Table:                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ☑ │ Name │ Type │ ... │ Actions (⋯)            │  │
│  │ ☐ │ Seg1 │ ...  │ ... │ [View] [Edit] [⋯]      │  │
│  │ ☐ │ Seg2 │ ...  │ ... │ [View] [Edit] [⋯]      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Action Menu (clicking ⋯):                             │
│  ┌──────────────────────────────────────┐               │
│  │  Compute Segment                    │ ← Refresh    │
│  │  Export Segment                      │               │
│  │  ─────────────────                   │               │
│  │  Edit                                │               │
│  │  Duplicate                           │               │
│  │  Delete                              │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Endpoint Summary

| Endpoint                     | Location                         | Action                 | Status      |
| ---------------------------- | -------------------------------- | ---------------------- | ----------- |
| `/refresh`                   | Action menu → "Compute Segment"  | Single segment refresh | ✅ Active   |
| `/recompute-segment-members` | Create segment → Auto after save | Full recompute for new | ✅ Active   |
| `/batch/refresh`             | Bulk selection → "Refresh All"   | Bulk refresh (1-50)    | ✅ Active   |
| `/compute-size`              | Not in UI                        | Size estimate          | ❌ Not used |

---

## 🐛 Debugging Tips

1. **Open Browser DevTools** (F12) → Network tab
2. **Filter by "segments"** to see API calls
3. **Look for:**
   - `POST /segments/:id/refresh` - Single refresh
   - `POST /segments/recompute-segment-members` - Full recompute
   - `POST /segments/batch/refresh` - Bulk refresh
4. **Check response:**
   - Status code (200 = success)
   - Response body for job_id, status, etc.

---

## ✅ Expected Results

### Single Refresh (`/refresh`)

- Returns: `ComputationStatusResponse` with `job_id`, `status`, `processed_count`
- Toast: "Segment refreshed successfully"

### Full Recompute (`/recompute-segment-members`)

- Returns: `{ recomputed: number; message: string }`
- Toast: "Segment created and computed successfully"

### Bulk Refresh (`/batch/refresh`)

- Returns: `{ refreshed: number; message: string }`
- Toast: "X segment(s) have been refreshed successfully"
