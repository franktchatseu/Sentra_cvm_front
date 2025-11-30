import {
  Notification,
  NotificationResponse,
  NotificationStats,
  GetNotificationsQuery,
  MarkAsReadRequest,
  MarkAllAsReadResponse,
  ApiSuccessResponse,
} from "../types/notification";

// Mock data - will be replaced when backend is ready
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "campaign_approval_request",
    title: "Campaign Approval Required",
    message: "Campaign 'Summer Promotion 2024' is pending your approval",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    actionUrl: "/dashboard/campaigns/123",
    actionLabel: "Review Campaign",
  },
  {
    id: 2,
    type: "campaign_approved",
    title: "Campaign Approved",
    message:
      "Your campaign 'Holiday Special' has been approved and is now active",
    priority: "medium",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    actionUrl: "/dashboard/campaigns/456",
    actionLabel: "View Campaign",
  },
  {
    id: 3,
    type: "campaign_rejected",
    title: "Campaign Rejected",
    message:
      "Campaign 'Test Campaign' was rejected. Reason: Missing required segments",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    actionUrl: "/dashboard/campaigns/789",
    actionLabel: "View Details",
  },
  {
    id: 4,
    type: "offer_approval_request",
    title: "Offer Approval Required",
    message: "Offer '50% Off Premium Plan' requires your approval",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    actionUrl: "/dashboard/offers/101",
    actionLabel: "Review Offer",
  },
  {
    id: 5,
    type: "segment_computation_completed",
    title: "Segment Computation Completed",
    message:
      "Segment 'High Value Customers' has finished computing with 15,234 members",
    priority: "low",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actionUrl: "/dashboard/segments/202",
    actionLabel: "View Segment",
  },
  {
    id: 6,
    type: "segment_computation_failed",
    title: "Segment Computation Failed",
    message:
      "Segment 'VIP Members' computation failed. Please check the segment criteria",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    actionUrl: "/dashboard/segments/303",
    actionLabel: "Fix Segment",
  },
  {
    id: 7,
    type: "scheduled_job_completed",
    title: "Scheduled Job Completed",
    message: "Daily report generation job completed successfully",
    priority: "low",
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: 8,
    type: "scheduled_job_failed",
    title: "Scheduled Job Failed",
    message:
      "Weekly segment refresh job failed. Error: Database connection timeout",
    priority: "urgent",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    actionUrl: "/dashboard/scheduled-jobs/404",
    actionLabel: "View Job",
  },
  {
    id: 9,
    type: "user_account_request",
    title: "New Account Request",
    message: "John Doe has requested access to the platform",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    actionUrl: "/dashboard/user-management",
    actionLabel: "Review Request",
  },
  {
    id: 10,
    type: "campaign_execution_started",
    title: "Campaign Execution Started",
    message: "Campaign 'Black Friday Sale' has started executing",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    actionUrl: "/dashboard/campaigns/505",
    actionLabel: "View Campaign",
  },
  {
    id: 11,
    type: "campaign_execution_completed",
    title: "Campaign Execution Completed",
    message:
      "Campaign 'Spring Promotion' has completed execution. 45,678 messages sent",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    actionUrl: "/dashboard/campaigns/606",
    actionLabel: "View Results",
  },
  {
    id: 12,
    type: "campaign_error",
    title: "Campaign Error",
    message: "Campaign 'Test Campaign 2' encountered an error during execution",
    priority: "urgent",
    isRead: false,
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // 9 hours ago
    actionUrl: "/dashboard/campaigns/707",
    actionLabel: "View Error",
  },
  {
    id: 13,
    type: "offer_approved",
    title: "Offer Approved",
    message: "Offer 'Welcome Bonus' has been approved",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    actionUrl: "/dashboard/offers/808",
    actionLabel: "View Offer",
  },
  {
    id: 14,
    type: "offer_rejected",
    title: "Offer Rejected",
    message:
      "Offer 'Limited Time Deal' was rejected. Please review the rejection reason",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(), // 11 hours ago
    actionUrl: "/dashboard/offers/909",
    actionLabel: "View Details",
  },
  {
    id: 15,
    type: "security_alert",
    title: "Security Alert",
    message:
      "Multiple failed login attempts detected from IP address 192.168.1.100",
    priority: "urgent",
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    actionUrl: "/dashboard/settings",
    actionLabel: "View Security",
  },
  {
    id: 16,
    type: "system_maintenance",
    title: "Scheduled Maintenance",
    message:
      "System maintenance scheduled for tonight at 2:00 AM. Expected downtime: 30 minutes",
    priority: "high",
    isRead: true,
    createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), // 13 hours ago
  },
  {
    id: 17,
    type: "channel_delivery_failure",
    title: "Channel Delivery Failure",
    message:
      "SMS delivery failed for campaign 'Promo Campaign'. 234 messages failed to deliver",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    actionUrl: "/dashboard/campaigns/1010",
    actionLabel: "View Campaign",
  },
  {
    id: 18,
    type: "communication_policy_violation",
    title: "Communication Policy Violation",
    message:
      "Campaign 'Flash Sale' violated DND policy. 12 messages sent outside allowed hours",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(), // 15 hours ago
    actionUrl: "/dashboard/campaign-communication-policy",
    actionLabel: "View Policy",
  },
  {
    id: 19,
    type: "feature_announcement",
    title: "New Feature Available",
    message:
      "Advanced segment analytics is now available. Explore new insights for your segments",
    priority: "low",
    isRead: true,
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    actionUrl: "/dashboard/segments",
    actionLabel: "Explore Feature",
  },
  {
    id: 20,
    type: "segment_refresh_needed",
    title: "Segment Refresh Needed",
    message:
      "Segment 'Active Users' hasn't been refreshed in 7 days. Consider refreshing it",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(), // 17 hours ago
    actionUrl: "/dashboard/segments/404",
    actionLabel: "Refresh Segment",
  },
  {
    id: 21,
    type: "role_permission_changed",
    title: "Role Permission Changed",
    message:
      "Your role permissions have been updated. You now have access to campaign management",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    actionUrl: "/dashboard/profile",
    actionLabel: "View Profile",
  },
  {
    id: 22,
    type: "broadcast_delivery_status",
    title: "Broadcast Delivery Status",
    message:
      "Manual broadcast 'Product Launch' has been delivered to 98.5% of recipients",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(), // 19 hours ago
    actionUrl: "/dashboard/quicklists/505",
    actionLabel: "View Broadcast",
  },
  {
    id: 23,
    type: "segment_large_computation_warning",
    title: "Large Segment Computation",
    message:
      "Segment 'All Customers' computation is taking longer than expected. Estimated time: 2 hours",
    priority: "medium",
    isRead: false,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    actionUrl: "/dashboard/segments/606",
    actionLabel: "View Segment",
  },
  {
    id: 24,
    type: "system_update",
    title: "System Update Available",
    message:
      "A new system update is available. New features include improved analytics and performance enhancements",
    priority: "low",
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
  },
];

