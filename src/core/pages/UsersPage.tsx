import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ResourceTable } from '../helpers/ResourceTable';
import { type User, useGetUsers, toggleUserActive } from '../api/users';

export default function UsersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  const handleToggleActive = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setTogglingUserId(user.id);
      await toggleUserActive(user.id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setTogglingUserId(null);
    }
  };

  const columns = [
    {
      header: t('forms.id'),
      accessorKey: 'id',
      cell: (row: any) => row.id,
    },
    {
      header: 'Telegram ID',
      accessorKey: 'telegram_id',
    },
    {
      header: t('forms.username'),
      accessorKey: 'username',
      cell: (row: any) => row.username || <span className="text-gray-400">-</span>,
    },
    {
      header: t('forms.full_name'),
      accessorKey: 'full_name',
    },
    {
      header: t('forms.phone'),
      accessorKey: 'phone',
      cell: (row: any) => row.phone || <span className="text-gray-400">-</span>,
    },
    {
      header: t('users.agent'),
      accessorKey: 'is_agent',
      cell: (row: any) => (
        <span className={row.is_agent ? 'text-green-600 font-medium' : 'text-gray-400'}>
          {row.is_agent ? t('common.yes') : t('common.no')}
        </span>
      ),
    },
    {
      header: t('forms.status'),
      accessorKey: 'is_active',
      cell: (row: any) => (
        <button
          onClick={(e) => handleToggleActive(row, e)}
          disabled={togglingUserId === row.id}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            row.is_active
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          } ${togglingUserId === row.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {togglingUserId === row.id ? '...' : (row.is_active ? t('common.active') : t('common.inactive'))}
        </button>
      ),
    },
    {
      header: t('users.preferred_language'),
      accessorKey: 'preferred_language',
      cell: (row: any) => row.preferred_language?.toUpperCase() || 'N/A',
    },
    {
      header: t('users.properties'),
      accessorKey: 'properties_count',
    },
    {
      header: t('users.views'),
      accessorKey: 'views_count',
    },
    {
      header: t('forms.created_at'),
      accessorKey: 'created_at',
      cell: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const { data: usersData, isLoading } = useGetUsers({
    params: {
      search: searchTerm,
      page: currentPage
    }
  });

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get the users array from the paginated response
  let users: User[] = [];
  if (usersData) {
    if (Array.isArray(usersData)) {
      users = usersData;
    } else if ((usersData as any).results) {
      users = (usersData as any).results;
    } else {
      users = [];
    }
  }

  // Enhance users with display ID
  const enhancedUsers = users.map((user: User, index: number) => ({
    ...user,
    displayId: index + 1
  }));

  const handleEdit = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('users.title')}</h1>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('placeholders.search_user')}
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={enhancedUsers}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        totalCount={(usersData as any)?.count || enhancedUsers.length}
        pageSize={(usersData as any)?.page_size || 30}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
