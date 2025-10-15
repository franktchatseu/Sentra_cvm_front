import {
  Target,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Cog
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { color, tw } from '../../../shared/utils/utils';
import { campaignService } from '../../campaigns/services/campaignService';
import { Campaign } from '../../campaigns/types/campaign';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOffers: 0,
    totalSegments: 0,
    activeCampaigns: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats(stats);
      } catch {
        setDashboardStats({
          totalOffers: 0,
          totalSegments: 0,
          activeCampaigns: 0,
          conversionRate: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setCampaignsLoading(true);
        const response = await campaignService.getAllCampaigns({
          pageSize: 10,
          sortBy: 'created_at',
          sortDirection: 'DESC'
        });
        // Filter out archived campaigns and take only 3
        const filteredCampaigns = (response.data as Campaign[])
          .filter(campaign => (campaign as { status: string }).status !== 'archived')
          .slice(0, 3);
        setCampaigns(filteredCampaigns);
      } catch {
        setCampaigns([]);
      } finally {
        setCampaignsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getFirstName = () => {
    if (user && 'email' in user && user.email && typeof user.email === 'string') {
      const emailName = user.email.split('@')[0];
      const nameWithoutNumbers = emailName.replace(/\d+/g, '');
      return nameWithoutNumbers.charAt(0).toUpperCase() + nameWithoutNumbers.slice(1).toLowerCase();
    }
    return 'user';
  };


  // Helper function to get segment name from campaign
  const getSegmentName = (campaign: Campaign): string => {
    if (campaign.campaign_type === 'multiple_target_group') {
      return campaign.config.segments[0]?.name || 'Multiple Segments';
    } else if (campaign.campaign_type === 'champion_challenger') {
      return campaign.config.champion?.name || 'Champion Segment';
    } else if (campaign.campaign_type === 'ab_test') {
      return campaign.config.variant_a?.name || 'A/B Test Segments';
    } else if (campaign.campaign_type === 'round_robin' || campaign.campaign_type === 'multiple_level') {
      return campaign.config.segment?.name || 'Single Segment';
    }
    return 'High Value Customers';
  };

  const quickActions = [
    { name: 'Create Campaign', href: '/dashboard/campaigns/create', icon: Target, entity: 'campaigns' },
    { name: 'New Offer', href: '/dashboard/offers/create', icon: MessageSquare, entity: 'offers' },
    { name: 'Build Segment', href: '/dashboard/segments/create', icon: Users, entity: 'segments' },
    { name: 'Configuration', href: '/dashboard/configuration', icon: Cog, entity: 'configuration' },
    // { name: 'View Analytics', href: '/dashboard/analytics', icon: Activity }
  ];

  const stats = [
    {
      name: 'Active Campaigns',
      value: loading ? '...' : (dashboardStats?.activeCampaigns ?? 0).toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Target,
      entity: 'campaigns',
      color: color.entities.campaigns,  // Vibrant Sage Green
      gradient: `from-[${color.entities.campaigns}] to-[${color.entities.campaigns}]/80`
    },
    {
      name: 'Total Segments',
      value: loading ? '...' : (dashboardStats?.totalSegments ?? 0).toString(),
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      entity: 'segments',
      color: color.entities.segments,  // Sky Blue
      gradient: `from-[${color.entities.segments}] to-[${color.entities.segments}]/80`
    },
    {
      name: 'Total Offers',
      value: loading ? '...' : (dashboardStats?.totalOffers ?? 0).toString(),
      change: '-3%',
      changeType: 'negative',
      icon: MessageSquare,
      entity: 'offers',
      color: color.entities.offers,  // Turquoise Teal
      gradient: `from-[${color.entities.offers}] to-[${color.entities.offers}]/80`
    },
    {
      name: 'Conversion Rate',
      value: loading ? '...' : `${dashboardStats?.conversionRate ?? 0}%`,
      change: '+5.2%',
      changeType: 'positive',
      icon: TrendingUp,
      entity: 'analytics',
      color: color.entities.analytics,  // Plum Purple
      gradient: `from-[${color.entities.analytics}] to-[${color.entities.analytics}]/80`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-left">
        <div
          className="flex items-center space-x-4 mb-4"
          style={{
            animation: 'fadeInUp 0.6s ease-out forwards 0.1s',
            opacity: 0,
            transform: 'translateY(20px)'
          }}
        >

          <div>
            <h1 className={`lg:text-3xl text-2xl font-bold`} style={{ color: color.sentra.dark }}>
              Welcome back, {getFirstName()}
              <span className="text-2xl">👋</span>

            </h1>
            <p className={`${tw.textSecondary}  mt-2 text-sm font-medium`}>
              Here's what's happening with your campaigns today. Your performance is looking great!
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group cursor-pointer relative bg-white rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:z-20 hover:scale-105 hover:-translate-y-2 shadow-xs hover:shadow-sm transition-all duration-300"
              style={{
                animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                opacity: 0,
                transition: 'all 0.5s ease-out'
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-2xl group-hover:scale-110 transition-all duration-500 ease-out transform-gpu shadow-sm group-hover:shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color}, ${stat.color}E6)`,
                      boxShadow: `0 4px 12px ${stat.color}20`
                    }}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:rotate-12 group-hover:text-white transition-all duration-500 ease-out" />
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-bold group-hover:scale-105 transition-all duration-500 ease-out transform-gpu shadow-sm ${stat.changeType === 'positive'
                    ? `bg-gradient-to-r from-[${color.status.success.light}] to-[${color.status.success.light}]/80 text-[${color.status.success.main}] border border-[${color.status.success.main}]/20`
                    : `bg-gradient-to-r from-[${color.status.error.light}] to-[${color.status.error.light}]/80 text-[${color.status.error.main}] border border-[${color.status.error.main}]/20`
                    }`}>
                    {stat.change}
                  </div>
                </div>

                <div>
                  <p className={`text-sm sm:text-sm font-medium ${tw.textSecondary} mb-1 group-hover:${tw.textPrimary} transition-colors duration-500 ease-out`}>{stat.name}</p>
                  <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${tw.textPrimary} group-hover:scale-105 transition-all duration-500 ease-out transform-gpu`}>{stat.value}</p>
                </div>

                <div className={`mt-3 flex items-center text-sm ${tw.textMuted} group-hover:${tw.textSecondary} transition-colors duration-500 ease-out`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className={`h-3 w-3 text-[${color.status.success.main}] mr-1 group-hover:scale-110 transition-all duration-500 ease-out transform-gpu`} />
                  ) : (
                    <ArrowDownRight className={`h-3 w-3 text-[${color.status.error.main}] mr-1 group-hover:scale-110 transition-all duration-500 ease-out transform-gpu`} />
                  )}
                  <span className="group-hover:font-medium transition-all duration-500 ease-out">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8 lg:items-stretch">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2 flex">
          <div className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden transition-all duration-500 shadow-xs hover:shadow-sm group flex-1">
            <div className="p-4 sm:p-6 bg-white border-b border-gray-200/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div>
                  <h2 className={`text-xl  font-bold ${tw.textPrimary}`}>Recent Campaigns</h2>
                  <p className={`${tw.textSecondary} text-sm sm:text-sm mt-1 font-medium`}>Monitor your active and scheduled campaigns</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/campaigns')}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md w-full sm:w-auto text-white"
                  style={{
                    backgroundColor: color.sentra.main
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                  }}
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {campaignsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className={tw.textSecondary}>No campaigns found</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  {campaigns.map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="group relative bg-white rounded-xl p-4 sm:p-6 border border-gray-200/50 hover:border-gray-300 hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-500 cursor-pointer shadow-sm"
                      style={{
                        animation: `fadeInUp 0.6s ease-out forwards ${(index + 4) * 0.1}s`,
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r from-[${color.entities.campaigns}]/5 to-[${color.entities.offers}]/5 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-500`}></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold ${tw.textPrimary} text-base sm:text-lg group-hover:${tw.textPrimary} transition-colors duration-300 break-words`}>{campaign.name}</h3>
                            <p className={`text-sm ${tw.textSecondary} mt-1 font-medium flex items-center`}>
                              <Users className={`h-4 w-4 mr-2 text-[${color.entities.segments}]`} />
                              {getSegmentName(campaign)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            <span className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${campaign.status === 'active'
                              ? `bg-[${color.status.success.light}] text-[${color.status.success.main}] border border-[${color.status.success.main}]/20 group-hover:bg-[${color.status.success.main}]/10`
                              : `bg-[${color.status.warning.light}] text-[${color.status.warning.main}] border border-[${color.status.warning.main}]/20 group-hover:bg-[${color.status.warning.main}]/10`
                              }`}>
                              {campaign.status}
                            </span>
                            <span className={`text-sm ${tw.textMuted} bg-gray-100 px-3 py-1 rounded-full`}>
                              {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'No date'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/campaigns/${campaign.id}`);
                              }}
                              className="p-2.5 rounded-lg transition-all duration-300"
                              style={{
                                color: color.ui.text.muted,
                                backgroundColor: 'transparent'
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {campaign.status === 'active' && campaign.performance && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div
                              className="rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md border border-gray-200/50"
                              style={{ background: `linear-gradient(135deg, white, ${color.entities.segments}20)` }}
                            >
                              <div className="flex items-center justify-center mb-2">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{
                                    background: `linear-gradient(135deg, ${color.entities.segments}, ${color.entities.segments}CC)`
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="text-xl sm:text-2xl font-bold mb-1 text-black">
                                {campaign.performance.response.toLocaleString()}
                              </div>
                              <div className="text-sm font-semibold text-black">
                                Response
                              </div>
                            </div>

                            <div
                              className="rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md border border-gray-200/50"
                              style={{ background: `linear-gradient(135deg, white, ${color.entities.campaigns}20)` }}
                            >
                              <div className="flex items-center justify-center mb-2">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{
                                    background: `linear-gradient(135deg, ${color.entities.campaigns}, ${color.entities.campaigns}CC)`
                                  }}
                                >
                                  <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="text-xl sm:text-2xl font-bold mb-1 text-black">
                                {campaign.performance.delivered.toLocaleString()}
                              </div>
                              <div className="text-sm font-semibold text-black">
                                Delivered
                              </div>
                            </div>

                            <div
                              className="rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md border border-gray-200/50"
                              style={{ background: `linear-gradient(135deg, white, ${color.entities.offers}20)` }}
                            >
                              <div className="flex items-center justify-center mb-2">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{
                                    background: `linear-gradient(135deg, ${color.entities.offers}, ${color.entities.offers}CC)`
                                  }}
                                >
                                  <Target className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="text-xl sm:text-2xl font-bold mb-1 text-black">
                                {campaign.performance.converted.toLocaleString()}
                              </div>
                              <div className="text-sm font-semibold text-black">
                                Converted
                              </div>
                            </div>
                          </div>
                        )}

                        {(campaign.status === 'pending_approval' || campaign.status === 'approved' || campaign.status === 'draft') && (
                          <div className={`bg-gradient-to-r from-[${color.status.warning.light}] to-[${color.status.warning.light}]/80 rounded-xl p-3 sm:p-4 border border-[${color.status.warning.main}]/20`}>
                            <div className="flex items-center space-x-2">
                              <Clock className={`h-4 w-4 sm:h-5 sm:w-5 text-[${color.status.warning.main}]`} />
                              <span className={`text-[${color.status.warning.main}] font-semibold text-sm sm:text-sm`}>
                                {campaign.start_date
                                  ? `Scheduled to start on ${new Date(campaign.start_date).toLocaleDateString()}`
                                  : `Created on ${new Date(campaign.created_at).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 h-full">
          <div className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden transition-all duration-500 flex-1 shadow-xs hover:shadow-sm group flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200/50">
              <h2 className={`text-xl  font-bold ${tw.textPrimary}`}>Quick Actions</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const entityColor = color.entities[action.entity as keyof typeof color.entities];
                  return (
                    <button
                      key={action.name}
                      onClick={() => navigate(action.href)}
                      className={`group w-full flex items-center space-x-3 p-3 text-left bg-white hover:bg-gradient-to-r hover:from-[${entityColor}]/10 hover:to-[${entityColor}]/5 rounded-xl border border-gray-200/50 hover:border-[${entityColor}]/30 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md`}
                      style={{
                        animation: `fadeInUp 0.6s ease-out forwards ${(index + 7) * 0.1}s`,
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      <div
                        className="p-2 rounded-lg transition-all duration-300 shadow-sm group-hover:shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${entityColor}, ${entityColor}E6)`
                        }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className={`font-semibold text-sm sm:text-sm ${tw.textSecondary} group-hover:${tw.textPrimary}`}>{action.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden transition-all duration-500 flex-1 shadow-xs hover:shadow-sm group flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200/50">
              <h2 className={`text-xl  font-bold ${tw.textPrimary}`}>Upcoming</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div
                  className={`group flex items-start p-4 bg-gradient-to-r from-[${color.status.info.light}] to-[${color.status.info.light}]/80 rounded-xl border border-[${color.status.info.main}]/20 transition-all duration-300`}
                  style={{
                    animation: 'fadeInUp 0.6s ease-out forwards 1.1s',
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  <div className="flex-1">
                    <p className={`font-bold text-sm sm:text-sm ${tw.textPrimary} mb-1`}>Campaign Launch</p>
                    <p className={`text-sm sm:text-sm ${tw.textSecondary} mb-2`}>Churn Prevention - Q1</p>
                    <p className={`text-sm font-semibold text-[${color.status.info.main}] bg-[${color.status.info.light}] px-2 py-1 rounded-full inline-block`}>Tomorrow at 9:00 AM</p>
                  </div>
                </div>
                <div
                  className={`group flex items-start p-4 bg-gradient-to-r from-[${color.status.warning.light}] to-[${color.status.warning.light}]/80 rounded-xl border border-[${color.status.warning.main}]/20 transition-all duration-300`}
                  style={{
                    animation: 'fadeInUp 0.6s ease-out forwards 1.2s',
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  <div className="flex-1">
                    <p className={`font-bold text-sm sm:text-sm ${tw.textPrimary} mb-1`}>Review Meeting</p>
                    <p className={`text-sm sm:text-sm ${tw.textSecondary} mb-2`}>Q1 Campaign Performance</p>
                    <p className={`text-sm font-semibold text-[${color.status.warning.main}] bg-[${color.status.warning.light}] px-2 py-1 rounded-full inline-block`}>Friday at 2:00 PM</p>
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