// Store for managing read/unread state (in-memory only)
let notificationStore = [...MOCK_NOTIFICATIONS];

class NotificationService {
  // Simulate API delay
  private async delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET /notifications - Get all notifications for the current user
   */
  async getNotifications(
    query?: GetNotificationsQuery
  ): Promise<NotificationResponse> {
    await this.delay(200);

    let filtered = [...notificationStore];

    // Apply filters
    if (query?.type) {
      filtered = filtered.filter((n) => n.type === query.type);
    }
    if (query?.priority) {
      filtered = filtered.filter((n) => n.priority === query.priority);
    }
    if (query?.isRead !== undefined) {
      filtered = filtered.filter((n) => n.isRead === query.isRead);
    }
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.message.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination
    const page = query?.page || 1;
    const pageSize = query?.pageSize || 50;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginated,
      pagination: {
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  }

  /**
   * GET /notifications/stats - Get notification statistics
   */
  async getNotificationStats(): Promise<ApiSuccessResponse<NotificationStats>> {
    await this.delay(100);

    const unread = notificationStore.filter((n) => !n.isRead).length;
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    notificationStore.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
    });

    return {
      success: true,
      data: {
        total: notificationStore.length,
        unread,
        byType: byType as Record<NotificationType, number>,
        byPriority: byPriority as Record<NotificationPriority, number>,
      },
    };
  }

  /**
   * GET /notifications/:id - Get a specific notification
   */
  async getNotificationById(
    id: string | number
  ): Promise<ApiSuccessResponse<Notification>> {
    await this.delay(100);
    const notification = notificationStore.find((n) => n.id === id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    return {
      success: true,
      data: notification,
    };
  }

  /**
   * PATCH /notifications/mark-as-read - Mark notifications as read
   */
  async markAsRead(
    request: MarkAsReadRequest
  ): Promise<ApiSuccessResponse<{ count: number }>> {
    await this.delay(200);
    let count = 0;
    notificationStore = notificationStore.map((n) => {
      if (request.notificationIds.includes(n.id) && !n.isRead) {
        count++;
        return { ...n, isRead: true };
      }
      return n;
    });
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * PATCH /notifications/mark-all-as-read - Mark all notifications as read
   */
  async markAllAsRead(): Promise<MarkAllAsReadResponse> {
    await this.delay(200);
    let count = 0;
    notificationStore = notificationStore.map((n) => {
      if (!n.isRead) {
        count++;
        return { ...n, isRead: true };
      }
      return n;
    });
    return {
      success: true,
      message: `Marked ${count} notifications as read`,
      count,
    };
  }

  /**
   * DELETE /notifications/:id - Delete a notification
   */
  async deleteNotification(
    id: string | number
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.delay(200);
    const index = notificationStore.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error("Notification not found");
    }
    notificationStore.splice(index, 1);
    return {
      success: true,
      data: { deleted: true },
    };
  }

  /**
   * DELETE /notifications - Delete multiple notifications
   */
  async deleteNotifications(
    ids: (string | number)[]
  ): Promise<ApiSuccessResponse<{ count: number }>> {
    await this.delay(200);
    const initialLength = notificationStore.length;
    notificationStore = notificationStore.filter((n) => !ids.includes(n.id));
    const count = initialLength - notificationStore.length;
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * DELETE /notifications/read - Delete all read notifications
   */
  async deleteAllRead(): Promise<ApiSuccessResponse<{ count: number }>> {
    await this.delay(200);
    const initialLength = notificationStore.length;
    notificationStore = notificationStore.filter((n) => !n.isRead);
    const count = initialLength - notificationStore.length;
    return {
      success: true,
      data: { count },
    };
  }
}

export const notificationService = new NotificationService();
