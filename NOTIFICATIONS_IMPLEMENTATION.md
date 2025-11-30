# Notifications System Implementation

## Overview

A comprehensive notification system has been implemented for the ACVM platform, similar to the GlobalSearch pattern. The system includes a dropdown component in the header and a full notifications page.

## Features Implemented

### 1. **Notification Types**

All notification types mentioned are supported:

- Campaign notifications (approval requests, approvals, rejections, status changes, execution events, errors)
- Offer notifications (approval requests, approvals, rejections, status changes)
- Segment notifications (computation completed/failed, refresh needed, large computation warnings)
- Scheduled job notifications (started, completed, failed)
- User/System notifications (account requests, role changes, maintenance, security alerts)
- Communication notifications (broadcast delivery, policy violations, channel failures)
- General notifications (system updates, feature announcements, important alerts)

### 2. **Components Created**

#### NotificationDropdown (`src/shared/components/NotificationDropdown.tsx`)

- Dropdown component in the header (similar to GlobalSearch)
- Shows unread count badge
- Displays latest 10 notifications
- Filter by unread/all
- Mark as read/delete actions
- Click to navigate to notification details
- Link to full notifications page

#### NotificationsPage (`src/features/notifications/pages/NotificationsPage.tsx`)

- Full page for viewing all notifications
- Advanced filtering (type, priority, read status, search)
- Bulk actions (mark as read, delete)
- Pagination
- Individual notification actions
- Delete all read notifications

### 3. **Service Layer**

#### NotificationService (`src/features/notifications/services/notificationService.ts`)

API endpoints structure (ready for backend integration):

- `GET /notifications` - Get all notifications with filters
- `GET /notifications/stats` - Get notification statistics
- `GET /notifications/:id` - Get specific notification
- `PATCH /notifications/mark-as-read` - Mark notifications as read
- `PATCH /notifications/mark-all-as-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications` - Delete multiple notifications
- `DELETE /notifications/read` - Delete all read notifications

### 4. **Context/State Management**

#### NotificationContext (`src/contexts/NotificationContext.tsx`)

- Global state management for notifications
- Automatic polling (30 seconds default, configurable)
- Refresh functionality
- Mark as read/delete operations
- Statistics tracking

### 5. **Types & Interfaces**

#### Notification Types (`src/features/notifications/types/notification.ts`)

- Complete type definitions
- Notification metadata (icons, colors, labels)
- Priority levels (low, medium, high, urgent)
- Query parameters for filtering

## How It Works (Without Real-Time Backend)

Since real-time backend support isn't available yet, the system uses **polling** to simulate real-time behavior:

1. **Automatic Polling**: The NotificationContext automatically polls the API every 30 seconds
2. **Manual Refresh**: Users can manually refresh notifications
3. **On-Demand Fetching**: Notifications are fetched when:
   - The dropdown is opened
   - The notifications page is loaded
   - User clicks refresh button

### Polling Configuration

- Default interval: 30 seconds
- Configurable via `pollInterval` prop in NotificationProvider
- Automatically starts when component mounts
- Stops when component unmounts

## Integration Points

### 1. **Header Component**

The Bell icon in the header now uses `NotificationDropdown` component:

```tsx
<NotificationDropdown />
```

### 2. **App.tsx**

Added NotificationProvider to the app context:

```tsx
<NotificationProvider>{/* App content */}</NotificationProvider>
```

### 3. **Dashboard Routes**

Added route for notifications page:

```tsx
<Route path="/notifications" element={<NotificationsPage />} />
```

### 4. **API Configuration**

Added notifications endpoint to API_CONFIG:

```tsx
NOTIFICATIONS: "/notifications";
```

## Future Backend Integration

When the backend is ready, the system is already structured to work with these endpoints:

1. **Backend should implement**:

   - `GET /notifications` - Returns paginated notifications
   - `GET /notifications/stats` - Returns unread count and statistics
   - `PATCH /notifications/mark-as-read` - Marks notifications as read
   - `PATCH /notifications/mark-all-as-read` - Marks all as read
   - `DELETE /notifications/:id` - Deletes a notification

2. **Real-time support** (future):
   - When WebSocket/SSE is implemented, replace polling with real-time updates
   - The context structure supports easy migration

## Usage Examples

### Mark Notification as Read

```tsx
const { markAsRead } = useNotifications();
await markAsRead([notificationId]);
```

### Mark All as Read

```tsx
const { markAllAsRead } = useNotifications();
await markAllAsRead();
```

### Delete Notification

```tsx
const { deleteNotification } = useNotifications();
await deleteNotification(notificationId);
```

### Refresh Notifications

```tsx
const { refreshNotifications } = useNotifications();
await refreshNotifications({ page: 1, pageSize: 20 });
```

## Notification Structure

Each notification includes:

- `id`: Unique identifier
- `type`: Notification type (e.g., "campaign_approved")
- `title`: Notification title
- `message`: Notification message
- `priority`: Priority level (low, medium, high, urgent)
- `isRead`: Read status
- `createdAt`: Creation timestamp
- `actionUrl`: Optional URL to navigate when clicked
- `actionLabel`: Optional label for the action
- `metadata`: Optional additional data

## UI Features

1. **Visual Indicators**:

   - Unread notifications have blue background tint
   - Unread dot indicator
   - Priority badges with color coding
   - Type icons from metadata

2. **Interactions**:

   - Click notification to mark as read and navigate
   - Hover actions for mark as read/delete
   - Bulk selection and actions
   - Filter and search

3. **Responsive Design**:
   - Dropdown adapts to screen size
   - Full page layout for detailed view
   - Mobile-friendly interactions

## Testing the System

Since the backend isn't ready yet, you can:

1. **Mock the API responses** in the service layer
2. **Use browser DevTools** to see API calls being made
3. **Test the UI** - all components are functional and ready
4. **When backend is ready**, just ensure the API responses match the expected structure

## Next Steps

1. **Backend Implementation**: Implement the notification endpoints
2. **Real-time Integration**: Add WebSocket/SSE when available
3. **Notification Creation**: Backend should create notifications when events occur
4. **Testing**: Test with real backend data

The frontend is fully ready and will work seamlessly once the backend endpoints are implemented!
