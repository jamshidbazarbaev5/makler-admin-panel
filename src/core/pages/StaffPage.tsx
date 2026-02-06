import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ResourceTable } from '../helpers/ResourceTable';
import {
  type Staff,
  useGetStaff,
  useChangeStaffPassword,
  useToggleStaffActive
} from '../api/staff';
import { Button } from '@/components/ui/button';
import {
  Key,
  Power,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function StaffPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [toggleActiveModalOpen, setToggleActiveModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: staffData, isLoading, refetch } = useGetStaff({
    params: {
      search: searchTerm,
      page: currentPage
    }
  });

  const changePassword = useChangeStaffPassword();
  const toggleActive = useToggleStaffActive();

  const columns = [
    {
      header: t('forms.id'),
      accessorKey: 'id',
      cell: (row: any) => row.id,
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
      header: t('forms.role'),
      accessorKey: 'role',
      cell: (row: any) => (
        <span className={row.role === 'admin' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
          {row.role === 'admin' ? t('staff.role_admin') : t('staff.role_moderator')}
        </span>
      ),
    },
    {
      header: t('staff.superuser'),
      accessorKey: 'is_superuser',
      cell: (row: any) => (
        <span className={row.is_superuser ? 'text-orange-600 font-medium' : 'text-gray-400'}>
          {row.is_superuser ? t('common.yes') : t('common.no')}
        </span>
      ),
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
    {
      header: t('forms.created_at'),
      accessorKey: 'created_at',
      cell: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get the staff array from the paginated response
  let staff: Staff[] = [];
  if (staffData) {
    if (Array.isArray(staffData)) {
      staff = staffData;
    } else if ((staffData as any).results) {
      staff = (staffData as any).results;
    } else {
      staff = [];
    }
  }

  // Enhance staff with display ID
  const enhancedStaff = staff.map((member: Staff, index: number) => ({
    ...member,
    displayId: index + 1
  }));

  const handleEdit = (member: Staff) => {
    navigate(`/edit-staff/${member.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Open change password modal
  const openPasswordModal = (member: Staff) => {
    setSelectedStaff(member);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalOpen(true);
  };

  // Open toggle active modal
  const openToggleActiveModal = (member: Staff) => {
    setSelectedStaff(member);
    setToggleActiveModalOpen(true);
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!selectedStaff?.id) return;

    try {
      await changePassword.mutateAsync({
        staffId: selectedStaff.id,
        newPassword: newPassword,
      });
      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      refetch();
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  // Handle toggle active
  const handleToggleActive = async () => {
    if (!selectedStaff?.id) return;

    try {
      await toggleActive.mutateAsync(selectedStaff.id);
      setToggleActiveModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  // Custom actions renderer
  const renderActions = (member: Staff) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          openPasswordModal(member);
        }}
        className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
        title={t('staff.change_password')}
      >
        <Key size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          openToggleActiveModal(member);
        }}
        className={`p-2 rounded-lg transition-colors ${
          member.is_active
            ? 'text-red-600 hover:bg-red-100'
            : 'text-green-600 hover:bg-green-100'
        }`}
        title={member.is_active ? t('staff.deactivate') : t('staff.activate')}
      >
        <Power size={16} />
      </button>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('staff.title')}</h1>
        <Button onClick={() => navigate('/create-staff')}>
          {t('staff.create')}
        </Button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('placeholders.search_staff')}
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={enhancedStaff}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        actions={renderActions}
        totalCount={(staffData as any)?.count || enhancedStaff.length}
        pageSize={(staffData as any)?.page_size || 30}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl border border-border w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {t('staff.change_password')}
              </h2>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('staff.change_password_for')} <span className="font-medium text-foreground">{selectedStaff?.full_name}</span>
              </p>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('forms.new_password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    placeholder={t('placeholders.enter_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-muted-foreground hover:text-foreground" />
                    ) : (
                      <Eye size={18} className="text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('forms.confirm_password')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    placeholder={t('forms.confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-muted-foreground hover:text-foreground" />
                    ) : (
                      <Eye size={18} className="text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changePassword.isPending || !newPassword}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePassword.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    {t('staff.change_password')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Active Modal */}
      {toggleActiveModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl border border-border w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedStaff.is_active ? t('staff.deactivate') : t('staff.activate')}
              </h2>
              <button
                onClick={() => setToggleActiveModalOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  selectedStaff.is_active ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {selectedStaff.is_active ? (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Power className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="text-foreground">
                    {selectedStaff.is_active ? t('messages.confirm.deactivate') : t('messages.confirm.activate')}{' '}
                    <span className="font-semibold">{selectedStaff.full_name}</span>?
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedStaff.is_active
                      ? t('staff.deactivate_confirm')
                      : t('staff.activate_confirm')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setToggleActiveModalOpen(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleToggleActive}
                disabled={toggleActive.isPending}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedStaff.is_active
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {toggleActive.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Power size={16} />
                    {selectedStaff.is_active ? t('staff.deactivate') : t('staff.activate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
