import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { CreateCampaignRequest } from '../../types/campaign';
import { campaignService } from '../../services/campaignService';
import { programService } from '../../services/programService';
import { Program } from '../../types/program';
import { useClickOutside } from '../../../../shared/hooks/useClickOutside';

interface CampaignDefinitionStepProps {
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
}

const objectiveOptions = [
  {
    value: 'acquisition',
    label: 'New Customer Acquisition',
    description: 'Attract and convert new customers to your service',
    icon: '🎯',
    color: 'border-green-300 hover:border-green-400 hover:bg-green-50'
  },
  {
    value: 'retention',
    label: 'Customer Retention',
    description: 'Keep existing customers engaged and loyal',
    icon: '🤝',
    color: 'border-green-200 hover:border-green-300 hover:bg-green-50'
  },
  {
    value: 'churn_prevention',
    label: 'Churn Prevention',
    description: 'Prevent at-risk customers from leaving',
    icon: '🛡️',
    color: 'border-red-200 hover:border-red-300 hover:bg-red-50'
  },
  {
    value: 'upsell_cross_sell',
    label: 'Upsell/Cross-sell',
    description: 'Increase revenue from existing customers',
    icon: '📈',
    color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
  },
  {
    value: 'reactivation',
    label: 'Dormant Customer Reactivation',
    description: 'Re-engage inactive or dormant customers',
    icon: '🔄',
    color: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
  }
];

interface CampaignCategory {
  id: number;
  name: string;
  description: string;
}

