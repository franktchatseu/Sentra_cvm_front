import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Activity
} from 'lucide-react';
import { Segment, UpdateSegmentRequest, SegmentType, SegmentVisibility } from '../types/segment';
import { segmentService } from '../services/segmentService';
import { useToast } from '../../../contexts/ToastContext';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { color, tw } from '../../../shared/utils/utils';

// Mock data for testing
const MOCK_SEGMENT: Segment = {
    id: 1,
    segment_id: 1,
    name: 'High Value Customers',
    description: 'Customers with ARPU > $50 and active for 6+ months',
    type: 'dynamic',
    tags: ['vip', 'high-value', 'premium'],
    customer_count: 15420,
    size_estimate: 15420,
    created_at: '2025-01-15T10:30:00Z',
    created_on: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-18T14:22:00Z',
    updated_on: '2025-01-18T14:22:00Z',
    created_by: 1,
    is_active: true,
    category: 1,
    visibility: 'private',
    refresh_frequency: 'daily',
    business_purpose: 'Target high-value customers for premium offers and retention campaigns',
    criteria: {
        conditions: [
            { field: 'ARPU', operator: '>', value: 50 },
            { field: 'tenure_months', operator: '>=', value: 6 },
            { field: 'status', operator: '=', value: 'active' }
        ]
    }
};

const USE_MOCK_DATA = true; // Toggle this to switch between mock and real data

