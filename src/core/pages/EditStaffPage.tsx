import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useUpdateStaff,
  useChangeStaffPassword,
  useToggleStaffActive,
  fetchStaffById,
  type Staff
} from '../api/staff';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Power,
  Key
} from 'lucide-react';

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const updateStaff = useUpdateStaff();
  const changePassword = useChangeStaffPassword();
  const toggleActive = useToggleStaffActive();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: 'moderator' as 'admin' | 'moderator',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const loadStaff = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchStaffById(parseInt(id));
        setStaff(data);
        setFormData({
          username: data.username,
          full_name: data.full_name,
          role: data.role as 'admin' | 'moderator',
        });
        setError(null);
      } catch (err) {
        setError(t('messages.error.load_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      await updateStaff.mutateAsync({
        id: parseInt(id),
        data: {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
        },
      });
      navigate('/staff');
    } catch (error) {
      console.error('Failed to update staff:', error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      await changePassword.mutateAsync({
        staffId: parseInt(id),
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert(t('messages.success.password_changed'));
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleToggleActive = async () => {
    if (!id || !staff) return;

    const action = staff.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this staff member?`)) return;

    try {
      const updatedStaff = await toggleActive.mutateAsync(parseInt(id));
      setStaff(updatedStaff);
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground font-medium">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/staff')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            {t('common.back')} {t('navigation.staff')}
          </button>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="h-10 w-10 text-destructive shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive text-lg">{t('messages.error.title')}</h3>
              <p className="text-destructive/80 mt-1">{error || t('messages.error.not_found')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('staff.edit')}</h1>
                <p className="text-muted-foreground text-sm">{staff.full_name}</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
            staff.is_active
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${staff.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {staff.is_active ? t('common.active') : t('common.inactive')}
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 bg-muted/50 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">{t('staff.basic_info')}</h2>
                <p className="text-sm text-muted-foreground">{t('staff.basic_info_desc')}</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('forms.username')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      placeholder={t('placeholders.enter_username')}
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('forms.full_name')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      placeholder={t('placeholders.enter_full_name')}
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('forms.role')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield size={18} className="text-muted-foreground" />
                    </div>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors appearance-none cursor-pointer"
                    >
                      <option value="moderator">{t('staff.role_moderator')}</option>
                      <option value="admin">{t('staff.role_admin')}</option>
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updateStaff.isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateStaff.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t('common.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {t('common.save')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Change Password Section */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('staff.change_password')}</h2>
                <p className="text-sm text-muted-foreground">{t('staff.security_desc')}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Key size={18} />
                {showPasswordForm ? t('common.cancel') : t('staff.change_password')}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('forms.new_password')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-muted-foreground" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
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
                    {t('forms.confirm_password')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-muted-foreground" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
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

                <button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePassword.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <Key className="h-5 w-5" />
                      {t('staff.change_password')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Account Status Section */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('staff.account_status')}</h2>
              <p className="text-sm text-muted-foreground">{t('staff.toggle_active')}</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    staff.is_active ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <Power size={24} className={staff.is_active ? 'text-emerald-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {staff.is_active ? t('common.active') : t('common.inactive')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {staff.is_active
                        ? t('staff.activate_confirm')
                        : t('staff.deactivate_confirm')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={toggleActive.isPending}
                  className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    staff.is_active
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {toggleActive.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Power size={18} />
                  )}
                  {staff.is_active ? t('staff.deactivate') : t('staff.activate')}
                </button>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('staff.account_info')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t('forms.created_at')}</p>
                  <p className="font-medium text-foreground">
                    {staff.created_at ? new Date(staff.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t('staff.last_login')}</p>
                  <p className="font-medium text-foreground">
                    {staff.last_login ? new Date(staff.last_login).toLocaleString() : '-'}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t('staff.superuser')}</p>
                  <p className="font-medium text-foreground">
                    {staff.is_superuser ? t('common.yes') : t('common.no')}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t('forms.updated_at')}</p>
                  <p className="font-medium text-foreground">
                    {staff.updated_at ? new Date(staff.updated_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
