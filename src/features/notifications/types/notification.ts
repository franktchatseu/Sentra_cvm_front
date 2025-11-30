export type NotificationType =
  | "campaign_approval_request"
  | "campaign_approved"
  | "campaign_rejected"
  | "campaign_status_changed"
  | "campaign_execution_started"
  | "campaign_execution_completed"
  | "campaign_error"
  | "offer_approval_request"
  | "offer_approved"
  | "offer_rejected"
  | "offer_status_changed"
  | "segment_computation_completed"
  | "segment_computation_failed"
  | "segment_refresh_needed"
  | "segment_large_computation_warning"
  | "scheduled_job_completed"
  | "scheduled_job_failed"
  | "scheduled_job_started"
  | "user_account_request"
  | "role_permission_changed"
  | "system_maintenance"
  | "security_alert"
  | "broadcast_delivery_status"
  | "communication_policy_violation"
  | "channel_delivery_failure"
  | "system_update"
  | "feature_announcement"
  | "important_alert"
  | "general";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string | number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  userId?: number;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface MarkAsReadRequest {
  notificationIds: (string | number)[];
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message?: string;
  count?: number;
}

export interface GetNotificationsQuery {
  page?: number;
  pageSize?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  skipCache?: boolean;
}

// Type metadata for UI display
export interface NotificationTypeMetadata {
  label: string;
  icon: string;
  color: string;
  defaultPriority: NotificationPriority;
}

export const NOTIFICATION_TYPE_METADATA: Record<
  NotificationType,
  NotificationTypeMetadata
> = {
  campaign_approval_request: {
    label: "Campaign Approval Request",
    icon: "📋",
    color: "blue",
    defaultPriority: "high",
  },
  campaign_approved: {
    label: "Campaign Approved",
    icon: "✅",
    color: "green",
    defaultPriority: "medium",
  },
  campaign_rejected: {
    label: "Campaign Rejected",
    icon: "❌",
    color: "red",
    defaultPriority: "high",
  },
  campaign_status_changed: {
    label: "Campaign Status Changed",
    icon: "🔄",
    color: "blue",
    defaultPriority: "medium",
  },
  campaign_execution_started: {
    label: "Campaign Execution Started",
    icon: "🚀",
    color: "blue",
    defaultPriority: "medium",
  },
  campaign_execution_completed: {
    label: "Campaign Execution Completed",
    icon: "✨",
    color: "green",
    defaultPriority: "medium",
  },
  campaign_error: {
    label: "Campaign Error",
    icon: "⚠️",
    color: "red",
    defaultPriority: "urgent",
  },
  offer_approval_request: {
    label: "Offer Approval Request",
    icon: "📋",
    color: "blue",
    defaultPriority: "high",
  },
  offer_approved: {
    label: "Offer Approved",
    icon: "✅",
    color: "green",
    defaultPriority: "medium",
  },
  offer_rejected: {
    label: "Offer Rejected",
    icon: "❌",
    color: "red",
    defaultPriority: "high",
  },
  offer_status_changed: {
    label: "Offer Status Changed",
    icon: "🔄",
    color: "blue",
    defaultPriority: "medium",
  },
  segment_computation_completed: {
    label: "Segment Computation Completed",
    icon: "✅",
    color: "green",
    defaultPriority: "low",
  },
  segment_computation_failed: {
    label: "Segment Computation Failed",
    icon: "❌",
    color: "red",
    defaultPriority: "high",
  },
  segment_refresh_needed: {
    label: "Segment Refresh Needed",
    icon: "🔄",
    color: "yellow",
    defaultPriority: "medium",
  },
  segment_large_computation_warning: {
    label: "Large Segment Computation",
    icon: "⚠️",
    color: "yellow",
    defaultPriority: "medium",
  },
  scheduled_job_completed: {
    label: "Scheduled Job Completed",
    icon: "✅",
    color: "green",
    defaultPriority: "low",
  },
  scheduled_job_failed: {
    label: "Scheduled Job Failed",
    icon: "❌",
    color: "red",
    defaultPriority: "high",
  },
  scheduled_job_started: {
    label: "Scheduled Job Started",
    icon: "🚀",
    color: "blue",
    defaultPriority: "low",
  },
  user_account_request: {
    label: "User Account Request",
    icon: "👤",
    color: "blue",
    defaultPriority: "high",
  },
  role_permission_changed: {
    label: "Role Permission Changed",
    icon: "🔐",
    color: "yellow",
    defaultPriority: "high",
  },
  system_maintenance: {
    label: "System Maintenance",
    icon: "🔧",
    color: "yellow",
    defaultPriority: "high",
  },
  security_alert: {
    label: "Security Alert",
    icon: "🔒",
    color: "red",
    defaultPriority: "urgent",
  },
  broadcast_delivery_status: {
    label: "Broadcast Delivery Status",
    icon: "📢",
    color: "blue",
    defaultPriority: "medium",
  },
  communication_policy_violation: {
    label: "Communication Policy Violation",
    icon: "⚠️",
    color: "red",
    defaultPriority: "high",
  },
  channel_delivery_failure: {
    label: "Channel Delivery Failure",
    icon: "❌",
    color: "red",
    defaultPriority: "high",
  },
  system_update: {
    label: "System Update",
    icon: "🆕",
    color: "blue",
    defaultPriority: "medium",
  },
  feature_announcement: {
    label: "Feature Announcement",
    icon: "📢",
    color: "blue",
    defaultPriority: "low",
  },
  important_alert: {
    label: "Important Alert",
    icon: "🚨",
    color: "red",
    defaultPriority: "urgent",
  },
  general: {
    label: "General Notification",
    icon: "📬",
    color: "blue",
    defaultPriority: "low",
  },
};
