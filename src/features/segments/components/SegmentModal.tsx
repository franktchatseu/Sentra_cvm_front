import { useState, useEffect } from 'react';
import { X, Tag, Save, Eye } from 'lucide-react';
import { Segment, CreateSegmentRequest, SegmentConditionGroup } from '../types/segment';
import SegmentConditionsBuilder from './SegmentConditionsBuilder';
import { segmentService } from '../services/segmentService';
import { color, tw } from '../../../shared/utils/utils';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';

interface SegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (segment: Segment) => void;
  segment?: Segment | null;
}

export default function SegmentModal({ isOpen, onClose, onSave, segment }: SegmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    conditions: [] as SegmentConditionGroup[],
    type: "dynamic",
    category: undefined as number | undefined
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await segmentService.getSegmentCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    const loadSegmentData = async () => {
      if (isOpen) {
        if (segment) {
          const segmentId = segment.segment_id || segment.id!;

          try {
            // Load rules from backend
            const rules = await segmentService.getSegmentRules(segmentId);

            // Convert rules back to condition groups
            const conditionGroups: SegmentConditionGroup[] = [];

            if (rules.length > 0) {
              // Group rules by their order and operator
              const currentGroup: SegmentConditionGroup = {
                id: Math.random().toString(36).substr(2, 9),
                operator: 'AND',
                conditionType: 'rule',
                conditions: []
              };

              for (const rule of rules) {
                const ruleJson = rule.rule_json as {
                  field: string;
                  operator: string;
                  value: string | number | string[];
                  type?: string;
                  group_operator?: string;
                };

                currentGroup.conditions.push({
                  id: Math.random().toString(36).substr(2, 9),
                  field: ruleJson.field,
                  operator: ruleJson.operator as 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in',
                  value: ruleJson.value,
                  type: (ruleJson.type as 'string' | 'number' | 'boolean' | 'array') || 'string'
                });

                if (ruleJson.group_operator) {
                  currentGroup.operator = ruleJson.group_operator as 'AND' | 'OR';
                }
              }

              conditionGroups.push(currentGroup);
            }

            setFormData({
              name: segment.name,
              description: segment.description || '',
              tags: segment.tags || [],
              conditions: conditionGroups.length > 0 ? conditionGroups : (segment.conditions || []),
              type: "dynamic",
              category: segment.category
            });
          } catch (err) {
            console.error('Failed to load rules:', err);
            // Fallback to conditions from segment if rules fail to load
            setFormData({
              name: segment.name,
              description: segment.description || '',
              tags: segment.tags || [],
              conditions: segment.conditions || [],
              type: "dynamic",
              category: segment.category
            });
          }
        } else {
          setFormData({
            name: '',
            description: '',
            tags: [],
            type: "dynamic",
            conditions: [],
            category: undefined
          });
        }
        setError('');
        setPreviewCount(null);
      }
    };

    loadSegmentData();
  }, [isOpen, segment]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        const updatedTags = [...formData.tags, newTag];
        setFormData(prev => ({
          ...prev,
          tags: updatedTags
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({
      ...prev,
      tags: updatedTags
    }));
  };

  const handlePreview = async () => {
    if (formData.conditions.length === 0) {
      setPreviewCount(0);
      return;
    }

    setIsPreviewLoading(true);
    setError('');

    try {
      // Transform conditions to backend criteria format
      const criteria = {
        conditions: formData.conditions.flatMap(group =>
          group.conditions.map((condition: { field: string; operator: string; value: string | number | string[] }) => ({
            field: condition.field,
            operator: condition.operator,
            value: condition.value
          }))
        )
      };

      // First validate the criteria
      const validationResult = await segmentService.validateCriteria({
        criteria,
        segment_type: formData.type as 'static' | 'dynamic' | 'trigger'
      });

      if (!validationResult.valid) {
        setError(validationResult.errors?.join(', ') || 'Invalid criteria');
        setPreviewCount(null);
        return;
      }

      // If validation passes, get preview data with sample size
      // Note: For new segments without ID, we use the legacy preview endpoint
      const previewResult = await segmentService.getSegmentPreview(
        formData.conditions.flatMap(group => group.conditions) as Record<string, unknown>[]
      );

      setPreviewCount(previewResult.count || 0);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Preview failed:', err);
      setError((err as Error).message || 'Failed to preview segment');
      setPreviewCount(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    if (!formData.name.trim()) {
      setError('Segment name is required');
      return;
    }


    setIsLoading(true);
    try {
      let savedSegment: Segment;

      if (segment) {
        // Update existing segment
        const segmentId = segment.segment_id || segment.id!;

        // Update segment basic info
        const updateResponse = await segmentService.updateSegment(segmentId, {
          name: formData.name,
          description: formData.description,
          tags: formData.tags,
          category: formData.category
        });

        // Extract segment from response (backend returns {success, message, data})
        savedSegment = (updateResponse as { data?: Segment }).data || updateResponse as Segment;

        // Get existing rules to delete them
        const existingRulesResponse = await segmentService.getSegmentRules(segmentId);

        // Handle both response formats: array or {data: array}
        const existingRules = Array.isArray(existingRulesResponse)
          ? existingRulesResponse
          : (existingRulesResponse as { data?: unknown[] })?.data || [];


        // Delete all existing rules
        for (const rule of existingRules) {
          const ruleWithId = rule as { id?: number };
          if (ruleWithId.id) {
            await segmentService.deleteSegmentRule(segmentId, ruleWithId.id);
          }
        }

        // Create new rules from conditions
        let ruleOrder = 1;
        for (const conditionGroup of formData.conditions) {
          for (const condition of conditionGroup.conditions) {
            await segmentService.createSegmentRule(segmentId, {
              rule_json: {
                field: condition.field,
                operator: condition.operator,
                value: condition.value,
                type: condition.type,
                group_operator: conditionGroup.operator
              },
              rule_order: ruleOrder++
            });
          }
        }
      } else {
        // Create new segment (without conditions first)
        const createRequest: CreateSegmentRequest = {
          name: formData.name,
          description: formData.description,
          tags: formData.tags,
          type: "dynamic",
          category: formData.category
        };
        const createResponse = await segmentService.createSegment(createRequest);

        // Extract segment from response (backend returns {success, message, data})
        savedSegment = (createResponse as { data?: Segment }).data || createResponse as Segment;

        // Now create rules for the new segment
        const segmentId = savedSegment.id || savedSegment.segment_id!;
        let ruleOrder = 1;

        for (const conditionGroup of formData.conditions) {
          for (const condition of conditionGroup.conditions) {
            await segmentService.createSegmentRule(segmentId, {
              rule_json: {
                field: condition.field,
                operator: condition.operator,
                value: condition.value,
                type: condition.type,
                group_operator: conditionGroup.operator
              },
              rule_order: ruleOrder++
            });
          }
        }
      }

      onSave(savedSegment);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save segment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-[${color.ui.border}] bg-gradient-to-r from-[${color.entities.segments}]/5 to-[${color.entities.segments}]/10 flex-shrink-0`}>
            <div>
              <h2 className={`text-2xl font-bold ${tw.textPrimary}`}>
                {segment ? 'Edit Segment' : 'Create New Segment'}
              </h2>
              <p className={`${tw.textSecondary} mt-1`}>
                Define customer segments using rules and filters
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-[${color.ui.surface}] rounded-lg transition-colors`}
            >
              <X className={`w-6 h-6 ${tw.textMuted}`} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <form id="segment-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className={`p-4 bg-[${color.status.error.light}] border border-[${color.status.error.main}]/20 rounded-lg`}>
                  <p className={`text-sm text-[${color.status.error.main}]`}>{error}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                    Segment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter segment name"
                    className={`w-full px-4 py-3 border border-[${color.ui.border}] rounded-lg focus:outline-none text-sm`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                    Segment Catalog
                  </label>
                  <HeadlessSelect
                    options={[
                      { value: '', label: 'No catalog (Uncategorized)' },
                      ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    value={formData.category || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value ? Number(value) : undefined }))}
                    placeholder="Select a catalog"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTagInput(value);

                          // Auto-add tag when comma is typed
                          if (value.includes(',')) {
                            const tag = value.replace(',', '').trim();
                            if (tag && !formData.tags.includes(tag.toLowerCase())) {
                              const updatedTags = [...formData.tags, tag.toLowerCase()];
                              setFormData(prev => ({ ...prev, tags: updatedTags }));
                              setTagInput('');
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          handleAddTag(e);
                        }}
                        placeholder="Type tags separated by commas (e.g., premium, high-value)"
                        className={`flex-1 px-4 py-3 border border-[${color.ui.border}] rounded-lg focus:outline-none text-sm`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim()) {
                            const newTag = tagInput.trim().toLowerCase();
                            if (!formData.tags.includes(newTag)) {
                              const updatedTags = [...formData.tags, newTag];
                              setFormData(prev => ({ ...prev, tags: updatedTags }));
                              setTagInput('');
                            }
                          }
                        }}
                        className="px-4 py-3 text-white rounded-lg transition-colors text-sm"
                        style={{ backgroundColor: color.sentra.main }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                        }}
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center px-3 py-1 bg-[${color.entities.segments}]/10 text-[${color.entities.segments}] text-sm font-medium rounded-full`}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className={`ml-2 text-[${color.entities.segments}] hover:text-[${color.entities.segments}]/80`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this segment..."
                  rows={3}
                  className={`w-full px-4 py-3 border border-[${color.ui.border}] rounded-lg text-sm`}
                />
              </div>

              {/* Segment Conditions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className={`block text-sm font-medium ${tw.textPrimary}`}>
                    Segment Conditions *
                  </label>
                  <div className="flex items-center space-x-3">
                    {previewCount !== null && (
                      <span className={`text-sm ${tw.textSecondary}`}>
                        {previewCount.toLocaleString()} customers
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handlePreview}
                      disabled={isPreviewLoading || formData.conditions.length === 0}
                      className={`inline-flex items-center px-3 py-1 text-white text-sm rounded-lg transition-colors`}
                      style={{
                        backgroundColor: isPreviewLoading || formData.conditions.length === 0 ? color.ui.gray[400] : color.sentra.main
                      }}
                      onMouseEnter={(e) => {
                        if (!isPreviewLoading && formData.conditions.length > 0) {
                          (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPreviewLoading && formData.conditions.length > 0) {
                          (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isPreviewLoading ? 'Loading...' : 'Preview'}
                    </button>
                  </div>
                </div>

                <div className={`border border-[${color.ui.border}] rounded-lg p-4 bg-[${color.ui.surface}]`}>
                  <SegmentConditionsBuilder
                    conditions={formData.conditions}
                    onChange={(conditions) => setFormData(prev => ({ ...prev, conditions }))}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer - Sticky */}
          <div className={`flex items-center justify-end space-x-4 p-6 border-t border-[${color.ui.border}]  flex-shrink-0`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 ${tw.textSecondary} bg-white border border-[${color.ui.border}] rounded-lg hover:bg-[${color.ui.surface}] transition-colors text-sm`}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="segment-form"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-2 text-white rounded-lg transition-colors text-sm"
              style={{ backgroundColor: isLoading ? color.ui.gray[400] : color.sentra.main }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                }
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : segment ? 'Update Segment' : 'Create Segment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
