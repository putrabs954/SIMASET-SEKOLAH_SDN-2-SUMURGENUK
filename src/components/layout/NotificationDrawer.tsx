import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  Wrench,
  Boxes,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { db } from '../../services/db';
import { ActivePage, NotificationItem } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: ActivePage) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const notifications = db.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'stock_alert':
        return <Boxes className="w-4 h-4 text-rose-600" />;
      case 'late_borrowing':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'damaged_asset':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'maintenance_pending':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pusat Pemberitahuan</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} pemberitahuan baru` : 'Semua sudah dibaca'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-lg flex items-center gap-1 transition"
                  title="Tandai semua telah dibaca"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Tidak ada pemberitahuan</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    db.markNotificationAsRead(notif.id);
                    if (notif.link) {
                      onNavigate(notif.link as ActivePage);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                    notif.isRead
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-xs'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="min-w-0 flex-1 pr-3">
                      <h4 className="text-xs font-bold leading-snug">{notif.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <span>{formatDateTime(notif.createdAt)}</span>
                        {notif.link && (
                          <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                            Buka <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
