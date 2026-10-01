import React from 'react';
import { Bell, X, Clock, AlertTriangle, Truck, CheckCircle2 } from 'lucide-react';
import type { NotificationItem } from '../lib/donationStore';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'donation_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'volunteer_assigned':
      case 'picked_up':
      case 'delivered':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-emerald-950/10 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Notifications</h3>
              <p className="text-[11px] text-emerald-300">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[11px] text-emerald-300 hover:text-white font-medium underline"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No notifications yet</p>
              <p className="text-[11px] mt-0.5">Live food rescue alerts will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkRead(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.read
                    ? 'bg-gray-50/70 border-gray-100 text-gray-600'
                    : 'bg-emerald-50/50 border-emerald-200/60 text-emerald-950 shadow-xs'
                }`}
              >
                <div className="mt-0.5 w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold truncate text-[#142e20]">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            ResQFood Live Realtime Dispatch Engine
          </p>
        </div>
      </div>
    </div>
  );
};