export default function CampaignDefinitionStep({
  formData,
  setFormData
}: CampaignDefinitionStepProps) {
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [programSearchTerm, setProgramSearchTerm] = useState('');
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [objectiveSearchTerm, setObjectiveSearchTerm] = useState('');
  const [isObjectiveDropdownOpen, setIsObjectiveDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<CampaignCategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const programDropdownRef = useRef<HTMLDivElement>(null);
  const objectiveDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(programDropdownRef, () => setIsProgramDropdownOpen(false));
  useClickOutside(objectiveDropdownRef, () => setIsObjectiveDropdownOpen(false));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await campaignService.getCampaignCategories();
        const categories = Array.isArray(response) ? response : (response as { data: CampaignCategory[] }).data || [];
        setCategories(categories as CampaignCategory[]);
      } catch (error) {
        console.error('Failed to fetch campaign categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoadingPrograms(true);
        const response = await programService.getAllPrograms({
          pageSize: 100,
          skipCache: true
        });
        setPrograms(response.data || []);
      } catch (error) {
        console.error('Failed to fetch programs:', error);
        setPrograms([]);
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className=" space-y-6">
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Definition & Objectives</h2>
        <p className="text-sm text-gray-600">
          Define your campaign goals and choose how you want to create your campaign
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-medium text-gray-900 mb-6">Campaign Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] text-sm"
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Catalog *
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
              >
                <span className={formData.category_id ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.category_id ? (categories.find(c => Number(c.id) === Number(formData.category_id))?.name || (isLoadingCategories ? 'Loading...' : 'Select catalog')) : 'Select catalog'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                        placeholder="Search categories..."
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {isLoadingCategories ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading categories...</div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No categories available</div>
                    ) : (
                      categories
                        .filter(category =>
                          category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                          category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
                        )
                        .map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category_id: category.id });
                              setIsCategoryDropdownOpen(false);
                              setCategorySearchTerm('');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{category.name}</div>
                            <div className="text-gray-500 text-xs">{category.description}</div>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Tag
            </label>
            <input
              type="text"
              value={formData.tag || ''}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] text-sm"
              placeholder="Enter campaign tag"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <div className="relative" ref={programDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
              >
                <span className={(formData as { program_id?: number }).program_id ? 'text-gray-900' : 'text-gray-500'}>
                  {(formData as { program_id?: number }).program_id ? programs.find(p => Number(p.id) === Number((formData as { program_id?: number }).program_id))?.name : 'Select program (optional)'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProgramDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProgramDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={programSearchTerm}
                        onChange={(e) => setProgramSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                        placeholder="Search programs..."
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {isLoadingPrograms ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading programs...</div>
                    ) : programs.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No programs available</div>
                    ) : (
                      programs
                        .filter(program =>
                          program.name.toLowerCase().includes(programSearchTerm.toLowerCase()) ||
                          (program.description && program.description.toLowerCase().includes(programSearchTerm.toLowerCase()))
                        )
                        .map((program) => (
                          <button
                            key={program.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, program_id: Number(program.id) } as CreateCampaignRequest);
                              setIsProgramDropdownOpen(false);
                              setProgramSearchTerm('');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{program.name}</div>
                            {program.description && <div className="text-gray-500 text-xs">{program.description}</div>}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Business
            </label>
            <input
              type="text"
              value={formData.business || ''}
              onChange={(e) => setFormData({ ...formData, business: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] text-sm"
              placeholder="Enter campaign business"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] text-sm"
            placeholder="Describe your campaign goals and objectives"
            rows={3}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-medium text-gray-900 mb-6">Campaign Objectives</h3>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Objective *
          </label>
          <div className="relative" ref={objectiveDropdownRef}>
            <button
              type="button"
              onClick={() => setIsObjectiveDropdownOpen(!isObjectiveDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
            >
              <span className={formData.objective ? 'text-gray-900' : 'text-gray-500'}>
                {formData.objective ? objectiveOptions.find(o => o.value === formData.objective)?.label : 'Select objective'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isObjectiveDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isObjectiveDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={objectiveSearchTerm}
                      onChange={(e) => setObjectiveSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                      placeholder="Search objectives..."
                    />
                  </div>
                </div>
                <div className="py-1">
                  {objectiveOptions
                    .filter(objective =>
                      objective.label.toLowerCase().includes(objectiveSearchTerm.toLowerCase()) ||
                      objective.description.toLowerCase().includes(objectiveSearchTerm.toLowerCase())
                    )
                    .map((objective) => (
                      <button
                        key={objective.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, objective: objective.value as 'acquisition' | 'retention' | 'churn_prevention' | 'upsell_cross_sell' | 'reactivation' });
                          setIsObjectiveDropdownOpen(false);
                          setObjectiveSearchTerm('');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{objective.icon}</span>
                          <div>
                            <div className="font-medium">{objective.label}</div>
                            <div className="text-gray-500 text-xs">{objective.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Priority */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-medium text-gray-900 mb-6">Campaign Priority</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority Level
          </label>
          <div className="flex items-center space-x-2">
            {[
              { value: 'low', label: 'Low', icon: '⬇️' },
              { value: 'medium', label: 'Medium', icon: '➡️' },
              { value: 'high', label: 'High', icon: '⬆️' },
              { value: 'critical', label: 'Critical', icon: '🚨' }
            ].map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: priority.value as 'low' | 'medium' | 'high' | 'critical', priority_rank: 1 })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${formData.priority === priority.value
                  ? 'bg-[#588157] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span className="text-sm">{priority.icon}</span>
                <span>{priority.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority Rank - Only shows when priority is selected */}
        {formData.priority && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rank within {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rank) => (
                <button
                  key={rank}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority_rank: rank })}
                  className={`w-10 h-10 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${formData.priority_rank === rank
                    ? 'bg-[#588157] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {rank}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Rank 1 is highest priority within {formData.priority} level
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Campaign Policy
          </label>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.is_definitive || false}
                onChange={(e) => setFormData({ ...formData, is_definitive: e.target.checked })}
                className="mt-0.5 w-5 h-5 text-[#588157] border-gray-300 focus:ring-[#588157] rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 group-hover:text-[#588157] transition-colors">
                  Definitive Campaign
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Once launched, this campaign cannot be modified. Only pause, resume, or termination actions will be available.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}