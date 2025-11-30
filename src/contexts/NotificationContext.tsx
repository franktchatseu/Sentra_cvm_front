import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { notificationService } from "../features/notifications/services/notificationService";
import {
  Notification,
  NotificationStats,
  GetNotificationsQuery,
} from "../features/notifications/types/notification";

interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: (query?: GetNotificationsQuery) => Promise<void>;
  markAsRead: (ids: (string | number)[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
  deleteNotifications: (ids: (string | number)[]) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
  pollInterval?: number; // Polling interval in milliseconds (default: 30 seconds)
}

export function NotificationProvider({
  children,
  pollInterval = 30000, // 30 seconds default
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch notifications
  const refreshNotifications = useCallback(
    async (query?: GetNotificationsQuery) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await notificationService.getNotifications({
          page: query?.page || 1,
          pageSize: query?.pageSize || 50,
          ...query,
        });
        if (isMountedRef.current) {
          setNotifications(response.data || []);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch notifications"
          );
          console.error("Failed to fetch notifications:", err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Fetch stats
  const refreshStats = useCallback(async () => {
    try {
      const response = await notificationService.getNotificationStats();
      if (isMountedRef.current && response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch notification stats:", err);
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(
    async (ids: (string | number)[]) => {
      try {
        await notificationService.markAsRead({ notificationIds: ids });
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            ids.includes(notif.id) ? { ...notif, isRead: true } : notif
          )
        );
        // Refresh stats
        await refreshStats();
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
        throw err;
      }
    },
    [refreshStats]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      // Refresh stats
      await refreshStats();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      throw err;
    }
  }, [refreshStats]);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string | number) => {
      try {
        await notificationService.deleteNotification(id);
        // Update local state
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        // Refresh stats
        await refreshStats();
      } catch (err) {
        console.error("Failed to delete notification:", err);
        throw err;
      }
    },
    [refreshStats]
  );

  // Delete multiple notifications
  const deleteNotifications = useCallback(
    async (ids: (string | number)[]) => {
      try {
        await notificationService.deleteNotifications(ids);
        // Update local state
        setNotifications((prev) =>
          prev.filter((notif) => !ids.includes(notif.id))
        );
        // Refresh stats
        await refreshStats();
      } catch (err) {
        console.error("Failed to delete notifications:", err);
        throw err;
      }
    },
    [refreshStats]
  );

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await notificationService.deleteAllRead();
      // Update local state
      setNotifications((prev) => prev.filter((notif) => !notif.isRead));
      // Refresh stats
      await refreshStats();
    } catch (err) {
      console.error("Failed to delete all read notifications:", err);
      throw err;
    }
  }, [refreshStats]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }
    setIsPolling(true);
    pollingIntervalRef.current = setInterval(() => {
      refreshNotifications();
      refreshStats();
    }, pollInterval);
  }, [pollInterval, refreshNotifications, refreshStats]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    refreshNotifications();
    refreshStats();
    // Start polling automatically
    startPolling();

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [refreshNotifications, refreshStats, startPolling, stopPolling]);

  const value: NotificationContextType = {
    notifications,
    stats,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
    deleteAllRead,
    startPolling,
    stopPolling,
    isPolling,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
