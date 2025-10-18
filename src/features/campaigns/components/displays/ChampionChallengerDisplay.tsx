import { Award, Target, Users, Settings, Trash2 } from 'lucide-react';
import { CampaignSegment } from '../../types/campaign';
import { color } from '../../../../shared/utils/utils';

interface ChampionChallengerDisplayProps {
  champion: CampaignSegment | null;
  challengers: CampaignSegment[];
  onAddChampion: () => void;
  onAddChallenger: () => void;
  onRemoveSegment: (segmentId: string) => void;
  onConfigureControlGroup: (segmentId: string) => void;
}

export default function ChampionChallengerDisplay({
  champion,
  challengers,
  onAddChampion,
  onAddChallenger,
  onRemoveSegment,
  onConfigureControlGroup
}: ChampionChallengerDisplayProps) {

  const totalAudience = (champion?.customer_count || 0) +
    challengers.reduce((sum, c) => sum + c.customer_count, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {totalAudience > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-[#588157]">
                {totalAudience.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Audience</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                1 Champion + {challengers.length} Challenger{challengers.length !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-gray-500">Test Configuration</div>
            </div>
          </div>
        </div>
      )}

      {/* Champion Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#588157]" />
            <h3 className="text-lg font-semibold text-gray-900">Champion Segment</h3>
          </div>
          {!champion && (
            <button
              onClick={onAddChampion}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: color.sentra.main }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
              }}
            >
              <Award className="w-4 h-4 mr-2" />
              Add Champion
            </button>
          )}
        </div>

        {champion ? (
          <div className=" border border-[#588157] rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-14 h-14  rounded-xl flex items-center justify-center flex-shrink-0 ">
                  <Award className="w-7 h-7 text-[#588157]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{champion.name}</h4>
                    <span className="px-3 py-1  text-white text-xs font-bold rounded-full shadow-sm">
                      🏆 CHAMPION
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{champion.description}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#588157]" />
                      <span className="text-sm font-semibold text-gray-900">
                        {champion.customer_count.toLocaleString()} customers
                      </span>
                    </div>
                    {champion.control_group_config && champion.control_group_config.type !== 'none' && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        Control Group Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onConfigureControlGroup(champion.id)}
                  className="p-2 text-gray-400 hover:text-[#588157] hover:/10 rounded-lg transition-colors"
                  title="Configure Control Group"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveSegment(champion.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Champion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Champion Defined</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                Add your champion segment first. This is your baseline strategy that challengers will compete against.
              </p>
              <button
                onClick={onAddChampion}
                className="inline-flex items-center px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: color.sentra.main }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                }}
              >
                <Award className="w-4 h-4 mr-2" />
                Add Champion Segment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Challengers Section */}
      {champion && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-[#588157]" />
              <h3 className="text-lg font-semibold text-gray-900">Challenger Segments</h3>
              <span className="text-sm text-gray-500">({challengers.length})</span>
            </div>
            <button
              onClick={onAddChallenger}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              style={{ backgroundColor: color.sentra.main }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
              }}
            >
              <Target className="w-4 h-4 mr-2" />
              Add Challenger
            </button>
          </div>

          {challengers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challengers.map((challenger, index) => (
                <div
                  key={challenger.id}
                  className="bg-white border border-[#A3B18A] rounded-xl p-5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-[#344E41] font-bold text-sm">C{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{challenger.name}</h4>
                          <span className="px-2 py-0.5  text-white text-xs font-medium rounded-full" style={{ backgroundColor: color.sentra.main }}
                          >
                            Challenger
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{challenger.description}</p>
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 font-medium">
                              {challenger.customer_count.toLocaleString()}
                            </span>
                          </div>
                          {challenger.control_group_config && challenger.control_group_config.type !== 'none' && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                              CG
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 ml-2">
                      <button
                        onClick={() => onConfigureControlGroup(challenger.id)}
                        className="p-1.5 text-gray-400 hover:text-[#588157] hover:/10 rounded transition-colors"
                        title="Configure Control Group"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveSegment(challenger.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className=" border border-gray-300 rounded-xl p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Target className="w-12 h-12 text-[#588157] mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">No Challengers Yet</h4>
                <p className="text-sm text-gray-600 mb-4 max-w-sm">
                  Add challenger segments to test alternative strategies against your champion.
                </p>
                <button
                  onClick={onAddChallenger}
                  className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: color.sentra.main }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                  }}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Add First Challenger
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
