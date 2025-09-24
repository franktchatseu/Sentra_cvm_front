import { useState } from 'react';
import { ArrowRight, ArrowLeft, Users, Plus, Eye, Edit, Trash2, Target, AlertCircle } from 'lucide-react';
import { CreateCampaignRequest, CampaignSegment, ControlGroup } from '../../../types/campaign';
import SegmentSelectionModal from './SegmentSelectionModal';
import SegmentModal from '../../modals/SegmentModal';

interface AudienceConfigurationStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
  selectedSegments: CampaignSegment[];
  setSelectedSegments: (segments: CampaignSegment[]) => void;
  controlGroup: ControlGroup;
  setControlGroup: (group: ControlGroup) => void;
}

export default function AudienceConfigurationStep({
  onNext,
  onPrev,
  formData,
  setFormData,
  selectedSegments,
  setSelectedSegments,
  controlGroup,
  setControlGroup
}: AudienceConfigurationStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CampaignSegment | null>(null);

  const handleNext = () => {
    if (selectedSegments.length > 0) {
      // Update formData with selected segment IDs
      setFormData({
        ...formData,
        segments: selectedSegments.map(segment => segment.id)
      });
      onNext();
    }
  };

  const handleSegmentSelect = (segments: CampaignSegment[]) => {
    setSelectedSegments(segments);
    setIsModalOpen(false);
  };

  const handleSegmentCreated = (segment: any) => {
    // Convert the created segment to CampaignSegment format
    const campaignSegment: CampaignSegment = {
      id: segment.segment_id,
      name: segment.name,
      description: segment.description,
      customer_count: segment.customer_count || 0,
      created_at: segment.created_at || new Date().toISOString(),
      criteria: segment.conditions || []
    };
    setSelectedSegments([...selectedSegments, campaignSegment]);
    setShowCreateSegmentModal(false);
  };

  const handleRemoveSegment = (segmentId: string) => {
    setSelectedSegments(selectedSegments.filter(segment => segment.id !== segmentId));
  };

  const handleEditSegment = (segment: CampaignSegment) => {
    setEditingSegment(segment);
    setIsModalOpen(true);
  };

  const totalAudienceSize = selectedSegments.reduce((total, segment) => total + segment.customer_count, 0);
  const controlGroupSize = controlGroup.enabled ? Math.round(totalAudienceSize * (controlGroup.percentage / 100)) : 0;
  const targetGroupSize = totalAudienceSize - controlGroupSize;

  const isFormValid = selectedSegments.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Audience Configuration</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select and configure your target audience segments for this campaign
        </p>
      </div>

      {/* Audience Overview */}
      {selectedSegments.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{totalAudienceSize.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Audience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#3b8169]">{targetGroupSize.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Target Group</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{controlGroupSize.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Control Group</div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Segments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Selected Segments</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-[#3b8169] text-white rounded-lg hover:bg-[#2d5f4e] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Segments
          </button>
        </div>

        {selectedSegments.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No segments selected</h3>
            <p className="text-gray-500 mb-4">Select audience segments to target with your campaign</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-[#3b8169] text-white rounded-lg hover:bg-[#2d5f4e] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Select Segments
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedSegments.map((segment) => (
              <div
                key={segment.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{segment.name}</h4>
                      <p className="text-sm text-gray-500">{segment.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {segment.customer_count.toLocaleString()} customers
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {segment.created_at}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSegment(segment)}
                      className="p-2 text-gray-400 hover:text-[#3b8169] transition-colors"
                      title="Edit segment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveSegment(segment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove segment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Control Group Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Control Group Setup</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="enableControlGroup"
              checked={controlGroup.enabled}
              onChange={(e) => setControlGroup({ ...controlGroup, enabled: e.target.checked })}
              className="mt-1 w-4 h-4 text-[#3b8169] border-gray-300 rounded focus:ring-[#3b8169]"
            />
            <div className="flex-1">
              <label htmlFor="enableControlGroup" className="font-medium text-gray-900">
                Enable Control Group
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Set aside a portion of your audience to measure campaign effectiveness
              </p>
            </div>
          </div>

          {controlGroup.enabled && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Control Group Percentage
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={controlGroup.percentage}
                      onChange={(e) => setControlGroup({ ...controlGroup, percentage: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {controlGroup.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {controlGroupSize.toLocaleString()} customers will be in the control group
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Control Group Type
                  </label>
                  <select
                    value={controlGroup.type}
                    onChange={(e) => setControlGroup({ ...controlGroup, type: e.target.value as 'standard' | 'universal' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                  >
                    <option value="standard">Standard Control Group</option>
                    <option value="universal">Universal Control Group</option>
                  </select>
                </div>
              </div>

              {controlGroup.type === 'universal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universal Control Frequency
                  </label>
                  <select
                    value={controlGroup.universal_frequency || 'monthly'}
                    onChange={(e) => setControlGroup({ 
                      ...controlGroup, 
                      universal_frequency: e.target.value as 'monthly' | 'quarterly' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    How often the universal control group is applied
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Control Group Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {controlGroup.type === 'universal' 
                        ? 'Universal control groups are applied across multiple campaigns to provide consistent measurement.'
                        : 'Standard control groups are specific to this campaign and will not receive any campaign communications.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Segment Overlap Warning */}
      {selectedSegments.length > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-900">Segment Overlap Detection</h4>
              <p className="text-sm text-amber-700 mt-1">
                Multiple segments selected. Please verify there's no significant overlap to avoid duplicate messaging.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            isFormValid
              ? 'bg-gradient-to-r from-[#3b8169] to-[#2d5f4e] text-white hover:shadow-lg hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next Step
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Segment Selection Modal */}
      {isModalOpen && (
        <SegmentSelectionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSegment(null);
          }}
          onSelect={handleSegmentSelect}
          selectedSegments={selectedSegments}
          editingSegment={editingSegment}
          onCreateNew={() => {
            setIsModalOpen(false);
            setShowCreateSegmentModal(true);
          }}
        />
      )}

      {/* Create Segment Modal */}
      {showCreateSegmentModal && (
        <SegmentModal
          isOpen={showCreateSegmentModal}
          onClose={() => setShowCreateSegmentModal(false)}
          onSave={handleSegmentCreated}
        />
      )}
    </div>
  );
}
