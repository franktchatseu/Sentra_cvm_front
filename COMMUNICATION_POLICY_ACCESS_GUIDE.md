# How to Access the New Communication Policy Modal

## Navigation Path

1. **Open the application** at http://localhost:5173
2. **Navigate to Dashboard** → **Campaigns** section
3. **Click on** "Communication Policies" (in the campaigns menu)
4. **Click** the "+ Create Policy" button

## Quick Demo Steps

### Step 1: Click "Create Policy" Button
```
Communication Policies Page
┌────────────────────────────────────┐
│  [← Back]  Communication Policies  │
│                    [+ Create Policy] ← Click here
└────────────────────────────────────┘
```

### Step 2: Fill Basic Information
- **Policy Name**: Enter a descriptive name (e.g., "Standard Operating Hours")
- **Description**: Optional description of what this policy does

### Step 3: Configure All Policy Types
All sections are expanded by default. Configure each as needed:

#### 🕐 Time Window
- Set **Start Time**: 09:00
- Set **End Time**: 18:00
- Select **Days**: Check Monday through Friday
- Result: Communications only sent during business hours

#### 📊 Maximum Communication
- Select **Period Type**: Daily/Weekly/Monthly
- Set **Maximum Count**: e.g., 3 messages per day
- Result: Limits message frequency per customer

#### 🔕 Do Not Disturb (DND)
- Click **[+ Add Category]**
- Enter **Category Name**: e.g., "Marketing Emails"
- Select **Type**: Marketing/Promotional/etc.
- Add more categories as needed
- Result: Respects customer communication preferences

#### ⭐ VIP List
- Select **Action**: Include or Exclude
- Set **Priority**: 1-10
- Result: Special handling for VIP customers

### Step 4: Activate & Save
- Check ☑ **Active Policy** to enable immediately
- Click **[Create Policy]** button

## What Makes This New Design Better?

### Before (Old Design)
```
❌ Had to select ONE policy type from dropdown
❌ To configure all 4 types = create 4 separate policies
❌ No overview of all rules in one place
❌ More clicks and navigation
```

### After (New Design)
```
✅ All 4 policy types visible at once
✅ Configure everything in a single modal
✅ Clear accordion structure for organization
✅ Expand/Collapse controls for focus
✅ Professional, clean interface
```

## Design Highlights

### Visual Structure
- **Accordion Sections**: Each policy type is collapsible
- **Icons**: Distinctive icons for quick recognition
  - 🕐 Time Window
  - 📊 Maximum Communication
  - 🔕 Do Not Disturb
  - ⭐ VIP List
- **Color Scheme**: Follows design system with #252829 (action), #4FDFF3 (accent)
- **Typography**: Uses Satoshi font with proper hierarchy

### Responsive Features
- **Max Height**: Modal doesn't overflow screen (90vh max)
- **Scrollable Content**: Internal scrolling for long forms
- **Fixed Header/Footer**: Navigation always visible
- **Expand/Collapse All**: Bulk controls at the top

## Common Use Cases

### Use Case 1: Standard Business Hours Policy
```yaml
Time Window: 09:00 - 18:00 (Mon-Fri)
Maximum Communication: 3 per day
DND: Respect all categories
VIP List: Include (Priority 1)
```

### Use Case 2: Weekend Promotion Policy
```yaml
Time Window: 10:00 - 20:00 (Sat-Sun)
Maximum Communication: 5 per day
DND: Marketing only
VIP List: Exclude
```

### Use Case 3: Emergency Notifications Policy
```yaml
Time Window: 24/7 (All days)
Maximum Communication: Unlimited
DND: Override all except transactional
VIP List: Include (Priority 10)
```

## Keyboard Shortcuts

- **Esc**: Close modal without saving
- **Enter**: Submit form (when focused on inputs)
- **Tab**: Navigate between fields
- **Space**: Toggle checkboxes

## Validation Rules

### Required Fields
- ✓ **Policy Name**: Must not be empty
- ✓ **Time Window**: Start time must be before end time
- ✓ **Maximum Communication**: Count must be ≥ 1
- ✓ **DND Categories**: Name must not be empty if category added

### Optional Fields
- Description
- Days of week (defaults to all days if not specified)
- Timezone (defaults to UTC)
- DND categories (can be empty)

## Troubleshooting

### Modal doesn't open?
- Check browser console for errors
- Verify CommunicationPolicyModal.tsx is properly imported
- Ensure React portals are supported in your DOM

### Changes not saving?
- Check network tab for API errors
- Verify communicationPolicyService is working
- Check console for validation errors

### Styling looks wrong?
- Verify utils.ts design system is imported
- Check tokens.ts has correct color values
- Clear browser cache and reload

## Next Steps

After creating policies:
1. **View Created Policies**: See them listed in the table
2. **Edit Policies**: Click edit icon to modify
3. **Delete Policies**: Click delete icon (with confirmation)
4. **Apply to Campaigns**: Use in campaign creation flow
5. **Monitor Performance**: Track policy effectiveness

## Technical Notes

### File Locations
```
project/src/features/campaigns/
├── components/
│   └── CommunicationPolicyModal.tsx    ← New multi-type modal
├── pages/
│   └── CommunicationPolicyPage.tsx     ← Access point
└── types/
    └── communicationPolicyConfig.ts    ← Type definitions
```

### State Management
The modal maintains separate state for each policy type:
- `configs.timeWindow`
- `configs.maximumCommunication`
- `configs.dnd`
- `configs.vipList`

### Integration Points
- **Service Layer**: `communicationPolicyService.ts`
- **Context**: Uses `useToast` and `useConfirm`
- **Routing**: Via React Router from campaigns page
- **Design System**: `utils.ts` and `tokens.ts`

## Feedback & Improvements

This is version 1.0 of the multi-type policy modal. Future enhancements could include:
- Policy templates for common scenarios
- Bulk policy operations
- Policy duplication/cloning
- Advanced scheduling rules
- Customer segment-specific overrides
- Analytics on policy effectiveness
