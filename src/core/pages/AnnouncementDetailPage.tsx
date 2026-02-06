import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAnnouncementById, type Announcement } from '../api/announcements';
import {
  ArrowLeft,
  MapPin,
  Home,
  Ruler,
  Layers,
  Phone,
  User,
  Eye,
  Heart,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Building2,
  DoorOpen,
  Loader2,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadAnnouncement = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchAnnouncementById(id);
        setAnnouncement(data);
        setError(null);
      } catch (err) {
        setError(t('announcement_detail.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncement();
  }, [id, t]);

  const nextImage = () => {
    if (announcement?.images && announcement.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === announcement.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (announcement?.images && announcement.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? announcement.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground font-medium">{t('announcement_detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/announcements')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            {t('announcement_detail.back')}
          </button>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="h-10 w-10 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive text-lg">{t('announcement_detail.error')}</h3>
              <p className="text-destructive/80 mt-1">{error || t('announcement_detail.not_found')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig: { [key: string]: { bg: string; text: string; icon: React.ReactNode } } = {
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Clock size={16} /> },
    approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle size={16} /> },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle size={16} /> },
    published: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <CheckCircle size={16} /> },
  };

  const status = statusConfig[announcement.status] || statusConfig.pending;
  const districtName = announcement.district?.translations?.ru?.name || 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/announcements')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{t('announcement_detail.back')}</span>
            </button>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${status.bg} ${status.text}`}>
              {status.icon}
              {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              {announcement.images && announcement.images.length > 0 ? (
                <div className="relative">
                  <div className="aspect-[16/10] bg-muted">
                    <img
                      src={announcement.images[currentImageIndex]?.image_url}
                      alt={`Announcement image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image Navigation */}
                  {announcement.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/90 hover:bg-background rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft size={24} className="text-foreground" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/90 hover:bg-background rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight size={24} className="text-foreground" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {announcement.images.length}
                      </div>
                    </>
                  )}

                  {/* Featured Badge */}
                  {announcement.is_featured && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg">
                      <Star size={14} fill="currentColor" />
                      {t('announcement_detail.featured')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[16/10] bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Home size={48} className="mx-auto mb-2" />
                    <p>{t('announcement_detail.no_images')}</p>
                  </div>
                </div>
              )}

              {/* Thumbnails */}
              {announcement.images && announcement.images.length > 1 && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {announcement.images.map((img, index) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                          index === currentImageIndex
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.image_small_url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {announcement.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin size={18} />
                <span>{districtName}</span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {announcement.description}
                </p>
              </div>
            </div>

            {/* Property Details Grid */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">{t('announcement_detail.property_details')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Home size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('announcement_detail.type')}</p>
                    <p className="font-semibold text-foreground capitalize">{t(`announcements.property_types.${announcement.property_type}`) || announcement.property_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Building2 size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('announcement_detail.listing')}</p>
                    <p className="font-semibold text-foreground capitalize">{t(`announcements.listing_types.${announcement.listing_type}`) || announcement.listing_type}</p>
                  </div>
                </div>

                {announcement.area && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Ruler size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('announcement_detail.area')}</p>
                      <p className="font-semibold text-foreground">{announcement.area} {announcement.area_unit}</p>
                    </div>
                  </div>
                )}

                {announcement.rooms && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <DoorOpen size={20} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('announcement_detail.rooms')}</p>
                      <p className="font-semibold text-foreground">{announcement.rooms}</p>
                    </div>
                  </div>
                )}

                {announcement.floor && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Layers size={20} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('announcement_detail.floor')}</p>
                      <p className="font-semibold text-foreground">
                        {announcement.floor}{announcement.total_floors ? ` / ${announcement.total_floors}` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {announcement.building_type && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Building2 size={20} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('announcement_detail.building')}</p>
                      <p className="font-semibold text-foreground capitalize">{announcement.building_type}</p>
                    </div>
                  </div>
                )}

                {announcement.condition && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                      <CheckCircle size={20} className="text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('announcement_detail.condition')}</p>
                      <p className="font-semibold text-foreground capitalize">{announcement.condition}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price & Info Cards */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-blue-100 text-sm mb-1">{t('announcement_detail.price')}</p>
              <p className="text-3xl sm:text-4xl font-bold mb-4">
                {parseFloat(announcement.price).toLocaleString()}
                <span className="text-xl ml-2">{announcement.currency?.toUpperCase()}</span>
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-blue-500/30">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-blue-200" />
                  <span className="text-blue-100">{announcement.views_count} {t('announcement_detail.views')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-blue-200" />
                  <span className="text-blue-100">{announcement.favorites_count} {t('announcement_detail.saved')}</span>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('announcement_detail.contact_info')}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <User size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('announcement_detail.seller_name')}</p>
                    <p className="font-semibold text-foreground">{announcement.seller_name}</p>
                  </div>
                </div>
                <a
                  href={`tel:${announcement.phone}`}
                  className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-xl hover:bg-emerald-500/20 transition-colors"
                >
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Phone size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('announcement_detail.phone')}</p>
                    <p className="font-semibold text-emerald-400">{announcement.phone}</p>
                  </div>
                </a>
                {announcement.seller_phone && announcement.seller_phone !== announcement.phone && (
                  <a
                    href={`tel:${announcement.seller_phone}`}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-3 bg-muted rounded-full">
                      <Phone size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('announcement_detail.alt_phone')}</p>
                      <p className="font-semibold text-foreground">{announcement.seller_phone}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Moderation Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('announcement_detail.moderation_status')}</h3>
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  announcement.is_moderated ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                }`}>
                  {announcement.is_moderated ? (
                    <BadgeCheck size={24} className="text-emerald-400" />
                  ) : (
                    <Clock size={24} className="text-amber-400" />
                  )}
                  <div>
                    <p className={`font-semibold ${announcement.is_moderated ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {announcement.is_moderated ? t('announcement_detail.moderated') : t('announcement_detail.pending_review')}
                    </p>
                    {announcement.moderated_by_name && (
                      <p className="text-sm text-muted-foreground">by {announcement.moderated_by_name}</p>
                    )}
                  </div>
                </div>

                {announcement.rejection_reason && (
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-sm font-medium text-red-400 mb-1">{t('announcements.status.rejected')}</p>
                    <p className="text-red-300">{announcement.rejection_reason}</p>
                  </div>
                )}

                {announcement.moderated_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={16} />
                    <span>{t('announcement_detail.moderated')}: {new Date(announcement.moderated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Promotion Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('app_settings.payment.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">{t('announcement_detail.featured')}</span>
                  <span className="font-semibold text-foreground capitalize">{announcement.promotion_type}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">{t('app_settings.payment.title')}</span>
                  <span className={`font-semibold capitalize ${
                    announcement.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {announcement.payment_status}
                  </span>
                </div>
                {announcement.is_featured && announcement.featured_until && (
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                    <span className="text-amber-400">{t('announcement_detail.expires')}:</span>
                    <span className="font-semibold text-amber-300">
                      {new Date(announcement.featured_until).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('announcement_detail.dates')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mt-0.5">
                    <Calendar size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('announcement_detail.created')}</p>
                    <p className="font-medium text-foreground">
                      {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg mt-0.5">
                    <Clock size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('announcement_detail.updated')}</p>
                    <p className="font-medium text-foreground">
                      {new Date(announcement.updated_at).toLocaleString()}
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
