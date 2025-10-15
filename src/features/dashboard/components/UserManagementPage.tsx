import { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Edit,
  Trash2,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  UserX
} from 'lucide-react';
import { authService } from '../../auth/services/authService';
import { User } from '../../../shared/types/auth';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import UserModal from './UserModal';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { color, tw } from '../../../shared/utils/utils';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accountRequests, setAccountRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorState('');

      const [usersData, requestsData] = await Promise.all([
        authService.getUsers(),
        authService.getAccountRequests()
      ]);

      setUsers(usersData);
      setAccountRequests(requestsData);
    } catch (err) {
      setErrorState(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (request: User) => {
    const confirmed = await confirm({
      title: 'Approve Request',
      message: `Are you sure you want to approve the account request for ${request.first_name} ${request.last_name}?`,
      type: 'success',
      confirmText: 'Approve',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await authService.toggleUserStatus(request.user_id, true);
      await loadData();
      success('Request approved', `Account approved for ${request.first_name} ${request.last_name}`);
    } catch (err) {
      showError('Error approving request', err instanceof Error ? err.message : 'Error approving request');
    }
  };

  const handleRejectRequest = async (request: User) => {
    const confirmed = await confirm({
      title: 'Reject Request',
      message: `Are you sure you want to reject ${request.first_name} ${request.last_name}'s request?`,
      type: 'danger',
      confirmText: 'Reject',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await authService.deleteUser(request.user_id);
      await loadData();
      success('Request rejected', `Request from ${request.first_name} ${request.last_name} rejected`);
    } catch (err) {
      showError('Error rejecting request', err instanceof Error ? err.message : 'Error rejecting request');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await authService.toggleUserStatus(user.user_id, !user.is_activated);
      await loadData();
      success('User status updated', `User ${user.is_activated ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      showError('Error updating status', err instanceof Error ? err.message : 'Error toggling user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await authService.deleteUser(user.user_id);
      await loadData();
      success('User deleted', `${user.first_name} ${user.last_name} deleted successfully`);
    } catch (err) {
      showError('Error deleting user', err instanceof Error ? err.message : 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.private_email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_activated) ||
      (filterStatus === 'inactive' && !user.is_activated);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredRequests = accountRequests.filter(request => {
    const matchesSearch = request.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.private_email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || request.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>User Management</h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>Manage users and account requests</p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
          style={{ backgroundColor: color.sentra.main }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
          }}
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-base font-medium border-b-2 transition-colors ${activeTab === 'users'
            ? 'border-[#588157] text-[#588157]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'users'
              ? 'bg-[#588157]/10 text-[#588157]'
              : 'bg-gray-100 text-gray-600'
              }`}>
              {users.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'requests'
            ? 'border-[#588157] text-[#588157]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Pending Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'requests'
              ? 'bg-[#588157]/10 text-[#588157]'
              : 'bg-gray-100 text-gray-600'
              }`}>
              {accountRequests.filter(r => r.force_password_reset).length}
            </span>
          </div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.ui.text.muted}]`} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none`}
          />
        </div>

        {activeTab === 'users' && (
          <div className="flex gap-3">
            <HeadlessSelect
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' }
              ]}
              value={filterRole}
              onChange={(value) => setFilterRole(value as 'all' | 'admin' | 'user')}
              placeholder="Select role"
              className="min-w-[140px]"
            />

            <HeadlessSelect
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}
              placeholder="Select status"
              className="min-w-[140px]"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`bg-white rounded-xl border border-[${color.ui.border}] overflow-hidden`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner variant="modern" size="lg" color="primary" className="mr-3" />
            <span className={`${tw.textSecondary}`}>Loading {activeTab}...</span>
          </div>
        ) : errorState ? (
          <div className="p-8 text-center">
            <div className={`bg-[${color.status.error.light}] border border-[${color.status.error.main}]/20 text-[${color.status.error.main}] rounded-xl p-6`}>
              <p className="font-medium mb-3">{errorState}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{ backgroundColor: color.status.error.main }}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className={`w-16 h-16 text-[${color.entities.users}] mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
                {searchTerm ? 'No Users Found' : 'No Users'}
              </h3>
              <p className={`${tw.textMuted} mb-6`}>
                {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first user to get started.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                  style={{ backgroundColor: color.sentra.main }}
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-[${color.ui.border}]`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        User
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Role
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Created
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: color.entities.users }}
                            >
                              <span className="text-white font-semibold text-sm">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className={`text-base font-semibold ${tw.textPrimary}`}>
                                {user.first_name} {user.last_name}
                              </div>
                              <div className={`text-sm ${tw.textMuted}`}>{user.private_email_address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                            ? `bg-[${color.entities.configuration}]/10 text-[${color.entities.configuration}]`
                            : `bg-[${color.entities.users}]/10 text-[${color.entities.users}]`
                            }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${user.is_activated
                            ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]`
                            : `bg-[${color.status.error.light}] text-[${color.status.error.main}]`
                            }`}>
                            {user.is_activated ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${tw.textSecondary}`}>
                            {new Date(user.created_on).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                color: user.is_activated ? color.status.error.main : color.status.success.main,
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                const bgColor = user.is_activated ? color.status.error.main : color.status.success.main;
                                (e.target as HTMLButtonElement).style.backgroundColor = `${bgColor}10`;
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                              }}
                              title={user.is_activated ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.is_activated ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                              }}
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                color: color.sentra.main,
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}10`;
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {filteredUsers.map((user) => (
                  <div key={user.user_id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color.entities.users }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div className={`text-sm ${tw.textSecondary} mb-2`}>
                          {user.private_email_address}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                            ? `bg-[${color.entities.configuration}]/10 text-[${color.entities.configuration}]`
                            : `bg-[${color.entities.users}]/10 text-[${color.entities.users}]`
                            }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${user.is_activated
                            ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]`
                            : `bg-[${color.status.error.light}] text-[${color.status.error.main}]`
                            }`}>
                            {user.is_activated ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: user.is_activated ? color.status.error.main : color.status.success.main,
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              const bgColor = user.is_activated ? color.status.error.main : color.status.success.main;
                              (e.target as HTMLButtonElement).style.backgroundColor = `${bgColor}10`;
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            {user.is_activated ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.sentra.main,
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}10`;
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          // Account Requests Tab
          filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className={`w-16 h-16 text-[${color.entities.users}] mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>No Pending Requests</h3>
              <p className={`${tw.textMuted}`}>
                All account requests have been processed.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-[${color.ui.border}]`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Applicant
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Requested Role
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Requested
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.user_id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: color.entities.users }}
                            >
                              <span className="text-white font-semibold text-sm">
                                {request.first_name.charAt(0)}{request.last_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className={`text-base font-semibold ${tw.textPrimary}`}>
                                {request.first_name} {request.last_name}
                              </div>
                              <div className={`text-sm ${tw.textMuted}`}>{request.private_email_address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${request.role === 'admin'
                            ? `bg-[${color.entities.configuration}]/10 text-[${color.entities.configuration}]`
                            : `bg-[${color.entities.users}]/10 text-[${color.entities.users}]`
                            }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {request.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${tw.textSecondary}`}>
                            {request.created_on ? new Date(request.created_on).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve request"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject request"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {filteredRequests.map((request) => (
                  <div key={request.user_id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color.entities.users }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {request.first_name.charAt(0)}{request.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                          {request.first_name} {request.last_name}
                        </div>
                        <div className={`text-sm ${tw.textSecondary} mb-2`}>
                          {request.private_email_address}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${request.role === 'admin'
                            ? `bg-[${color.entities.configuration}]/10 text-[${color.entities.configuration}]`
                            : `bg-[${color.entities.users}]/10 text-[${color.entities.users}]`
                            }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {request.role}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <UserX className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUserSaved={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          loadData();
        }}
      />
    </div>
  );
}
