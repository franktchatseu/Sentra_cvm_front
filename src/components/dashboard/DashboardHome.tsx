import { 
  Target, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Activity,
  Eye,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, DashboardStats } from '../../services/dashboardService';
import { useState, useEffect } from 'react';

export default function DashboardHome() {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOffers: 0,
    totalSegments: 0,
    activeCampaigns: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const stats = await dashboardService.getDashboardStats();
        console.log('Dashboard stats fetched:', stats);
        setDashboardStats(stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Keep the default values (0) if API fails
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
  
  const getFirstName = () => {
    if (user && 'email' in user && user.email && typeof user.email === 'string') {
      const emailName = user.email.split('@')[0];
      const nameWithoutNumbers = emailName.replace(/\d+/g, '');
      return nameWithoutNumbers.charAt(0).toUpperCase() + nameWithoutNumbers.slice(1).toLowerCase();
    }
    return 'user';
  };
  const stats = [
    {
      name: 'Active Campaigns',
      value: loading ? '...' : (dashboardStats?.activeCampaigns ?? 0).toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Target,
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Total Segments',
      value: loading ? '...' : (dashboardStats?.totalSegments ?? 0).toString(),
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Total Offers',
      value: loading ? '...' : (dashboardStats?.totalOffers ?? 0).toString(),
      change: '-3%',
      changeType: 'negative',
      icon: MessageSquare,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      name: 'Conversion Rate',
      value: loading ? '...' : `${dashboardStats?.conversionRate ?? 0}%`,
      change: '+5.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const recentCampaigns = [
    {
      id: 1,
      name: 'Summer Data Bundle Promotion',
      status: 'active',
      segment: 'High Value Users',
      performance: { sent: 15420, delivered: 14892, converted: 2847 },
      startDate: '2025-01-15'
    },
    {
      id: 2,
      name: 'Churn Prevention - Q1',
      status: 'scheduled',
      segment: 'At Risk Customers',
      performance: { sent: 0, delivered: 0, converted: 0 },
      startDate: '2025-01-22'
    },
    {
      id: 3,
      name: 'New Customer Welcome Series',
      status: 'active',
      segment: 'New Subscribers',
      performance: { sent: 3245, delivered: 3198, converted: 894 },
      startDate: '2025-01-10'
    }
  ];

  const quickActions = [
    { name: 'Create Campaign', href: '/dashboard/campaigns/new', icon: Target },
    { name: 'New Offer', href: '/dashboard/offers/new', icon: MessageSquare },
    { name: 'Build Segment', href: '/dashboard/segments/new', icon: Users },
    { name: 'View Analytics', href: '/dashboard/analytics', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-left">
          <h1 className="lg:text-3xl text-2xl lg:mt-2 font-bold bg-gradient-to-r from-slate-800 via-green-800 to-green-900 bg-clip-text text-transparent mb-3">
          Welcome back, {getFirstName()} 👋
        </h1>
        <p className="text-slate-600 lg:text-base text-sm font-medium max-w-2xl">
          Here's what's happening with your campaigns today. Your performance is looking great!
        </p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="group cursor-pointer relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-4 md:p-6 hover:bg-white/95 hover:z-20 hover:scale-105 hover:-translate-y-2"
              style={{
                animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                opacity: 0,
                transition: 'all 0.5s ease-out'
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-700 ease-out`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-all duration-500 ease-out transform-gpu`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:rotate-12 transition-transform duration-500 ease-out" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold group-hover:scale-105 transition-all duration-500 ease-out transform-gpu ${
                    stat.changeType === 'positive' 
                      ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200' 
                      : 'bg-rose-100 text-rose-700 group-hover:bg-rose-200'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-500 ease-out">{stat.name}</p>
                  <p className="text-xl md:text-3xl font-bold text-slate-900 group-hover:text-slate-800 group-hover:scale-105 transition-all duration-500 ease-out transform-gpu">{stat.value}</p>
                </div>
                
                <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-500 ease-out">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1 group-hover:scale-110 group-hover:text-emerald-600 transition-all duration-500 ease-out transform-gpu" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-rose-500 mr-1 group-hover:scale-110 group-hover:text-rose-600 transition-all duration-500 ease-out transform-gpu" />
                  )}
                  <span className="group-hover:font-medium transition-all duration-500 ease-out">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden transition-all duration-500">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-pink-500/15 border-b border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Recent Campaigns</h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">Monitor your active and scheduled campaigns</p>
                </div>
                <button className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                  View All
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                {recentCampaigns.map((campaign, index) => (
                  <div 
                    key={campaign.id} 
                    className="group relative bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 hover:border-indigo-200 hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.6s ease-out forwards ${(index + 4) * 0.1}s`,
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg transition-all duration-300 flex-shrink-0">
                                <Target className="h-4 w-4 text-white" />
                              </div>
                              <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-slate-800 transition-colors duration-300 break-words">{campaign.name}</h3>
                            </div>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 w-fit flex-shrink-0 ${
                              campaign.status === 'active' 
                                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 group-hover:from-emerald-200 group-hover:to-green-200'
                                : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200 group-hover:from-amber-200 group-hover:to-orange-200'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mb-4 font-medium flex items-center">
                            <Users className="h-4 w-4 mr-2 text-slate-500" />
                            {campaign.segment}
                          </p>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-3 sm:space-x-0 sm:space-y-3">
                          <span className="text-xs sm:text-sm text-slate-500 font-semibold bg-slate-100 px-2 sm:px-3 py-1 rounded-full">{campaign.startDate}</span>
                          <button className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 rounded-lg transition-all duration-300 group-hover:scale-110">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {campaign.status === 'active' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 text-center border border-blue-200 transition-all duration-300">
                            <div className="text-xl sm:text-2xl font-bold text-blue-700 mb-1">{campaign.performance.sent.toLocaleString()}</div>
                            <div className="text-blue-600 text-xs sm:text-sm font-semibold">Sent</div>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 sm:p-4 text-center border border-emerald-200 transition-all duration-300">
                            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mb-1">{campaign.performance.delivered.toLocaleString()}</div>
                            <div className="text-emerald-600 text-xs sm:text-sm font-semibold">Delivered</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 text-center border border-purple-200 transition-all duration-300">
                            <div className="text-xl sm:text-2xl font-bold text-purple-700 mb-1">{campaign.performance.converted.toLocaleString()}</div>
                            <div className="text-purple-600 text-xs sm:text-sm font-semibold">Converted</div>
                          </div>
                        </div>
                      )}
                      
                      {campaign.status === 'scheduled' && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-amber-200">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                            <span className="text-amber-700 font-semibold text-xs sm:text-sm">Scheduled to start on {campaign.startDate}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row xl:flex-col space-y-6 md:space-y-0 md:space-x-6 xl:space-x-0 xl:space-y-6 h-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden transition-all duration-500 flex-1">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-pink-500/15 border-b border-white/30">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Quick Actions</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.name}
                      className="group w-full flex items-center space-x-4 p-4 text-left bg-white/50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl border border-white/30 hover:border-indigo-200 transition-all duration-300 hover:scale-105"
                      style={{
                        animation: `fadeInUp 0.6s ease-out forwards ${(index + 7) * 0.1}s`,
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-indigo-100 group-hover:to-purple-100 rounded-lg transition-all duration-300">
                        <Icon className="h-4 w-4 text-slate-600 group-hover:text-indigo-600" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm text-slate-700 group-hover:text-slate-900">{action.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden transition-all duration-500 flex-1">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border-b border-white/30">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Upcoming</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div 
                  className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 transition-all duration-300"
                  style={{
                    animation: 'fadeInUp 0.6s ease-out forwards 1.1s',
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 mb-1">Campaign Launch</p>
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">Churn Prevention - Q1</p>
                    <p className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">Tomorrow at 9:00 AM</p>
                  </div>
                </div>
                <div 
                  className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 transition-all duration-300"
                  style={{
                    animation: 'fadeInUp 0.6s ease-out forwards 1.2s',
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 mb-1">Review Meeting</p>
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">Q1 Campaign Performance</p>
                    <p className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block">Friday at 2:00 PM</p>
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