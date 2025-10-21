import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User as UserIcon, Mail, Shield, Save } from 'lucide-react';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { authService } from '../../auth/services/authService';
import { useToast } from '../../../contexts/ToastContext';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';
import { color, tw } from '../../../shared/utils/utils';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  private_email_address: string;
  role: 'admin' | 'user';
  is_activated: boolean;
  created_on: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onUserSaved: () => void;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  private_email_address: string;
  role: 'admin' | 'user';
  is_activated: boolean;
}

export default function UserModal({ isOpen, onClose, user, onUserSaved }: UserModalProps) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    private_email_address: '',
    role: 'user',
    is_activated: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        private_email_address: user.private_email_address,
        role: user.role,
        is_activated: user.is_activated
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        private_email_address: '',
        role: 'user',
        is_activated: true
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user) {
        // Update existing user
        await authService.updateUser(user.user_id, formData);
        success('User Updated', `${formData.first_name} ${formData.last_name} has been updated successfully`);
      } else {
        // Create new user
        await authService.createUser({
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.private_email_address,
          role: formData.role
        });
        success('User Created', `${formData.first_name} ${formData.last_name} has been created successfully`);
      }

      onUserSaved();
      onClose();
    } catch (err) {
      error(
        user ? 'Update Error' : 'Creation Error',
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${tw.borderDefault}`}>
          <div className="flex items-center">

            <h2 className={`text-xl font-bold ${tw.textPrimary}`}>
              {user ? 'Edit User' : 'Add User'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gray-50 rounded-lg transition-colors`}
          >
            <X className={`w-5 h-5 ${tw.textMuted}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold ${tw.textPrimary} mb-2`}>
                First Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`w-5 h-5 ${tw.textMuted}`} />
                </div>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-3 py-3 border ${tw.borderDefault} rounded-lg focus:outline-none transition-all duration-200 text-sm`}
                  placeholder="First Name"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-semibold ${tw.textPrimary} mb-2`}>
                Last Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`w-5 h-5 ${tw.textMuted}`} />
                </div>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-3 py-3 border ${tw.borderDefault} rounded-lg focus:outline-none transition-all duration-200 text-sm`}
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold ${tw.textPrimary} mb-2`}>
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`w-5 h-5 ${tw.textMuted}`} />
              </div>
              <input
                name="private_email_address"
                type="email"
                value={formData.private_email_address}
                onChange={handleChange}
                required
                className={`block w-full pl-10 pr-3 py-3 border ${tw.borderDefault} rounded-lg focus:outline-none transition-all duration-200 text-sm`}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold ${tw.textPrimary} mb-2`}>
              <Shield className={`w-4 h-4 inline mr-2 ${tw.textMuted}`} />
              Role
            </label>
            <HeadlessSelect
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Administrator' }
              ]}
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'user' })}
              placeholder="Select role"
              className="text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_activated"
              checked={formData.is_activated}
              onChange={handleChange}
              className={`w-4 h-4 text-[${color.primary.action}] border ${tw.borderDefault} rounded focus:outline-none`}
            />
            <label className={`ml-2 text-sm font-medium ${tw.textPrimary}`}>
              Account Activated
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 border ${tw.borderDefault} ${tw.textSecondary} rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-white rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
              }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner variant="modern" size="sm" color="primary" className="mr-2" />
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {user ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