export default function EditSegmentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [segment, setSegment] = useState<Segment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<SegmentType>('dynamic');
    const [visibility, setVisibility] = useState<SegmentVisibility>('private');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [refreshFrequency, setRefreshFrequency] = useState('');
    const [businessPurpose, setBusinessPurpose] = useState('');

    const loadSegment = useCallback(async () => {
        try {
            setIsLoading(true);

            if (USE_MOCK_DATA) {
                // Use mock data for testing
                setTimeout(() => {
                    setSegment(MOCK_SEGMENT);

                    // Populate form with mock data
                    setName(MOCK_SEGMENT.name);
                    setDescription(MOCK_SEGMENT.description || '');
                    setType(MOCK_SEGMENT.type);
                    setVisibility(MOCK_SEGMENT.visibility || 'private');
                    setTags(MOCK_SEGMENT.tags || []);
                    setRefreshFrequency(MOCK_SEGMENT.refresh_frequency || '');
                    setBusinessPurpose(MOCK_SEGMENT.business_purpose || '');

                    setIsLoading(false);
                }, 500); // Simulate API delay
                return;
            }

            const data = await segmentService.getSegmentById(Number(id));
            setSegment(data);

            // Populate form
            setName(data.name);
            setDescription(data.description || '');
            setType(data.type);
            setVisibility(data.visibility || 'private');
            setTags(data.tags || []);
            setRefreshFrequency(data.refresh_frequency || '');
            setBusinessPurpose(data.business_purpose || '');
        } catch (err) {
            showError('Error loading segment', (err as Error).message || 'Failed to load segment details');
        } finally {
            setIsLoading(false);
        }
    }, [id, showError]);

    useEffect(() => {
        if (id) {
            loadSegment();
        }
    }, [id, loadSegment]);

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            showError('Validation Error', 'Segment name is required');
            return;
        }

        try {
            setIsSaving(true);

            if (USE_MOCK_DATA) {
                // Simulate save with mock data
                setTimeout(() => {
                    setIsSaving(false);
                    success('Segment updated', `Segment "${name}" has been updated successfully`);
                    navigate(`/dashboard/segments/${id}`);
                }, 1000); // Simulate API delay
                return;
            }

            const updateData: UpdateSegmentRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                visibility,
                tags: tags.length > 0 ? tags : undefined,
                refresh_frequency: refreshFrequency.trim() || undefined,
                business_purpose: businessPurpose.trim() || undefined,
            };

            await segmentService.updateSegment(Number(id), updateData);
            success('Segment updated', `Segment "${name}" has been updated successfully`);
            navigate(`/dashboard/segments/${id}`);
        } catch (err) {
            showError('Error updating segment', (err as Error).message || 'Failed to update segment');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/dashboard/segments/${id}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
                <p className={`${tw.textMuted} font-medium text-sm`}>Loading segment...</p>
            </div>
        );
    }

    if (!segment) {
        return (
            <div className="text-center py-16">
                <h2 className={`text-xl font-semibold ${tw.textPrimary} mb-2`}>Segment not found</h2>
                <p className={`${tw.textSecondary} mb-4`}>The segment you're trying to edit doesn't exist.</p>
                <button
                    onClick={() => navigate('/dashboard/segments')}
                    className="inline-flex items-center px-4 py-2 text-white rounded-lg"
                    style={{ backgroundColor: color.sentra.main }}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Segments
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleCancel}
                        className={`p-2 rounded-lg ${tw.textMuted} hover:bg-gray-100 transition-colors`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Edit Segment</h1>
                        <p className={`${tw.textSecondary} mt-1`}>Update segment information and settings</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${tw.textSecondary} hover:bg-gray-50`}
                    >
                        <X className="w-4 h-4 inline mr-2" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: color.sentra.main }}
                        onMouseEnter={(e) => { if (!isSaving) (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
                    >
                        {isSaving ? (
                            <>
                                <LoadingSpinner size="sm" className="inline mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 inline mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Basic Information</h3>
                        <div className="space-y-4">
                            {/* Segment Name */}
                            <div>
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Segment Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter segment name"
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.sentra.main}]/20`}
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter segment description"
                                    rows={3}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.sentra.main}]/20 resize-none`}
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Type (Read-only) */}
                            <div>
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Type
                                </label>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${type === 'dynamic' ? 'bg-purple-100 text-purple-700' :
                                        type === 'static' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </span>
                                    <span className={`text-sm ${tw.textMuted}`}>(Cannot be changed)</span>
                                </div>
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Visibility
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="private"
                                            checked={visibility === 'private'}
                                            onChange={(e) => setVisibility(e.target.value as SegmentVisibility)}
                                            className="mr-2"
                                            disabled={isSaving}
                                        />
                                        <span className={`text-sm ${tw.textPrimary}`}>Private</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="public"
                                            checked={visibility === 'public'}
                                            onChange={(e) => setVisibility(e.target.value as SegmentVisibility)}
                                            className="mr-2"
                                            disabled={isSaving}
                                        />
                                        <span className={`text-sm ${tw.textPrimary}`}>Public</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Additional Information Section */}
                    <div>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Additional Information</h3>
                        <div className="space-y-4">
                            {/* Tags */}
                            <div>
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Tags
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="Enter a tag and press Enter"
                                            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.sentra.main}]/20`}
                                            disabled={isSaving}
                                        />
                                        <button
                                            onClick={handleAddTag}
                                            disabled={!tagInput.trim() || isSaving}
                                            className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: color.sentra.main }}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => handleRemoveTag(tag)}
                                                        disabled={isSaving}
                                                        className="ml-2 hover:text-green-900 disabled:opacity-50"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Refresh Frequency */}
                            <div>
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Refresh Frequency
                                </label>
                                <select
                                    value={refreshFrequency}
                                    onChange={(e) => setRefreshFrequency(e.target.value)}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.sentra.main}]/20`}
                                    disabled={isSaving}
                                >
                                    <option value="">Select frequency</option>
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="manual">Manual</option>
                                </select>
                            </div>

                            {/* Business Purpose */}
                            <div>
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Business Purpose
                                </label>
                                <textarea
                                    value={businessPurpose}
                                    onChange={(e) => setBusinessPurpose(e.target.value)}
                                    placeholder="Describe the business purpose of this segment"
                                    rows={3}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.sentra.main}]/20 resize-none`}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Criteria (Read-only) */}
            {(segment.criteria || segment.definition) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4 flex items-center`}>
                        <Activity className="w-5 h-5 mr-2" style={{ color: color.entities.segments }} />
                        Current Segment Criteria
                        <span className={`ml-2 text-sm font-normal ${tw.textMuted}`}>(Read-only)</span>
                    </h3>

                    {/* Display criteria conditions in a user-friendly way */}
                    {segment.criteria && 'conditions' in segment.criteria && Array.isArray((segment.criteria as Record<string, unknown>).conditions) ? (
                        <div className="space-y-2">
                            {((segment.criteria as Record<string, unknown>).conditions as Array<Record<string, unknown>>).map((condition: Record<string, unknown>, index: number) => {
                                const operatorMap: Record<string, string> = {
                                    '>': 'is greater than',
                                    '>=': 'is greater than or equal to',
                                    '<': 'is less than',
                                    '<=': 'is less than or equal to',
                                    '=': 'equals',
                                    '!=': 'does not equal',
                                    'contains': 'contains',
                                    'in': 'is in'
                                };

                                const fieldName = (condition.field as string) || 'Field';
                                const operator = operatorMap[(condition.operator as string)] || (condition.operator as string);
                                const value = typeof condition.value === 'string' ? `"${condition.value}"` : String(condition.value);

                                return (
                                    <div key={index} className="relative">
                                        <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                                            <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0`}
                                                style={{ backgroundColor: `${color.entities.segments}20` }}>
                                                <span className="text-xs font-bold" style={{ color: color.entities.segments }}>
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${tw.textPrimary}`}>
                                                    <span className="font-semibold">{fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                    {' '}
                                                    <span className={`${tw.textMuted}`}>{operator}</span>
                                                    {' '}
                                                    <span className="font-semibold" style={{ color: color.sentra.main }}>{value}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {index < ((segment.criteria as Record<string, unknown>).conditions as Array<Record<string, unknown>>).length - 1 && (
                                            <div className="flex items-center justify-center py-1">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full`}
                                                    style={{ backgroundColor: `${color.entities.segments}15`, color: color.entities.segments }}>
                                                    AND
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className={`text-sm ${tw.textMuted}`}>
                                No conditions defined or criteria format not supported for display
                            </p>
                        </div>
                    )}

                    <p className={`mt-4 text-sm ${tw.textMuted}`}>
                        Note: To modify segment criteria, please use the segment builder or contact support.
                    </p>
                </div>
            )}

            {/* Action Buttons (Mobile) */}
            <div className="lg:hidden flex items-center space-x-3">
                <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${tw.textSecondary} hover:bg-gray-50`}
                >
                    <X className="w-4 h-4 inline mr-2" />
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: color.sentra.main }}
                >
                    {isSaving ? (
                        <>
                            <LoadingSpinner size="sm" className="inline mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 inline mr-2" />
                            Save
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

