import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { notifications } from "../../data/mockData";

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const iconColors = {
            success: "bg-green-50 text-green-600",
            info: "bg-blue-50 text-blue-600",
            warning: "bg-orange-50 text-orange-600",
            error: "bg-red-50 text-red-600",
          };

          return (
            <Card
              key={notification.id}
              className={notification.read ? "bg-white" : "bg-blue-50/30 border-blue-200"}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-lg flex-shrink-0 ${iconColors[notification.type as keyof typeof iconColors]}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-400">{notification.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State (if no notifications) */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
