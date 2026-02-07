import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchUserById, toggleUserActive, type User } from '../api/users';
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  Globe,
  Calendar,
  Eye,
  Home,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  BadgeCheck,
  AtSign,
} from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      setToggling(true);
      await toggleUserActive(user.id);
      // Reload user data after toggle
      const updatedUser = await fetchUserById(user.id);
      setUser(updatedUser);
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      alert(err?.response?.data?.detail || err?.message || 'Failed to toggle user status');
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchUserById(parseInt(id));
        setUser(data);
        setError(null);
      } catch (err) {
        setError(t('messages.error.load_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, t]);

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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            {t('common.back')} {t('navigation.users')}
          </button>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="h-10 w-10 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive text-lg">{t('messages.error.title')}</h3>
              <p className="text-destructive/80 mt-1">{error || t('messages.error.not_found')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const languageLabels: { [key: string]: string } = {
    ru: 'Русский',
    uz: "O'zbekcha",
    kk: 'Қарақалпақша',
    en: 'English',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/users')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{t('common.back')} {t('navigation.users')}</span>
            </button>
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors cursor-pointer ${
                user.is_active
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {toggling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : user.is_active ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {user.is_active ? t('common.active') : t('common.inactive')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar & Basic Info */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 text-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-border"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-primary/10 flex items-center justify-center border-4 border-border">
                    <UserIcon className="h-16 w-16 text-primary" />
                  </div>
                )}
                <h1 className="mt-4 text-xl font-bold text-foreground">{user.full_name}</h1>
                {user.username && (
                  <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <AtSign size={14} />
                    {user.username}
                  </p>
                )}
                {user.is_agent && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                    <BadgeCheck size={14} />
                    {t('users.agent')}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 bg-muted/50 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">{t('users.statistics')}</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <Home className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{user.properties_count}</p>
                  <p className="text-xs text-muted-foreground">{t('users.properties')}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <Eye className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{user.views_count}</p>
                  <p className="text-xs text-muted-foreground">{t('users.views')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 bg-muted/50 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">{t('users.contact_info')}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telegram ID</p>
                    <p className="font-medium text-foreground">{user.telegram_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('forms.phone')}</p>
                    <p className="font-medium text-foreground">{user.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('users.preferred_language')}</p>
                    <p className="font-medium text-foreground">
                      {languageLabels[user.preferred_language] || user.preferred_language?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-4 bg-muted/50 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">{t('users.bio')}</h2>
                </div>
                <div className="p-6">
                  <p className="text-foreground whitespace-pre-wrap">{user.bio}</p>
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 bg-muted/50 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">{t('users.account_details')}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{t('users.created_at')}</p>
                    </div>
                    <p className="font-medium text-foreground">
                      {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{t('users.updated_at')}</p>
                    </div>
                    <p className="font-medium text-foreground">
                      {new Date(user.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{t('users.is_agent')}</p>
                    </div>
                    <p className={`font-medium ${user.is_agent ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {user.is_agent ? t('common.yes') : t('common.no')}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      {user.is_active ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <p className="text-xs text-muted-foreground">{t('users.is_active')}</p>
                    </div>
                    <p className={`font-medium ${user.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                      {user.is_active ? t('common.active') : t('common.inactive')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
