import { useState, useEffect } from 'react';
import { X, Tag, Save, Eye } from 'lucide-react';
import { Segment, CreateSegmentRequest, SegmentConditionGroup } from '../../types/segment';
import SegmentConditionsBuilder from '../segments/SegmentConditionsBuilder';
import { segmentService } from '../../services/segmentService';
import { color, tw } from '../../design/utils';

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
    type: "dynamic"
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (segment) {
        setFormData({
          name: segment.name,
          description: segment.description,
          tags: segment.tags,
          conditions: segment.conditions,
          type: "dynamic"
        });
      } else {
        setFormData({
          name: '',
          description: '',
          tags: [],
          type: "dynamic",
          conditions: []
        });
      }
      setError('');
      setPreviewCount(null);
    }
  }, [isOpen, segment]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePreview = async () => {
    if (formData.conditions.length === 0) {
      setPreviewCount(0);
      return;
    }

    setIsPreviewLoading(true);
    try {
      const result = await segmentService.getSegmentPreview(formData.conditions);
      setPreviewCount(result.count);
    } catch (err) {
      console.error('Preview failed:', err);
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

    if (formData.conditions.length === 0) {
      setError('At least one condition is required');
      return;
    }

    setIsLoading(true);
    try {
      let savedSegment: Segment;

      if (segment) {
        // Update existing segment
        savedSegment = await segmentService.updateSegment(segment.segment_id, formData);
      } else {
        // Create new segment
        const createRequest: CreateSegmentRequest = {
          name: formData.name,
          description: formData.description,
          tags: formData.tags,
          conditions: formData.conditions,
          type: "dynamic"
        };
        savedSegment = await segmentService.createSegment(createRequest);
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

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
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                    Tags
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type and press Enter to add tags"
                      className={`w-full px-4 py-3 border border-[${color.ui.border}] rounded-lg focus:outline-none text-sm`}
                    />
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
          <div className={`flex items-center justify-end space-x-4 p-6 border-t border-[${color.ui.border}] bg-[${color.ui.surface}] flex-shrink-0`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 ${tw.textSecondary} bg-white border border-[${color.ui.border}] rounded-lg hover:bg-[${color.ui.surface}] transition-colors text-sm`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
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
