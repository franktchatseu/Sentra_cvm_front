import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Edit, 
  Trash2, 
  Search, 
  Plus, 
  Clock, 
  Mail,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { authService } from '../../services/authService';
import { User } from '../../types/auth';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import UserModal from '../modals/UserModal';
import HeadlessSelect from '../ui/HeadlessSelect';

interface UserActionsDropdownProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onResetPassword: (user: User) => void;
}

function UserActionsDropdown({ user, onEdit, onDelete, onToggleStatus, onResetPassword }: UserActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <button
                onClick={() => { onEdit(user); setIsOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit User
              </button>
              <button
                onClick={() => { onToggleStatus(user); setIsOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {user.is_activated ? (
                  <>
                    <Shield className="w-4 h-4 mr-3" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-3" />
                    Activate
                  </>
                )}
              </button>
              <button
                onClick={() => { onResetPassword(user); setIsOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Mail className="w-4 h-4 mr-3" />
                Reset Password
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { onDelete(user); setIsOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
      message: `Are you sure you want to approve the account request for ${request.first_name} ${request.last_name} (${request.private_email_address})?`,
      type: 'success',
      confirmText: 'Approve',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      // For users with force_password_reset, we activate them by setting force_password_reset to false
      await authService.toggleUserStatus(request.user_id, true);
      await loadData(); // Reload data
      success('Request approved', `Account request for ${request.first_name} ${request.last_name} approved successfully`);
    } catch (err) {
      showError('Error approving request', err instanceof Error ? err.message : 'Error approving request');
    }
  };

  const handleRejectRequest = async (request: User) => {
    const confirmed = await confirm({
      title: 'Reject Request',
      message: `Are you sure you want to reject the account request for ${request.private_email_address}?`,
      type: 'danger',
      confirmText: 'Reject',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await authService.deleteUser(request.user_id);
      await loadData();
      success('Request rejected', `Account request for ${request.first_name} ${request.last_name} rejected`);
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

  const handleResetPassword = async (user: User) => {
    try {
      await authService.requestPasswordReset({ email: user.private_email_address });
      success('Password reset sent', `Password reset email sent to ${user.private_email_address}`);
    } catch (err) {
      showError('Error sending reset', err instanceof Error ? err.message : 'Error sending password reset');
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action is irreversible.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await authService.deleteUser(user.user_id);
      await loadData();
      success('User deleted', `User ${user.first_name} ${user.last_name} deleted successfully`);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600 text-base">Manage users and account requests</p>
          </div>
          <button 
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="group flex items-center justify-center space-x-3 bg-[#3b8169] hover:bg-[#2d5f4e] text-white px-4 md:px-6 py-3 rounded-xl  transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto text-base whitespace-nowrap"
          >
            <Plus className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Add User</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-3 md:px-6 py-4 text-xs md:text-sm font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users ({users.length})</span>
              <span className="sm:hidden">Users</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-3 md:px-6 py-4 text-xs md:text-sm font-semibold transition-colors ${
              activeTab === 'requests'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Pending Requests ({accountRequests.filter(r => r.force_password_reset).length})</span>
              <span className="sm:hidden">Requests</span>
            </div>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            
            {activeTab === 'users' && (
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
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
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading {activeTab}...</p>
          </div>
        ) : errorState ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-700 font-medium mb-3">{errorState}</p>
              <button
                onClick={loadData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          filteredUsers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No users found</h3>
                <p className="text-gray-600 mb-8 text-sm max-w-md mx-auto">
                  {searchTerm ? 'No users match your search criteria.' : 'No users have been created yet.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">User</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Role</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Created</th>
                      <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                                <span className="text-white font-semibold text-base">
                                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-5">
                              <div className="text-base font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{user.private_email_address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_activated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_activated ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm text-gray-900 font-medium">
                            {new Date(user.created_on).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <UserActionsDropdown
                            user={user}
                            onEdit={(user) => {
                              setSelectedUser(user);
                              setIsModalOpen(true);
                            }}
                            onDelete={handleDeleteUser}
                            onToggleStatus={handleToggleStatus}
                            onResetPassword={handleResetPassword}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredUsers.map((user) => (
                  <div key={user.user_id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-sm">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-semibold text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.private_email_address}</div>
                        </div>
                      </div>
                      <UserActionsDropdown
                        user={user}
                        onEdit={(user) => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        onDelete={handleDeleteUser}
                        onToggleStatus={handleToggleStatus}
                        onResetPassword={handleResetPassword}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_activated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_activated ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Created: {new Date(user.created_on).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          // Account Requests Tab
          filteredRequests.length === 0 ? (
            <div className="p-8 md:p-16 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-12">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No pending requests</h3>
                <p className="text-gray-600 mb-8 text-sm max-w-md mx-auto">
                  All account requests have been processed.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Applicant</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Requested Role</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Requested</th>
                      <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                <tbody className="bg-white">
                  {filteredRequests.map((request) => (
                    <tr key={request.user_id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                              <span className="text-white font-semibold text-base">
                                {request.first_name.charAt(0)}{request.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-5">
                            <div className="text-base font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                              {request.first_name} {request.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{request.private_email_address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          request.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {request.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-700">
                          {request.created_on ? new Date(request.created_on).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleApproveRequest(request)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200 group/btn"
                            title="Approve Request"
                          >
                            <CheckCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 group/btn"
                            title="Reject Request"
                          >
                            <XCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredRequests.map((request) => (
                  <div key={request.user_id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-sm">
                            {request.first_name.charAt(0)}{request.last_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-semibold text-gray-900">
                            {request.first_name} {request.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{request.private_email_address}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        request.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {request.role}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Requested: {new Date(request.created_on).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request)}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request)}
                          className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </button>
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
