import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ResourceTable } from '../helpers/ResourceTable';
import { type Notification, useGetNotifications, getNotificationTypeColor } from '../api/notifications';
import { NotificationStatsWidget } from '../components/NotificationStatsWidget';
import { Bell } from 'lucide-react';

const columns = (t: any) => [
  {
    header: t('notifications.user'),
    accessorKey: 'user_name',
    cell: (row: any) => row.user_name || 'N/A',
  },
  {
    header: t('forms.type'),
    accessorKey: 'notification_type',
    cell: (row: any) => (
      <span className={`px-2 py-1 rounded text-sm font-medium ${getNotificationTypeColor(row.notification_type)}`}>
        {t(`notifications.types.${row.notification_type}`) || row.notification_type}
      </span>
    ),
  },
  {
    header: t('forms.title'),
    accessorKey: 'title',
    cell: (row: any) => (
      <div className="max-w-xs truncate font-medium">{row.title}</div>
    ),
  },
  {
    header: t('forms.message'),
    accessorKey: 'message',
    cell: (row: any) => (
      <div className="max-w-md truncate text-gray-600">{row.message}</div>
    ),
  },
  {
    header: t('common.read'),
    accessorKey: 'is_read',
    cell: (row: any) => (
      <span className={row.is_read ? 'text-green-600 font-medium' : 'text-gray-400 font-medium'}>
        {row.is_read ? t('common.read') : t('common.unread')}
      </span>
    ),
  },
  {
    header: t('common.sent'),
    accessorKey: 'is_sent',
    cell: (row: any) => (
      <span className={row.is_sent ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
        {row.is_sent ? t('common.sent') : t('common.pending')}
      </span>
    ),
  },
  {
    header: t('forms.created_at'),
    accessorKey: 'created_at',
    cell: (row: any) => new Date(row.created_at).toLocaleString(),
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  const { data: notificationsData, isLoading } = useGetNotifications({
    params: {
      search: searchTerm,
      page: currentPage,
      notification_type: typeFilter,
      is_read: readFilter === '' ? undefined : readFilter === 'true',
    }
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, readFilter]);

  // Get the notifications array from the paginated response
  let notifications: Notification[] = [];
  if (notificationsData) {
    if (Array.isArray(notificationsData)) {
      notifications = notificationsData as unknown as Notification[];
    } else if ((notificationsData as any).results) {
      notifications = (notificationsData as any).results as unknown as Notification[];
    } else {
      notifications = [];
    }
  }

  // Enhance notifications with display ID
  const enhancedNotifications = notifications.map((notification: Notification, index: number) => ({
    ...notification,
    displayId: index + 1
  })) as any;

  const handleEdit = (notification: Notification) => {
    navigate(`/notifications/${notification.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const notificationTypes = [
    { value: 'post_rejected', label: t('notifications.types.post_rejected') },
    { value: 'post_approved', label: t('notifications.types.post_approved') },
    { value: 'post_published', label: t('notifications.types.post_published') },
    { value: 'payment_received', label: t('notifications.types.payment_received') },
    { value: 'info', label: t('notifications.types.info') },
    { value: 'warning', label: t('notifications.types.warning') },
    { value: 'error', label: t('notifications.types.error') },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
        </div>
      </div>

      {/* Statistics Widget */}
      <NotificationStatsWidget />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <input
            type="text"
            placeholder={t('placeholders.search_notifications')}
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full p-2 border rounded"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">{t('notifications.all_types')}</option>
            {notificationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            className="w-full p-2 border rounded"
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
          >
            <option value="">{t('notifications.all_status')}</option>
            <option value="false">{t('common.unread')}</option>
            <option value="true">{t('common.read')}</option>
          </select>
        </div>
        <div className="flex items-center justify-end">
          <div className="text-sm text-gray-600">
            {t('common.total')}: <span className="font-bold text-gray-900">{(notificationsData as any)?.count || enhancedNotifications.length}</span>
          </div>
        </div>
      </div>

      <ResourceTable
        data={enhancedNotifications}
        columns={columns(t)}
        isLoading={isLoading}
        onEdit={handleEdit as any}
        totalCount={(notificationsData as any)?.count || enhancedNotifications.length}
        pageSize={(notificationsData as any)?.page_size || 30}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
