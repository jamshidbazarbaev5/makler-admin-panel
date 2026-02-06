import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ResourceTable } from '../helpers/ResourceTable';
import { type Announcement, useGetAnnouncements } from '../api/announcements';

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');

  const columns = [
    {
      header: t('forms.id'),
      accessorKey: 'id',
      cell: (row: any) => row.id.substring(0, 8) + '...',
    },
    {
      header: t('forms.title'),
      accessorKey: 'title',
      cell: (row: any) => (
        <div className="max-w-xs truncate">{row.title}</div>
      ),
    },
    {
      header: t('announcements.property_type'),
      accessorKey: 'property_type',
      cell: (row: any) => (
        <span className="capitalize">
          {t(`announcements.property_types.${row.property_type}`) || row.property_type || 'N/A'}
        </span>
      ),
    },
    {
      header: t('announcements.listing_type'),
      accessorKey: 'listing_type',
      cell: (row: any) => (
        <span className={row.listing_type === 'sale' ? 'text-blue-600 font-medium' : 'text-green-600 font-medium'}>
          {t(`announcements.listing_types.${row.listing_type}`) || row.listing_type || 'N/A'}
        </span>
      ),
    },
    {
      header: t('announcements.price'),
      accessorKey: 'price',
      cell: (row: any) => (
        <div>
          {parseFloat(row.price).toLocaleString()} {row.currency?.toUpperCase()}
        </div>
      ),
    },
    {
      header: t('announcements.area'),
      accessorKey: 'area',
      cell: (row: any) => (
        <div>
          {row.area} {row.area_unit}
        </div>
      ),
    },
    {
      header: t('announcements.seller'),
      accessorKey: 'seller_name',
      cell: (row: any) => row.seller_name || 'N/A',
    },
    {
      header: t('forms.status'),
      accessorKey: 'status',
      cell: (row: any) => {
        const statusColors: { [key: string]: string } = {
          draft: 'text-gray-500',
          pending: 'text-yellow-600',
          active: 'text-green-600',
          rejected: 'text-red-600',
          inactive: 'text-gray-400',
          sold: 'text-blue-600',
        };
        return (
          <span className={`font-medium ${statusColors[row.status] || 'text-gray-600'}`}>
            {t(`announcements.status.${row.status}`) || row.status}
          </span>
        );
      },
    },
    {
      header: t('announcements.views'),
      accessorKey: 'views_count',
    },
    {
      header: t('forms.created_at'),
      accessorKey: 'created_at',
      cell: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const { data: announcementsData, isLoading } = useGetAnnouncements({
    params: {
      search: searchTerm,
      page: currentPage,
      status: statusFilter,
      listing_type: listingTypeFilter,
      property_type: propertyTypeFilter,
    }
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, listingTypeFilter, propertyTypeFilter]);

  // Get the announcements array from the paginated response
  let announcements: Announcement[] = [];
  if (announcementsData) {
    if (Array.isArray(announcementsData)) {
      announcements = announcementsData as unknown as Announcement[];
    } else if ((announcementsData as any).results) {
      announcements = (announcementsData as any).results as unknown as Announcement[];
    } else {
      announcements = [];
    }
  }

  // Enhance announcements with display ID
  const enhancedAnnouncements = announcements.map((announcement: Announcement, index: number) => ({
    ...announcement,
    displayId: index + 1
  })) as any;

  const handleEdit = (announcement: Announcement) => {
    navigate(`/announcements/${announcement.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('announcements.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <input
            type="text"
            placeholder={t('placeholders.search_announcements')}
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full p-2 border rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('announcements.all_status')}</option>
            <option value="draft">{t('announcements.status.draft')}</option>
            <option value="pending">{t('announcements.status.pending')}</option>
            <option value="active">{t('announcements.status.active')}</option>
            <option value="rejected">{t('announcements.status.rejected')}</option>
            <option value="inactive">{t('announcements.status.inactive')}</option>
            <option value="sold">{t('announcements.status.sold')}</option>
          </select>
        </div>
        <div>
          <select
            className="w-full p-2 border rounded"
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
          >
            <option value="">{t('announcements.all_property_types')}</option>
            <option value="apartment">{t('announcements.property_types.apartment')}</option>
            <option value="house">{t('announcements.property_types.house')}</option>
            <option value="commercial">{t('announcements.property_types.commercial')}</option>
            <option value="land">{t('announcements.property_types.land')}</option>
          </select>
        </div>
        <div>
          <select
            className="w-full p-2 border rounded"
            value={listingTypeFilter}
            onChange={(e) => setListingTypeFilter(e.target.value)}
          >
            <option value="">{t('announcements.all_listing_types')}</option>
            <option value="sale">{t('announcements.listing_types.sale')}</option>
            <option value="rent">{t('announcements.listing_types.rent')}</option>
          </select>
        </div>
      </div>

      <ResourceTable
        data={enhancedAnnouncements}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit as any}
        totalCount={(announcementsData as any)?.count || enhancedAnnouncements.length}
        pageSize={(announcementsData as any)?.page_size || 30}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
