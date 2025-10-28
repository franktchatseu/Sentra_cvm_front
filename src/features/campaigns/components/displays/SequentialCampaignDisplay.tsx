import { Target, Users, Settings, Trash2, RotateCw, Layers } from 'lucide-react';
import { CampaignSegment } from '../../types/campaign';
import { color } from '../../../../shared/utils/utils';

interface SequentialCampaignDisplayProps {
  campaignType: 'round_robin' | 'multiple_level';
  segment: CampaignSegment | null;
  onAddSegment: () => void;
  onRemoveSegment: (segmentId: string) => void;
  onConfigureControlGroup: (segmentId: string) => void;
}

export default function SequentialCampaignDisplay({
  campaignType,
  segment,
  onAddSegment,
  onRemoveSegment,
  onConfigureControlGroup
}: SequentialCampaignDisplayProps) {

  const Icon = campaignType === 'round_robin' ? RotateCw : Layers;
  const title = campaignType === 'round_robin' ? 'Round Robin' : 'Multiple Level';
  const description = campaignType === 'round_robin'
    ? 'Sequential offers delivered at timed intervals'
    : 'Sequential offers delivered based on conditions';

  return (
    <div className="space-y-6">
      {/* Campaign Type Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12  rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: color.primary.action }}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{title} Campaign</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          {segment && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-600">
                {segment.customer_count.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Audience</div>
            </div>
          )}
        </div>
      </div>

      {/* Segment Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#588157]" />
            <h3 className="text-lg font-semibold text-gray-900">Target Segment</h3>
          </div>
          {!segment && (
            <button
              onClick={onAddSegment}
              className="inline-flex items-center px-4 py-2  text-white rounded-lg text-sm font-medium transition-colors " style={{ backgroundColor: color.primary.action }}
            >
              <Target className="w-4 h-4 mr-2" />
              Add Segment
            </button>
          )}
        </div>

        {segment ? (
          <div className="bg-white border border-[#588157] rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#588157] to-[#3A5A40] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{segment.name}</h4>
                    <span className="px-3 py-1  text-white text-xs font-bold rounded-full shadow-sm">
                      TARGET
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#588157]" />
                      <span className="text-sm font-semibold text-gray-900">
                        {segment.customer_count.toLocaleString()} customers
                      </span>
                    </div>
                    {segment.control_group_config && segment.control_group_config.type !== 'none' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-blue-700 font-medium">Control Group Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onConfigureControlGroup(segment.id)}
                  className="p-2 text-gray-400 hover:text-[#588157] hover:/10 rounded-lg transition-colors"
                  title="Configure Control Group"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveSegment(segment.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Segment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No Segment Defined</h3>
                <p className="text-xs text-gray-600">
                  Add a target segment for {campaignType === 'round_robin' ? 'timed intervals' : 'conditional offers'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Step Info */}
      {segment && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold  text-amber-900 mb-1">Next: Configure Offer Sequence</h4>
              <p className="text-sm  text-amber-700">
                In the next step, you'll configure the sequence of offers with
                {campaignType === 'round_robin' ? ' time intervals between each delivery' : ' conditional logic for each offer'}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
