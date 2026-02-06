import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ResourceTable } from '../helpers/ResourceTable';
import { type District, useGetDistricts, getDistrictName } from '../api/districts';

export default function DistrictsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    {
      header: t('forms.id'),
      accessorKey: 'id',
    },
    {
      header: t('districts.name_ru'),
      accessorKey: 'translations',
      cell: (row: any) => getDistrictName(row, 'ru'),
    },
    {
      header: t('districts.name_uz'),
      accessorKey: 'translations',
      cell: (row: any) => getDistrictName(row, 'uz'),
    },
    {
      header: t('districts.name_kk'),
      accessorKey: 'translations',
      cell: (row: any) => getDistrictName(row, 'kaa'),
    },
    {
      header: t('common.order'),
      accessorKey: 'order',
    },
    {
      header: t('forms.status'),
      accessorKey: 'is_active',
      cell: (row: any) => (
        <span className={row.is_active ? 'text-green-600 font-medium' : 'text-red-600'}>
          {row.is_active ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
  ];

  const { data: districtsData, isLoading } = useGetDistricts({
    params: {
      search: searchTerm,
      page: currentPage
    }
  });

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get the districts array from the paginated response
  let districts: District[] = [];
  if (districtsData) {
    if (Array.isArray(districtsData)) {
      districts = districtsData as unknown as District[];
    } else if ((districtsData as any).results) {
      districts = (districtsData as any).results as unknown as District[];
    } else {
      districts = [];
    }
  }

  // Enhance districts with display ID
  const enhancedDistricts = districts.map((district: District, index: number) => ({
    ...district,
    displayId: index + 1
  })) as any;

  const handleEdit = (district: District) => {
    navigate(`/edit-district/${district.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('districts.title')}</h1>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('placeholders.search_districts')}
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={enhancedDistricts}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit as any}
        totalCount={(districtsData as any)?.count || enhancedDistricts.length}
        pageSize={(districtsData as any)?.page_size || 30}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
