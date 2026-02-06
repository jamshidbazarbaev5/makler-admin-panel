import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateStaff } from '../api/staff';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react';

export default function CreateStaffPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createStaff = useCreateStaff();

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: 'moderator' as 'admin' | 'moderator',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createStaff.mutateAsync({
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role,
        password: formData.password,
      });
      navigate('/staff');
    } catch (error) {
      console.error('Failed to create staff:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/staff')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('staff.create')}</h1>
              <p className="text-muted-foreground text-sm">{t('staff.add_new')}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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
            </div>
          </div>

          {/* Password */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('staff.security')}</h2>
              <p className="text-sm text-muted-foreground">{t('staff.security_desc')}</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('forms.password')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-muted-foreground" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/staff')}
              className="flex-1 px-6 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={createStaff.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createStaff.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('common.creating')}
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  {t('staff.create')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
