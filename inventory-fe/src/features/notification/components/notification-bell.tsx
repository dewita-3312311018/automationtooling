import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "../api/use-notifications";
import { useMarkRead } from "../api/use-mark-read";
import { useMarkAllRead } from "../api/use-mark-all-read";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications({ limit: 50 });
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead();

  const items = notifications?.items || [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 shadow-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                markAllRead();
              }}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-3 opacity-20" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                You do not have any notifications yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-1 p-2">
              {items.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  className={`relative flex items-start gap-4 rounded-md p-3 text-sm transition-colors hover:bg-muted cursor-pointer ${!notification.isRead ? "bg-muted/50" : ""
                    }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markRead(notification.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !notification.isRead) {
                      markRead(notification.id);
                    }
                  }}
                >
                  {!notification.isRead && (
                    <span className="absolute left-1.5 top-5 flex h-2 w-2 rounded-full bg-blue-500" />
                  )}
                  <div className="grid gap-1 flex-1 pl-2">
                    <p
                      className={`text-sm leading-tight ${!notification.isRead ? "font-medium" : "text-muted-foreground"}`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { NotificationBell };
