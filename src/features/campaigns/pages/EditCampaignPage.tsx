import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useToast } from '../../../contexts/ToastContext';
import LoadingSpinner from '../../../shared/componen../../../shared/components/ui/LoadingSpinner';
// import { campaignService } from '../services/campaignService';

interface CampaignFormData {
    name: string;
    description: string;
    type: string;
    category: string;
    segment: string;
    offer: string;
    startDate: string;
    endDate: string;
}

export default function EditCampaignPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<CampaignFormData>({
        name: '',
        description: '',
        type: '',
        category: '',
        segment: '',
        offer: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                setIsLoading(true);

                const campaignData = await campaignService.getCampaignById(id);
                setFormData(campaignData as unknown as CreateCampaignRequest);
            } catch (error) {
                console.error('Failed to fetch campaign data:', error);
                showToast('Failed to load campaign data', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCampaignData();
        }
    }, [id, showToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock save operation (no actual backend call)
            console.log('Saving campaign data:', formData);

            showToast('success', 'Campaign updated successfully');
            navigate(`/dashboard/campaigns/${id}`);
        } catch (error) {
            console.error('Failed to update campaign:', error);
            showToast('error', 'Failed to update campaign');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/dashboard/campaigns/${id}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner variant="modern" size="xl" color="primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/dashboard/campaigns/${id}`)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Edit Campaign</h1>
                        <p className={`${tw.textSecondary} mt-2 text-sm`}>Update campaign information and settings</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm w-fit border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: color.sentra.main }}
                        onMouseEnter={(e) => {
                            if (!isSaving) {
                                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSaving) {
                                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                            }
                        }}
                    >
                        {isSaving ? (
                            <LoadingSpinner variant="simple" size="sm" color="white" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                    Campaign Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                    placeholder="Enter campaign name"
                                />
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                    placeholder="Enter campaign description"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                        Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                    >
                                        <option value="">Select type</option>
                                        <option value="Promotional">Promotional</option>
                                        <option value="Transactional">Transactional</option>
                                        <option value="Retention">Retention</option>
                                        <option value="Acquisition">Acquisition</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                    >
                                        <option value="">Select category</option>
                                        <option value="Data Bundle">Data Bundle</option>
                                        <option value="Voice Bundle">Voice Bundle</option>
                                        <option value="SMS Bundle">SMS Bundle</option>
                                        <option value="Service">Service</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Targeting Information */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Targeting Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                    Target Segment *
                                </label>
                                <select
                                    name="segment"
                                    value={formData.segment}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                >
                                    <option value="">Select segment</option>
                                    <option value="High Value Customers">High Value Customers</option>
                                    <option value="New Customers">New Customers</option>
                                    <option value="Churned Customers">Churned Customers</option>
                                    <option value="All Customers">All Customers</option>
                                </select>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                    Offer *
                                </label>
                                <select
                                    name="offer"
                                    value={formData.offer}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                >
                                    <option value="">Select offer</option>
                                    <option value="Double Data Bundle">Double Data Bundle</option>
                                    <option value="Free SMS Bundle">Free SMS Bundle</option>
                                    <option value="Voice Minutes">Voice Minutes</option>
                                    <option value="Service Discount">Service Discount</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Information */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Schedule Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                />
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-2`}>
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:ring-2 focus:ring-[${color.sentra.main}] focus:border-transparent ${tw.textPrimary}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Campaign Status */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Campaign Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Current Status</span>
                                <span className="text-sm font-medium text-green-600">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Campaign ID</span>
                                <span className={`text-sm font-mono ${tw.textPrimary}`}>{id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Last Modified</span>
                                <span className={`text-sm ${tw.textPrimary}`}>
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Save Information */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Save Information</h3>
                        <p className={`text-sm ${tw.textMuted} mb-4`}>
                            Make sure all required fields are filled before saving. Changes will be applied immediately.
                        </p>
                        <div className="space-y-2">
                            {/* <div className="flex items-center text-sm text-green-600">
                                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                                Auto-save enabled
                            </div>
                            <div className="flex items-center text-sm text-blue-600">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                                Version history maintained
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
