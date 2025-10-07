import { Users, Settings, Trash2, TrendingUp } from 'lucide-react';
import { CampaignSegment } from '../../types/campaign';

interface ABTestDisplayProps {
  variantA: CampaignSegment | null;
  variantB: CampaignSegment | null;
  onAddVariant: (variant: 'A' | 'B') => void;
  onRemoveSegment: (segmentId: string) => void;
  onConfigureControlGroup: (segmentId: string) => void;
}

export default function ABTestDisplay({
  variantA,
  variantB,
  onAddVariant,
  onRemoveSegment,
  onConfigureControlGroup
}: ABTestDisplayProps) {
  
  const totalAudience = (variantA?.customer_count || 0) + (variantB?.customer_count || 0);
  const splitPercentage = variantA && variantB 
    ? ((variantA.customer_count / totalAudience) * 100).toFixed(1)
    : '50.0';

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {totalAudience > 0 && (
        <div className="bg-gradient-to-r from-[#DAD7CD] to-[#A3B18A]/20 rounded-xl p-6 border border-[#A3B18A]">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-[#588157]">
                {totalAudience.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Test Audience</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#344E41]">
                {variantA && variantB ? '2' : variantA || variantB ? '1' : '0'}/2
              </div>
              <div className="text-sm text-gray-600">Variants Configured</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {splitPercentage}% / {(100 - parseFloat(splitPercentage)).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">A/B Split Ratio</div>
            </div>
          </div>
        </div>
      )}

      {/* A/B Test Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variant A */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#588157] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Variant A</h3>
            </div>
            {!variantA && (
              <button
                onClick={() => onAddVariant('A')}
                className="inline-flex items-center px-3 py-1.5 bg-[#588157] hover:bg-[#3A5A40] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Add Variant A
              </button>
            )}
          </div>

          {variantA ? (
            <div className="bg-gradient-to-br from-[#588157]/5 to-[#588157]/10 border-2 border-[#588157] rounded-xl p-6 min-h-[240px]">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#588157] rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-gray-900">{variantA.name}</h4>
                        <span className="px-2.5 py-1 bg-[#588157] text-white text-xs font-bold rounded-full shadow-sm">
                          VARIANT A
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{variantA.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onConfigureControlGroup(variantA.id)}
                      className="p-2 text-[#588157] hover:text-[#3A5A40] hover:bg-[#588157]/10 rounded-lg transition-colors"
                      title="Configure Control Group"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveSegment(variantA.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1"></div>

                <div className="space-y-2 pt-4 border-t border-[#588157]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#588157]" />
                      <span className="text-sm font-semibold text-gray-900">
                        {variantA.customer_count.toLocaleString()} customers
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#588157]">
                      {totalAudience > 0 ? ((variantA.customer_count / totalAudience) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  {variantA.control_group_config && variantA.control_group_config.type !== 'none' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#588157] rounded-full"></div>
                      <span className="text-xs text-[#588157] font-medium">Control Group Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 min-h-[240px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#588157]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#588157] font-bold text-2xl">A</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Variant A Not Set</h4>
                <p className="text-sm text-gray-600 mb-4 max-w-xs">
                  Add your first test variant to start your A/B test campaign.
                </p>
                <button
                  onClick={() => onAddVariant('A')}
                  className="inline-flex items-center px-4 py-2 bg-[#588157] hover:bg-[#3A5A40] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Add Variant A
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Variant B */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Variant B</h3>
            </div>
            {!variantB && variantA && (
              <button
                onClick={() => onAddVariant('B')}
                className="inline-flex items-center px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Add Variant B
              </button>
            )}
          </div>

          {variantB ? (
            <div className="bg-gradient-to-br from-[#F97316]/5 to-[#F97316]/10 border-2 border-[#F97316] rounded-xl p-6 min-h-[240px]">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#F97316] rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-gray-900">{variantB.name}</h4>
                        <span className="px-2.5 py-1 bg-[#F97316] text-white text-xs font-bold rounded-full shadow-sm">
                          VARIANT B
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{variantB.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onConfigureControlGroup(variantB.id)}
                      className="p-2 text-[#F97316] hover:text-[#EA580C] hover:bg-[#F97316]/10 rounded-lg transition-colors"
                      title="Configure Control Group"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveSegment(variantB.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1"></div>

                <div className="space-y-2 pt-4 border-t border-[#F97316]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#F97316]" />
                      <span className="text-sm font-semibold text-gray-900">
                        {variantB.customer_count.toLocaleString()} customers
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#F97316]">
                      {totalAudience > 0 ? ((variantB.customer_count / totalAudience) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  {variantB.control_group_config && variantB.control_group_config.type !== 'none' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#F97316] rounded-full"></div>
                      <span className="text-xs text-[#F97316] font-medium">Control Group Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 min-h-[240px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#F97316]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#F97316] font-bold text-2xl">B</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Variant B Not Set</h4>
                <p className="text-sm text-gray-600 mb-4 max-w-xs">
                  {variantA 
                    ? 'Add the second variant to complete your A/B test setup.'
                    : 'Add Variant A first before adding Variant B.'}
                </p>
                {variantA && (
                  <button
                    onClick={() => onAddVariant('B')}
                    className="inline-flex items-center px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    Add Variant B
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Comparison Indicator */}
      {variantA && variantB && (
        <div className="bg-gradient-to-r from-[#DAD7CD] via-gray-50 to-[#F97316]/10 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#588157] mb-1">
                {((variantA.customer_count / totalAudience) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Variant A</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#588157] to-[#F97316] rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">VS</div>
                <div className="text-sm font-medium text-gray-900">A/B Comparison</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#F97316] mb-1">
                {((variantB.customer_count / totalAudience) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Variant B</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
