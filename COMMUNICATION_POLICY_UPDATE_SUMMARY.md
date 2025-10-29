# Communication Policy Modal - Update Summary

## Overview
The Communication Policy modal has been redesigned to allow configuring **all 4 policy types simultaneously** in a single, clean interface. This eliminates the need to select a single policy type and provides a comprehensive view of all communication rules.

## Key Changes

### 1. **Multi-Type Configuration**
Previously, users had to select ONE policy type from a dropdown. Now:
- All 4 policy types are displayed in expandable accordion sections
- Users can configure Time Window, Maximum Communication, DND, and VIP List policies in one go
- Each section can be independently expanded/collapsed for better focus

### 2. **Accordion Interface**
```typescript
// Four main sections with expand/collapse:
- 🕐 Time Window (Define communication time intervals)
- 📊 Maximum Communication (Set message limits per period)
- 🔕 Do Not Disturb (Manage customer preferences)
- ⭐ VIP List (Include/exclude VIP customers)
```

### 3. **Design System Compliance**
The modal strictly follows the design specifications from `utils.ts`:
- **Colors**: Uses `color.primary.action`, `color.primary.accent`, etc.
- **Typography**: Applies `tw.heading`, `tw.cardTitle`, `tw.body`, `tw.caption`, `tw.label`
- **Components**: Uses `components.input.default`, `components.card.surface`
- **Borders & Spacing**: Consistent with design tokens

## Visual Structure

```
┌─────────────────────────────────────────────┐
│ Create Communication Policy            [×]  │
│ Configure all policy types in one place     │
├─────────────────────────────────────────────┤
│                                             │
│ Policy Name *    [________________]         │
│ Description      [________________]         │
│                  [________________]         │
│                                             │
│ Policy Configurations    [Expand/Collapse]  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🕐 Time Window                      [˅] │ │
│ │ Define interval time between start...  │ │
│ ├─────────────────────────────────────────┤ │
│ │ Start Time [09:00]  End Time [18:00]   │ │
│ │ Days: ☐ Mon ☐ Tue ☐ Wed ☐ Thu...      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📊 Maximum Communication            [˅] │ │
│ │ Set maximum number of communications   │ │
│ ├─────────────────────────────────────────┤ │
│ │ Period [Daily ˅]  Max Count [3]        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔕 Do Not Disturb                   [˅] │ │
│ │ Manage customer preferences            │ │
│ ├─────────────────────────────────────────┤ │
│ │ [+ Add Category]                       │ │
│ │ ┌─────────────────────────────────┐    │ │
│ │ │ Name [___] Type [___] [Delete]  │    │ │
│ │ └─────────────────────────────────┘    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ⭐ VIP List                         [˅] │ │
│ │ Include or exclude VIP customers       │ │
│ ├─────────────────────────────────────────┤ │
│ │ Action [Include ˅]  Priority [1]       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ☑ Active Policy                            │
│ Enable this policy to apply it...          │
│                                             │
├─────────────────────────────────────────────┤
│                        [Cancel] [Create]    │
└─────────────────────────────────────────────┘
```

## Technical Implementation

### State Management
```typescript
// Separate state for each policy type
const [configs, setConfigs] = useState<AllPolicyConfigs>({
    timeWindow: { startTime: '09:00', endTime: '18:00', ... },
    maximumCommunication: { type: 'daily', maxCount: 3 },
    dnd: { categories: [] },
    vipList: { action: 'include', vipLists: [], priority: 1 }
});

// Track expanded sections
const [expandedSections, setExpandedSections] = useState({
    timeWindow: true,
    maximumCommunication: true,
    dnd: true,
    vipList: true
});
```

### Type-Safe Updates
```typescript
const updateConfig = <T extends CommunicationPolicyType>(
    type: T,
    updater: (prev: AllPolicyConfigs[T]) => AllPolicyConfigs[T]
) => {
    setConfigs(prev => ({
        ...prev,
        [type]: updater(prev[type] as AllPolicyConfigs[T])
    }));
};
```

