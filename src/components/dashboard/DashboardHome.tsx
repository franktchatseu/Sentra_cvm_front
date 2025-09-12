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

export default function DashboardHome() {
  const stats = [
    {
      name: 'Active Campaigns',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: Target,
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Total Segments',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Active Offers',
      value: '89',
      change: '-3%',
      changeType: 'negative',
      icon: MessageSquare,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      name: 'Conversion Rate',
      value: '18.4%',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
          Welcome back, John! 👋
        </h1>
        <p className="text-slate-600 text-lg font-medium max-w-2xl">
          Here's what's happening with your campaigns today. Your performance is looking great!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{
                animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                opacity: 0,
                transform: 'translateY(20px)'
              }}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    stat.changeType === 'positive' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                
                <div className="mt-3 flex items-center text-xs text-slate-500">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-rose-500 mr-1" />
                  )}
                  <span>vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-white/20">
              <h2 className="text-2xl font-bold text-slate-800">Recent Campaigns</h2>
              <p className="text-slate-600 text-sm mt-1">Monitor your active and scheduled campaigns</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentCampaigns.map((campaign, index) => (
                  <div 
                    key={campaign.id} 
                    className="group relative bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    style={{
                      animation: `fadeInUp 0.6s ease-out forwards ${(index + 4) * 0.1}s`,
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">{campaign.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                              : 'bg-amber-100 text-amber-700 shadow-sm'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 font-medium">{campaign.segment}</p>
                        {campaign.status === 'active' && (
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <div className="font-bold text-blue-700">{campaign.performance.sent.toLocaleString()}</div>
                              <div className="text-blue-600">Sent</div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-2 text-center">
                              <div className="font-bold text-emerald-700">{campaign.performance.delivered.toLocaleString()}</div>
                              <div className="text-emerald-600">Delivered</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2 text-center">
                              <div className="font-bold text-purple-700">{campaign.performance.converted.toLocaleString()}</div>
                              <div className="text-purple-600">Converted</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <span className="text-sm text-slate-500 font-medium">{campaign.startDate}</span>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 group-hover:scale-110">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Schedule */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    className="group w-full flex items-center space-x-4 p-4 text-left bg-white/50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl border border-white/30 hover:border-indigo-200 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    style={{
                      animation: `fadeInUp 0.6s ease-out forwards ${(index + 7) * 0.1}s`,
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-indigo-100 group-hover:to-purple-100 rounded-lg transition-all duration-300">
                      <Icon className="h-4 w-4 text-slate-600 group-hover:text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-slate-900">{action.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Upcoming</h2>
            </div>
            <div className="space-y-4">
              <div 
                className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                style={{
                  animation: 'fadeInUp 0.6s ease-out forwards 1.1s',
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 mb-1">Campaign Launch</p>
                  <p className="text-sm text-slate-600 mb-2">Churn Prevention - Q1</p>
                  <p className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">Tomorrow at 9:00 AM</p>
                </div>
              </div>
              <div 
                className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all duration-300"
                style={{
                  animation: 'fadeInUp 0.6s ease-out forwards 1.2s',
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 mb-1">Review Meeting</p>
                  <p className="text-sm text-slate-600 mb-2">Q1 Campaign Performance</p>
                  <p className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block">Friday at 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}