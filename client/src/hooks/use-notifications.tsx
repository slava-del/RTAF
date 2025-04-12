import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const { 
    data: notifications = [],
    isLoading,
    error,
    refetch: refetchNotifications,
  } = useQuery<Notification[], Error>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  
  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };
  
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
