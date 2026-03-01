import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { ResourceTable } from '../helpers/ResourceTable';
import { type Announcement, useGetAnnouncements, useModerateAnnouncement } from '../api/announcements';

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [moderateModalOpen, setModerateModalOpen] = useState(false);
  const [moderateAction, setModerateAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const moderateMutation = useModerateAnnouncement();


  const columns = [
    {
      header: t('forms.created_at'),
      accessorKey: 'created_at',
      cell: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: t('forms.image') || 'Фото',
      accessorKey: 'images',
      cell: (row: any) => (
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
            {row.images && row.images.length > 0 ? (
              <img
                src={row.images[0]?.image_small_url || row.images[0]?.image_url}
                alt={row.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            )}
          </div>
          {row.promotion_type === 'top' && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10">
              TOP
            </div>
          )}
        </div>
      ),
    },
    {
      header: t('forms.title'),
      accessorKey: 'title',
      cell: (row: any) => (
        <div className="max-w-[150px] truncate" title={row.title}>{row.title}</div>
      ),
    },
    {
      header: t('announcements.property_type'),
      accessorKey: 'property_type',
      cell: (row: any) => (
        <span>
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
          {row.area} {t(`announcements.area_units.${row.area_unit}`) || row.area_unit}
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
      header: t('forms.actions'),
      accessorKey: 'actions',
      cell: (row: any) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === 'pending' ? (
            <>
              <button
                onClick={() => handleOpenModerateModal(row.id, 'approve')}
                className="p-1 rounded hover:bg-green-100 text-green-600"
                title={t('announcements.approve')}
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleOpenModerateModal(row.id, 'reject')}
                className="p-1 rounded hover:bg-red-100 text-red-600"
                title={t('announcements.reject')}
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      ),
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

  const handleOpenModerateModal = (id: string, action: 'approve' | 'reject') => {
    setSelectedAnnouncementId(id);
    setModerateAction(action);
    setRejectionReason('');
    setModerateModalOpen(true);
  };

  const handleModerate = () => {
    if (selectedAnnouncementId && moderateAction) {
      const payload: { action: 'approve' | 'reject'; rejection_reason?: string } = {
        action: moderateAction,
      };
      if (moderateAction === 'reject') {
        payload.rejection_reason = rejectionReason;
      }
      moderateMutation.mutate(
        { id: selectedAnnouncementId, payload },
        {
          onSuccess: () => {
            setModerateModalOpen(false);
            setSelectedAnnouncementId(null);
            setModerateAction(null);
            setRejectionReason('');
          }
        }
      );
    }
  };

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
            <option value="rent_daily">{t('announcements.listing_types.rent_daily')}</option>
          </select>
        </div>
      </div>

      <ResourceTable
        data={enhancedAnnouncements}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleEdit as any}
        totalCount={(announcementsData as any)?.count || enhancedAnnouncements.length}
        pageSize={(announcementsData as any)?.page_size || 30}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Moderation Modal */}
      {moderateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {moderateAction === 'approve'
                ? t('announcements.approve_announcement')
                : t('announcements.reject_announcement')}
            </h2>
            {moderateAction === 'approve' ? (
              <p className="text-gray-600 mb-4">{t('announcements.approve_confirmation')}</p>
            ) : (
              <textarea
                className="w-full p-2 border rounded mb-4"
                rows={4}
                placeholder={t('announcements.rejection_reason_placeholder')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModerateModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                {t('forms.cancel')}
              </button>
              <button
                onClick={handleModerate}
                disabled={moderateMutation.isPending}
                className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
                  moderateAction === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {moderateAction === 'approve'
                  ? t('announcements.approve')
                  : t('announcements.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
