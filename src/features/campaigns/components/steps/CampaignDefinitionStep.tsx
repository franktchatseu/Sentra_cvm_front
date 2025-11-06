  import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Settings } from 'lucide-react';
import { CreateCampaignRequest } from '../../types/campaign';
import { campaignService } from '../../services/campaignService';
import { programService } from '../../services/programService';
import { Program } from '../../types/program';
import { useClickOutside } from '../../../../shared/hooks/useClickOutside';
import { lineOfBusinessConfig, departmentsConfig } from '../../../../shared/configs/configurationPageConfigs';
import { configurationDataService } from '../../../../shared/services/configurationDataService';
import { 
    CommunicationPolicyConfiguration
} from '../../types/communicationPolicyConfig';
import { tw, components } from '../../../../shared/utils/utils';
import { communicationPolicyService } from '../../services/communicationPolicyService';
import CommunicationPolicyModal from '../CommunicationPolicyModal';
import PolicyNameModal from '../PolicyNameModal';
import { useToast } from '../../../../contexts/ToastContext';

interface CampaignDefinitionStepProps {
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
}

const objectiveOptions = [
  {
    value: 'acquisition',
    label: 'New Customer Acquisition',
    description: 'Attract and convert new customers to your service',
    icon: '',
    color: 'border-green-300 hover:border-green-400 hover:bg-green-50'
  },
  {
    value: 'retention',
    label: 'Customer Retention',
    description: 'Keep existing customers engaged and loyal',
    icon: '',
    color: 'border-green-200 hover:border-green-300 hover:bg-green-50'
  },
  {
    value: 'churn_prevention',
    label: 'Churn Prevention',
    description: 'Prevent at-risk customers from leaving',
    icon: '',
    color: 'border-red-200 hover:border-red-300 hover:bg-red-50'
  },
  {
    value: 'upsell_cross_sell',
    label: 'Upsell/Cross-sell',
    description: 'Increase revenue from existing customers',
    icon: '',
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
  const { success: showToast, error: showError } = useToast();
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [programSearchTerm, setProgramSearchTerm] = useState('');
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [objectiveSearchTerm, setObjectiveSearchTerm] = useState('');
  const [isObjectiveDropdownOpen, setIsObjectiveDropdownOpen] = useState(false);
  const [lineOfBusinessSearchTerm, setLineOfBusinessSearchTerm] = useState('');
  const [isLineOfBusinessDropdownOpen, setIsLineOfBusinessDropdownOpen] = useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<CampaignCategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [lineOfBusinessData, setLineOfBusinessData] = useState(lineOfBusinessConfig.initialData);
  const [departmentsData, setDepartmentsData] = useState(departmentsConfig.initialData);
  
  // Communication Policy states
  const [communicationPolicies, setCommunicationPolicies] = useState<CommunicationPolicyConfiguration[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<CommunicationPolicyConfiguration | null>(null);
  const [isPolicyDropdownOpen, setIsPolicyDropdownOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [policyToCustomize, setPolicyToCustomize] = useState<CommunicationPolicyConfiguration | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [pendingPolicyData, setPendingPolicyData] = useState<any>(null);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const programDropdownRef = useRef<HTMLDivElement>(null);
  const objectiveDropdownRef = useRef<HTMLDivElement>(null);
  const lineOfBusinessDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const policyDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(programDropdownRef, () => setIsProgramDropdownOpen(false));
  useClickOutside(objectiveDropdownRef, () => setIsObjectiveDropdownOpen(false));
  useClickOutside(lineOfBusinessDropdownRef, () => setIsLineOfBusinessDropdownOpen(false));
  useClickOutside(departmentDropdownRef, () => setIsDepartmentDropdownOpen(false));
  useClickOutside(policyDropdownRef, () => setIsPolicyDropdownOpen(false));

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

  // S'abonner aux changements des données Line of Business
  useEffect(() => {
    const unsubscribe = configurationDataService.subscribe('lineOfBusiness', setLineOfBusinessData);
    return unsubscribe;
  }, []);

  // S'abonner aux changements des données Departments
  useEffect(() => {
    const unsubscribe = configurationDataService.subscribe('departments', setDepartmentsData);
    return unsubscribe;
  }, []);

  // Charger les Communication Policies depuis le service
  useEffect(() => {
    // Load initial policies
    setCommunicationPolicies(communicationPolicyService.getAllPolicies());

    // Subscribe to policy changes
    const unsubscribe = communicationPolicyService.subscribe((updatedPolicies) => {
      setCommunicationPolicies(updatedPolicies);
    });

    return unsubscribe;
  }, []);

  // Handle opening customization modal
  const handleCustomizePolicy = (policy: CommunicationPolicyConfiguration) => {
    // Create a copy of the policy with a temporary name for the modal
    const policyWithTempName = {
      ...policy,
      name: `${policy.name} - Customizing...`
    };
    setPolicyToCustomize(policyWithTempName);
    setIsCustomizationModalOpen(true);
  };

  // Handle saving customized policy
  const handleSaveCustomizedPolicy = async (policyData: any) => {
    // Store the policy data and open name modal
    // First close the customization modal
    setIsCustomizationModalOpen(false);
    
    // Then store data and open name modal
    setPendingPolicyData(policyData);
    setIsNameModalOpen(true);
  };

  // Handle confirming policy name
  const handleConfirmPolicyName = async (policyName: string) => {
    if (!pendingPolicyData || !policyToCustomize) return;

    try {
      // Get the original policy name (remove the temporary suffix)
      const originalPolicyName = policyToCustomize.name.replace(' - Customizing...', '');
      
      // Create new policy with customized configuration
      const newPolicy = communicationPolicyService.createPolicy({
        name: policyName,
        description: pendingPolicyData.description || `Custom policy based on ${originalPolicyName}`,
        channels: pendingPolicyData.channels || ['EMAIL'],
        type: pendingPolicyData.type,
        config: pendingPolicyData.config,
        isActive: pendingPolicyData.isActive ?? true
      });

      // Apply the new policy to the campaign
      setSelectedPolicy(newPolicy);
      
      // Close modals and cleanup
      setIsCustomizationModalOpen(false);
      setPolicyToCustomize(null);
      setPendingPolicyData(null);
      
      showToast('Custom policy created and applied to campaign!');
    } catch (error) {
      console.error('Failed to save custom policy:', error);
      showError('Failed to save custom policy. Please try again.');
    }
  };

  return (
    <div className=" space-y-6">
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Definition & Objectives</h2>
        <p className="text-sm text-gray-600">
          Define your campaign goals and choose how you want to create your campaign
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <h3 className="text-base font-medium text-gray-900 mb-4 md:mb-6 px-0">Campaign Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-0">
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Line of Business
            </label>
            <div className="relative" ref={lineOfBusinessDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLineOfBusinessDropdownOpen(!isLineOfBusinessDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
              >
                <span className={(formData as { line_of_business_id?: number }).line_of_business_id ? 'text-gray-900' : 'text-gray-500'}>
                  {(formData as { line_of_business_id?: number }).line_of_business_id ? 
                    lineOfBusinessData.find(lob => Number(lob.id) === Number((formData as { line_of_business_id?: number }).line_of_business_id))?.name : 
                    'Select line of business (optional)'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLineOfBusinessDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLineOfBusinessDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={lineOfBusinessSearchTerm}
                        onChange={(e) => setLineOfBusinessSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                        placeholder="Search line of business..."
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {lineOfBusinessData.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No line of business available</div>
                    ) : (
                      lineOfBusinessData
                        .filter(lob =>
                          lob.name.toLowerCase().includes(lineOfBusinessSearchTerm.toLowerCase()) ||
                          (lob.description && lob.description.toLowerCase().includes(lineOfBusinessSearchTerm.toLowerCase()))
                        )
                        .map((lob) => (
                          <button
                            key={lob.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, line_of_business_id: Number(lob.id) } as CreateCampaignRequest);
                              setIsLineOfBusinessDropdownOpen(false);
                              setLineOfBusinessSearchTerm('');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{lob.name}</div>
                            {lob.description && <div className="text-gray-500 text-xs">{lob.description}</div>}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <div className="relative" ref={departmentDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
              >
                <span className={(formData as { department_id?: number }).department_id ? 'text-gray-900' : 'text-gray-500'}>
                  {(formData as { department_id?: number }).department_id ? 
                    departmentsData.find(dept => Number(dept.id) === Number((formData as { department_id?: number }).department_id))?.name : 
                    'Select department (optional)'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDepartmentDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={departmentSearchTerm}
                        onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                        placeholder="Search departments..."
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {departmentsData.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No departments available</div>
                    ) : (
                      departmentsData
                        .filter(dept =>
                          dept.name.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
                          (dept.description && dept.description.toLowerCase().includes(departmentSearchTerm.toLowerCase()))
                        )
                        .map((dept) => (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, department_id: Number(dept.id) } as CreateCampaignRequest);
                              setIsDepartmentDropdownOpen(false);
                              setDepartmentSearchTerm('');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{dept.name}</div>
                            {dept.description && <div className="text-gray-500 text-xs">{dept.description}</div>}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Priority
            </label>
            <div className="flex items-center gap-2">
              {[{ value: 'low', label: 'Low', icon: '⬇️' },
              { value: 'medium', label: 'Medium', icon: '➡️' },
              { value: 'high', label: 'High', icon: '⬆️' },
              { value: 'critical', label: 'Critical', icon: '🚨' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value as 'low' | 'medium' | 'high' | 'critical', priority_rank: 1 })}
                  className={`flex-1 px-2 py-2.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 min-h-[42px] ${formData.priority === priority.value
                    ? 'bg-[#588157] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span className="text-xs">{priority.icon}</span>
                  <span className="hidden sm:inline">{priority.label}</span>
                </button>
              ))}
            </div>
            {/* Priority Rank - Only shows when priority is selected */}
            {formData.priority && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rank within {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <button
                      key={rank}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority_rank: rank })}
                      className={`w-8 h-8 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center ${formData.priority_rank === rank
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
          </div>
        </div>

        {/* Communication Policy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Communication Policy
          </label>
          <div className="relative" ref={policyDropdownRef}>
            <button
              type="button"
              onClick={() => setIsPolicyDropdownOpen(!isPolicyDropdownOpen)}
              className={`${components.input.default} w-full px-3 py-2 text-left flex items-center justify-between ${selectedPolicy ? '' : 'text-gray-500'}`}
            >
              <div className="flex items-center gap-2">
                {selectedPolicy && (
                  <div className={`w-2 h-2 rounded-full ${selectedPolicy.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                )}
                <span>
                  {selectedPolicy ? selectedPolicy.name : 'Choose a communication policy (optional)'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isPolicyDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPolicyDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPolicy(null);
                    setIsPolicyDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-700">No Policy</div>
                  <div className="text-xs text-gray-500">Campaign will use default communication settings</div>
                </button>

                <div className="max-h-48 overflow-y-auto">
                  {communicationPolicies.map((policy) => (
                    <button
                      key={policy.id}
                      type="button"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setIsPolicyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${selectedPolicy?.id === policy.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${policy.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                      </div>
                      {policy.description && <div className="text-xs text-gray-500 ml-4">{policy.description}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Customization Toggle */}
          {selectedPolicy && (
            <div className={`flex items-center justify-between px-3 py-2 mt-2 ${tw.surfaceCards} rounded-md border ${tw.borderMuted}`}>
              <span className={`${tw.caption} ${tw.textSecondary} flex items-center gap-2`}>
                <Settings className="w-3 h-3" />
                Want to modify this policy?
              </span>
              <button
                type="button"
                onClick={() => handleCustomizePolicy(selectedPolicy)}
                className={`${tw.button} px-3 py-1 text-xs flex items-center gap-1`}
              >
                <Settings className="w-3 h-3" />
                Customize
              </button>
            </div>
          )}
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

      {/* Customization Modal */}
      <CommunicationPolicyModal
        isOpen={isCustomizationModalOpen}
        onClose={() => {
          setIsCustomizationModalOpen(false);
          setPolicyToCustomize(null);
          setPendingPolicyData(null);
        }}
        policy={policyToCustomize || undefined}
        onSave={handleSaveCustomizedPolicy}
        isSaving={false}
      />

      {/* Policy Name Modal */}
      <PolicyNameModal
        isOpen={isNameModalOpen}
        onClose={() => {
          setIsNameModalOpen(false);
          setPendingPolicyData(null);
        }}
        onConfirm={handleConfirmPolicyName}
        defaultName={policyToCustomize ? `${policyToCustomize.name.replace(' - Customizing...', '')} - Custom` : ''}
        title="Save Custom Policy"
      />
    </div>
  );
}