## Features

### 1. **Time Window Configuration**
- Start and end time inputs (HH:MM format)
- Optional day-of-week selection (Monday-Sunday)
- Timezone support

### 2. **Maximum Communication**
- Period type: Daily, Weekly, or Monthly
- Maximum count per period
- Reset time/day configuration

### 3. **Do Not Disturb (DND)**
- Dynamic category management with [+ Add Category] button
- Each category has:
  - Name field
  - Type dropdown (Marketing, Promotional, Transactional, Service, Other)
  - Delete button
- Scrollable list for multiple categories

### 4. **VIP List**
- Action: Include or Exclude
- Priority level (numeric)
- Info message about VIP list management

## UI/UX Improvements

1. **Expand/Collapse All**: Quick actions at the top to open or close all sections
2. **Icons**: Each policy type has a distinctive icon for quick recognition
3. **Visual Hierarchy**: Clear section headers with descriptions
4. **Consistent Spacing**: Follows design system spacing tokens
5. **Responsive**: Scrollable content area with fixed header and footer
6. **Max Height**: Modal is constrained to 90vh with internal scrolling

## Design System Colors

```typescript
// Primary Action (Buttons, CTAs)
color.primary.action = '#252829'

// Accent (Highlights, Focus)
color.primary.accent = '#4FDFF3'

// Status Colors
color.status.success = '#94DF5A'
color.status.danger = '#FC9C9C'
color.status.warning = '#F7B430'
color.status.info = '#C38BFB'

// Text Hierarchy
color.text.primary = '#000000'
color.text.secondary = '#394247'
color.text.muted = '#6B7280'

// Interactive States
color.interactive.hover = '#F3F4F6'
color.border.default = '#E5E7EB'
```

## File Structure

```
project/src/features/campaigns/
├── components/
│   ├── CommunicationPolicyModal.tsx (NEW - Multi-type modal)
│   └── CommunicationPolicyModal.backup.tsx (OLD - Single-type)
├── pages/
│   └── CommunicationPolicyPage.tsx (Unchanged - works with new modal)
└── types/
    └── communicationPolicyConfig.ts (Unchanged)
```

## Backend Considerations

**Note**: The current implementation saves only one policy type at a time. For full multi-type support, the backend API would need to be updated to:

1. Accept and store multiple policy configurations per policy
2. Return all configurations when fetching a policy
3. Apply all configured policy types when executing campaigns

Suggested backend schema:
```typescript
interface CommunicationPolicy {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    configs: {
        timeWindow?: TimeWindowConfig;
        maximumCommunication?: MaximumCommunicationConfig;
        dnd?: DNDConfig;
        vipList?: VIPListConfig;
    };
    created_at: string;
    updated_at: string;
}
```

## Migration Path

1. **Phase 1** (Current): UI supports all 4 types, saves one at a time
2. **Phase 2**: Update backend to accept multiple configs
3. **Phase 3**: Update frontend submission to send all configs
4. **Phase 4**: Update policy execution logic to apply all rules

## User Benefits

✅ **Faster Setup**: Configure all policies in one place  
✅ **Better Overview**: See all communication rules at once  
✅ **Cleaner UI**: Professional accordion interface  
✅ **Less Clicks**: No need to create 4 separate policies  
✅ **Consistent Design**: Follows official design system  

## Testing Checklist

- [ ] Modal opens with all sections expanded by default
- [ ] Each section can be independently expanded/collapsed
- [ ] "Expand All" / "Collapse All" buttons work correctly
- [ ] Time Window: Time inputs and day selection work
- [ ] Maximum Communication: Period type and count can be changed
- [ ] DND: Can add, edit, and delete categories
- [ ] VIP List: Action and priority can be configured
- [ ] Active Policy checkbox works
- [ ] Form validation (policy name required)
- [ ] Save button is disabled while saving
- [ ] Modal can be closed without saving (Cancel button)
- [ ] Design system styles are correctly applied
- [ ] Responsive behavior on smaller screens
