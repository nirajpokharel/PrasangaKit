import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../lib/theme-context";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  /** Unique identifier */
  id: string | number;
  /** Notification title */
  title: string;
  /** Notification body message */
  message?: string;
  /** Notification type */
  type?: NotificationType;
  /** Timestamp string (e.g. "2 min ago") */
  timestamp?: string;
  /** Whether the notification has been read */
  read?: boolean;
}

interface NotificationItemProps extends NotificationItem {
  /** Callback when notification is pressed */
  onPress?: (id: string | number) => void;
  /** Callback to mark as read */
  onMarkRead?: (id: string | number) => void;
  /** Callback to dismiss the notification */
  onDismiss?: (id: string | number) => void;
}

interface NotificationListProps {
  /** Array of notifications */
  notifications: NotificationItem[];
  /** Callback when a notification is pressed */
  onPress?: (id: string | number) => void;
  /** Callback to mark a notification as read */
  onMarkRead?: (id: string | number) => void;
  /** Callback to dismiss a notification */
  onDismiss?: (id: string | number) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Container style */
  containerStyle?: ViewStyle;
}

interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount?: number;
  /** Callback when bell is pressed */
  onPress?: () => void;
  /** Container style */
  containerStyle?: ViewStyle;
}

// ─── Single Notification Item ─────────────────────────────────────────────────

const NotificationItemComponent = React.forwardRef<
  View,
  NotificationItemProps
>(
  (
    {
      id,
      title,
      message,
      type = "info",
      timestamp,
      read = false,
      onPress,
      onMarkRead,
      onDismiss,
    },
    ref
  ) => {
    const { colors } = useTheme();

    const typeConfig: Record<
      NotificationType,
      { accent: string; bg: string; dotColor: string }
    > = {
      info: {
        accent: colors.primary,
        bg: colors.primaryLight,
        dotColor: colors.primary,
      },
      success: {
        accent: colors.success,
        bg: colors.successLight,
        dotColor: colors.success,
      },
      warning: {
        accent: colors.warning,
        bg: colors.warningLight,
        dotColor: colors.warning,
      },
      error: {
        accent: colors.destructive,
        bg: colors.destructiveLight,
        dotColor: colors.destructive,
      },
    };

    const config = typeConfig[type];

    const styles = StyleSheet.create({
      container: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: read ? colors.background : config.bg,
        borderLeftWidth: 3,
        borderLeftColor: read ? colors.border : config.accent,
      },
      dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: read ? colors.mutedForeground : config.dotColor,
        marginTop: 6,
        marginRight: 12,
      },
      content: {
        flex: 1,
      },
      title: {
        fontSize: 14,
        fontWeight: read ? "400" : "600",
        color: colors.foreground,
        lineHeight: 20,
      },
      message: {
        fontSize: 13,
        color: colors.mutedForeground,
        lineHeight: 18,
        marginTop: 2,
      },
      footer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        gap: 12,
      },
      timestamp: {
        fontSize: 11,
        color: colors.mutedForeground,
      },
      markReadButton: {
        paddingVertical: 2,
      },
      markReadText: {
        fontSize: 11,
        color: config.accent,
        fontWeight: "500",
      },
      dismissButton: {
        padding: 4,
        marginLeft: 8,
      },
      dismissText: {
        fontSize: 16,
        color: colors.mutedForeground,
        fontWeight: "600",
        lineHeight: 18,
      },
    });

    return (
      <TouchableOpacity
        ref={ref}
        style={styles.container}
        onPress={() => onPress?.(id)}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.dot} />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {message ? (
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          ) : null}
          {(timestamp || (!read && onMarkRead)) ? (
            <View style={styles.footer}>
              {timestamp ? (
                <Text style={styles.timestamp}>{timestamp}</Text>
              ) : null}
              {!read && onMarkRead ? (
                <TouchableOpacity
                  style={styles.markReadButton}
                  onPress={() => onMarkRead(id)}
                >
                  <Text style={styles.markReadText}>Mark as read</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
        {onDismiss ? (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => onDismiss(id)}
          >
            <Text style={styles.dismissText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    );
  }
);

NotificationItemComponent.displayName = "NotificationItem";

// ─── Notification List ────────────────────────────────────────────────────────

const NotificationList = React.forwardRef<View, NotificationListProps>(
  (
    {
      notifications,
      onPress,
      onMarkRead,
      onDismiss,
      emptyMessage = "No notifications",
      containerStyle,
    },
    ref
  ) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
      container: {
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
      },
      separator: {
        height: 1,
        backgroundColor: colors.muted,
      },
      empty: {
        paddingVertical: 32,
        alignItems: "center",
        justifyContent: "center",
      },
      emptyText: {
        fontSize: 14,
        color: colors.mutedForeground,
      },
    });

    if (notifications.length === 0) {
      return (
        <View ref={ref} style={[styles.container, containerStyle]}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        </View>
      );
    }

    return (
      <View ref={ref} style={[styles.container, containerStyle]}>
        {notifications.map((item, index) => (
          <React.Fragment key={item.id}>
            <NotificationItemComponent
              {...item}
              onPress={onPress}
              onMarkRead={onMarkRead}
              onDismiss={onDismiss}
            />
            {index < notifications.length - 1 ? (
              <View style={styles.separator} />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    );
  }
);

NotificationList.displayName = "NotificationList";

// ─── Notification Bell ────────────────────────────────────────────────────────

const NotificationBell = React.forwardRef<View, NotificationBellProps>(
  ({ unreadCount = 0, onPress, containerStyle }, ref) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
      wrapper: {
        position: "relative",
        alignSelf: "flex-start",
      },
      button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
      },
      bellIcon: {
        fontSize: 18,
      },
      badge: {
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.destructive,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: colors.background,
      },
      badgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: colors.destructiveForeground,
        lineHeight: 13,
      },
    });

    return (
      <View ref={ref} style={[styles.wrapper, containerStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : String(unreadCount)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
);

NotificationBell.displayName = "NotificationBell";

// ─── useNotifications hook ────────────────────────────────────────────────────

export function useNotifications(initialItems: NotificationItem[] = []) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialItems);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string | number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string | number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const add = (item: NotificationItem) => {
    setNotifications((prev) => [item, ...prev]);
  };

  const clear = () => {
    setNotifications([]);
  };

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    dismiss,
    add,
    clear,
  };
}

export {
  NotificationItemComponent as NotificationItem,
  NotificationList,
  NotificationBell,
};

export default NotificationList;
