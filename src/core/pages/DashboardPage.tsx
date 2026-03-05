import { useEffect, useState } from 'react';
import { fetchDashboardData } from '../api/dashboard';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { Users, FileText, Clock, DollarSign, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { motion } from 'framer-motion';

interface DashboardData {
    summary: {
        total_users: number;
        active_announcements: number;
        pending_moderation: number;
        total_revenue: number;
    };
    charts: {
        revenue_by_month: Array<{ month: string; post: number; featured: number }>;
        announcements_by_status: Array<{ status: string; count: number }>;
        announcements_by_property_type: Array<{ property_type: string; count: number }>;
        users_by_month: Array<{ month: string; count: number }>;
        top_districts: Array<{ district: string; count: number }>;
    };
}

const CHART_PALETTE = [
    '#0ea5e9', // sky-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#10b981', // emerald-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
];

const STATUS_COLORS: Record<string, string> = {
    active: '#10b981',
    pending: '#f59e0b',
    rejected: '#ef4444',
    draft: '#94a3b8',
    inactive: '#6b7280',
    sold: '#8b5cf6',
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
};

const CustomTooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: '10px 14px',
    fontSize: '13px',
};

const DashboardSkeleton = () => (
    <div className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[380px] rounded-xl" />
            <Skeleton className="h-[380px] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[380px] rounded-xl" />
            <Skeleton className="h-[380px] rounded-xl" />
        </div>
    </div>
);

const DashboardPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        date_from: '',
        date_to: '',
    });

    const translateStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            active: t('announcements.status.active'),
            pending: t('announcements.status.pending'),
            rejected: t('announcements.status.rejected'),
            draft: t('announcements.status.draft'),
            inactive: t('announcements.status.inactive'),
            sold: t('announcements.status.sold'),
        };
        return statusMap[status] || status;
    };

    const translatePropertyType = (type: string) => {
        const typeMap: Record<string, string> = {
            apartment: t('announcements.property_types.apartment'),
            house: t('announcements.property_types.house'),
            commercial: t('announcements.property_types.commercial'),
            land: t('announcements.property_types.land'),
        };
        return typeMap[type] || type;
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (filters.year) params.year = filters.year;
            if (filters.date_from) params.date_from = filters.date_from;
            if (filters.date_to) params.date_to = filters.date_to;

            const result = await fetchDashboardData(params);
            setData(result);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleApplyFilters = () => {
        loadDashboardData();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
                <DashboardSkeleton />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">{t('dashboard.no_data')}</p>
            </div>
        );
    }

    const summaryCards = [
        {
            label: t('users.title'),
            value: data.summary.total_users.toLocaleString(),
            icon: Users,
            gradient: 'from-sky-500 to-blue-600',
            bgLight: 'bg-sky-50',
            textColor: 'text-sky-600',
        },
        {
            label: t('announcements.title'),
            value: data.summary.active_announcements.toLocaleString(),
            icon: FileText,
            gradient: 'from-emerald-500 to-green-600',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600',
        },
        {
            label: t('dashboard.pending_moderation'),
            value: data.summary.pending_moderation.toLocaleString(),
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-600',
        },
        {
            label: t('dashboard.total_revenue'),
            value: `${data.summary.total_revenue.toLocaleString()} сум  `,
            icon: DollarSign,
            gradient: 'from-violet-500 to-purple-600',
            bgLight: 'bg-violet-50',
            textColor: 'text-violet-600',
        },
    ];

    const statusData = data.charts.announcements_by_status.map((item) => ({
        ...item,
        translatedStatus: translateStatus(item.status),
        fill: STATUS_COLORS[item.status] || CHART_PALETTE[0],
    }));

    const propertyData = data.charts.announcements_by_property_type.map((item) => ({
        ...item,
        translatedType: translatePropertyType(item.property_type),
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {filters.year && `${filters.year}`}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="gap-2"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {t('common.filter')}
                </Button>
            </div>

            {/* Collapsible Filters */}
            {filtersOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                    {t('dashboard.year')}
                                </label>
                                <Input
                                    type="number"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                    placeholder="2026"
                                    className="h-9"
                                />
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                    {t('dashboard.date_from')}
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                    className="h-9"
                                />
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                    {t('dashboard.date_to')}
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                    className="h-9"
                                />
                            </div>
                            <Button onClick={handleApplyFilters} size="sm" className="h-9">
                                {t('common.filter')}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            className="group relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {/* Accent bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
                            <div className="p-5 pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {card.label}
                                        </p>
                                        <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                                    </div>
                                    <div className={`${card.bgLight} p-2.5 rounded-lg`}>
                                        <Icon className={`w-5 h-5 ${card.textColor}`} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Month */}
                <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-card rounded-xl border shadow-sm"
                >
                    <div className="p-5 pb-2 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold">{t('dashboard.revenue_by_month')}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.post_revenue')} & {t('dashboard.featured_revenue')}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-sky-50">
                            <TrendingUp className="w-4 h-4 text-sky-500" />
                        </div>
                    </div>
                    <div className="px-2 pb-4">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.charts.revenue_by_month} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                                />
                                <Bar
                                    dataKey="post"
                                    fill="#0ea5e9"
                                    name={t('dashboard.post_revenue')}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={32}
                                />
                                <Bar
                                    dataKey="featured"
                                    fill="#8b5cf6"
                                    name={t('dashboard.featured_revenue')}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Users Growth */}
                <motion.div
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-card rounded-xl border shadow-sm"
                >
                    <div className="p-5 pb-2 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold">{t('dashboard.users_growth')}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.new_users')}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-violet-50">
                            <Users className="w-4 h-4 text-violet-500" />
                        </div>
                    </div>
                    <div className="px-2 pb-4">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={data.charts.users_by_month}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <Tooltip contentStyle={CustomTooltipStyle} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8b5cf6"
                                    strokeWidth={2.5}
                                    fill="url(#userGradient)"
                                    name={t('dashboard.new_users')}
                                    dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Announcements by Status - Donut */}
                <motion.div
                    custom={6}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-card rounded-xl border shadow-sm"
                >
                    <div className="p-5 pb-2">
                        <h2 className="text-base font-semibold">{t('dashboard.announcements_by_status')}</h2>
                    </div>
                    <div className="px-2 pb-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="count"
                                    nameKey="translatedStatus"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    cornerRadius={4}
                                    label={({ translatedStatus, percent }) =>
                                        `${translatedStatus} ${(percent * 100).toFixed(0)}%`
                                    }
                                    labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={CustomTooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend as chips */}
                    <div className="px-5 pb-4 flex flex-wrap gap-2">
                        {statusData.map((entry, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground"
                            >
                                <span
                                    className="w-2 h-2 rounded-full inline-block"
                                    style={{ backgroundColor: entry.fill }}
                                />
                                {entry.translatedStatus}: {entry.count}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Announcements by Property Type */}
                <motion.div
                    custom={7}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-card rounded-xl border shadow-sm"
                >
                    <div className="p-5 pb-2">
                        <h2 className="text-base font-semibold">{t('dashboard.announcements_by_property_type')}</h2>
                    </div>
                    <div className="px-2 pb-4">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={propertyData} layout="vertical" barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis
                                    type="number"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    dataKey="translatedType"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fontSize: 13, fill: '#475569' }}
                                />
                                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Bar
                                    dataKey="count"
                                    name={t('dashboard.count')}
                                    radius={[0, 6, 6, 0]}
                                >
                                    {propertyData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Top Districts */}
            <motion.div
                custom={8}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="bg-card rounded-xl border shadow-sm"
            >
                <div className="p-5 pb-2">
                    <h2 className="text-base font-semibold">{t('dashboard.top_districts')}</h2>
                </div>
                <div className="px-2 pb-4">
                    <ResponsiveContainer width="100%" height={Math.max(300, (data.charts.top_districts.length || 5) * 44)}>
                        <BarChart data={data.charts.top_districts} layout="vertical" barSize={20}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                            />
                            <YAxis
                                dataKey="district"
                                type="category"
                                width={120}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 13, fill: '#475569' }}
                            />
                            <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                            <Bar
                                dataKey="count"
                                name={t('dashboard.count')}
                                radius={[0, 6, 6, 0]}
                            >
                                {data.charts.top_districts.map((_entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`hsl(${175 + index * 8}, 60%, ${45 + index * 3}%)`}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardPage;
