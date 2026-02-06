import { useEffect, useState } from 'react';
import { fetchNotificationStats, type NotificationStats, getNotificationTypeLabel } from '../api/notifications';
import { Bell, Check, Send, AlertCircle } from 'lucide-react';

interface NotificationStatsWidgetProps {
  onStatsLoaded?: (stats: NotificationStats) => void;
}

export function NotificationStatsWidget({ onStatsLoaded }: NotificationStatsWidgetProps) {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchNotificationStats();
        setStats(data);
        onStatsLoaded?.(data);
        setError(null);
      } catch (err) {
        setError('Failed to load notification stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [onStatsLoaded]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-800">
        {error || 'Could not load notification statistics'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Total Notifications</h3>
          <Bell className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">notifications</p>
        </div>
      </div>

      {/* Unread Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Unread</h3>
          <AlertCircle className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-yellow-600">{stats.unread}</p>
          <p className="text-sm text-gray-500">unread</p>
        </div>
      </div>

      {/* Unsent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Unsent</h3>
          <Send className="h-5 w-5 text-orange-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-orange-600">{stats.unsent}</p>
          <p className="text-sm text-gray-500">pending</p>
        </div>
      </div>

      {/* By Type Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">By Type</h3>
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div className="space-y-2">
          {Object.entries(stats.by_type).length > 0 ? (
            Object.entries(stats.by_type).slice(0, 3).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{getNotificationTypeLabel(type)}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No notifications by type</p>
          )}
          {Object.keys(stats.by_type).length > 3 && (
            <p className="text-xs text-gray-400 pt-2 border-t">
              +{Object.keys(stats.by_type).length - 3} more
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
