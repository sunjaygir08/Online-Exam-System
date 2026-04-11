import React from 'react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Check } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../mockData.js';
import { cn } from '../lib/utils.js';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      localStorage.setItem('notifications', JSON.stringify(MOCK_NOTIFICATIONS));
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  const saveNotifications = (newNotifs) => {
    setNotifications(newNotifs);
    localStorage.setItem('notifications', JSON.stringify(newNotifs));
    window.dispatchEvent(new Event('notificationsUpdated'));
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated with your exam schedules and results.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500">You have no new notifications at the moment.</p>
          </Card>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id}>
              <Card className={cn(
                "p-6 transition-all duration-300", 
                !notif.read ? "border-brand-200 bg-brand-50/30 shadow-md" : "opacity-80"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    notif.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                    notif.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {notif.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                     notif.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{notif.title}</h3>
                        {!notif.read && <span className="w-2 h-2 bg-brand-600 rounded-full"></span>}
                      </div>
                      <span className="text-xs text-slate-500">{new Date(notif.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{notif.message}</p>
                    {!notif.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-brand-600 hover:bg-brand-50 h-8 px-3"
                        onClick={() => markAsRead(notif.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-600"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
