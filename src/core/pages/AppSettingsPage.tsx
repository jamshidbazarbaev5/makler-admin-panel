import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import { useGetAppSettings, useUpdateAppSettings, type AppSettings } from '../api/appSettings';

export default function AppSettingsPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading, isError, error } = useGetAppSettings();
  const updateSettings = useUpdateAppSettings();

  const [formData, setFormData] = useState<Partial<AppSettings>>({
    payment_enabled: false,
    featured_enabled: false,
    post_price: '0.00',
    featured_price: '0.00',
    post_duration_days: 30,
    featured_duration_days: 7,
    require_moderation: true,
    auto_deactivate_expired: true,
    notify_expiring_days: 3,
    max_images_per_post: 10,
    max_draft_announcements: 5,
    admin_phone: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        payment_enabled: settings.payment_enabled,
        featured_enabled: settings.featured_enabled,
        post_price: settings.post_price,
        featured_price: settings.featured_price,
        post_duration_days: settings.post_duration_days,
        featured_duration_days: settings.featured_duration_days,
        require_moderation: settings.require_moderation,
        auto_deactivate_expired: settings.auto_deactivate_expired,
        notify_expiring_days: settings.notify_expiring_days,
        max_images_per_post: settings.max_images_per_post,
        max_draft_announcements: settings.max_draft_announcements,
        admin_phone: settings.admin_phone,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      alert(t('app_settings.save_success'));
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('app_settings.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('app_settings.title')}</h1>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="h-10 w-10 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive text-lg">{t('app_settings.load_failed')}</h3>
              <p className="text-destructive/80 mt-1">
                {error instanceof Error ? error.message : t('messages.error.load_failed')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('app_settings.title')}</h1>
              <p className="text-muted-foreground text-sm">{t('app_settings.subtitle')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Settings */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('app_settings.payment.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('app_settings.payment.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.payment_enabled}
                    onChange={(e) => handleInputChange('payment_enabled', e.target.checked)}
                    className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-medium text-foreground">{t('app_settings.payment.enabled')}</span>
                    <p className="text-sm text-muted-foreground">{t('app_settings.payment.enabled_desc')}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.featured_enabled}
                    onChange={(e) => handleInputChange('featured_enabled', e.target.checked)}
                    className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-medium text-foreground">{t('app_settings.payment.featured_enabled')}</span>
                    <p className="text-sm text-muted-foreground">{t('app_settings.payment.featured_enabled_desc')}</p>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('app_settings.payment.post_price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.post_price}
                    onChange={(e) => handleInputChange('post_price', e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('app_settings.payment.featured_price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.featured_price}
                    onChange={(e) => handleInputChange('featured_price', e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Duration Settings */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('app_settings.duration.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('app_settings.duration.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('app_settings.duration.post_days')}
                  </label>
                  <input
                    type="number"
                    value={formData.post_duration_days}
                    onChange={(e) => handleInputChange('post_duration_days', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('app_settings.duration.featured_days')}
                  </label>
                  <input
                    type="number"
                    value={formData.featured_duration_days}
                    onChange={(e) => handleInputChange('featured_duration_days', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('app_settings.duration.expiry_notification')}
                  </label>
                  <input
                    type="number"
                    value={formData.notify_expiring_days}
                    onChange={(e) => handleInputChange('notify_expiring_days', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Moderation Settings */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('app_settings.moderation.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('app_settings.moderation.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.require_moderation}
                    onChange={(e) => handleInputChange('require_moderation', e.target.checked)}
                    className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-medium text-foreground">{t('app_settings.moderation.require')}</span>
                    <p className="text-sm text-muted-foreground">{t('app_settings.moderation.require_desc')}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.auto_deactivate_expired}
                    onChange={(e) => handleInputChange('auto_deactivate_expired', e.target.checked)}
                    className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-medium text-foreground">{t('app_settings.moderation.auto_deactivate')}</span>
                    <p className="text-sm text-muted-foreground">{t('app_settings.moderation.auto_deactivate_desc')}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Limits Settings */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('app_settings.limits.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('app_settings.limits.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('app_settings.limits.max_images')}
                  </label>
                  <input
                    type="number"
                    value={formData.max_images_per_post}
                    onChange={(e) => handleInputChange('max_images_per_post', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('app_settings.limits.max_drafts')}
                  </label>
                  <input
                    type="number"
                    value={formData.max_draft_announcements}
                    onChange={(e) => handleInputChange('max_draft_announcements', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('app_settings.contact.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('app_settings.contact.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('app_settings.contact.admin_phone')}
                </label>
                <input
                  type="text"
                  value={formData.admin_phone}
                  onChange={(e) => handleInputChange('admin_phone', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                  placeholder="+998 XX XXX XX XX"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updateSettings.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateSettings.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {updateSettings.isPending ? t('common.saving') : t('app_settings.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
