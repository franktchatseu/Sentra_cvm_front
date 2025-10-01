import { Plus, Trash2 } from 'lucide-react';
import {
  SegmentCondition,
  SegmentConditionGroup,
  SEGMENT_FIELDS,
  PROFILE_360_FIELDS,
  OPERATOR_LABELS
} from '../types/segment';
import ListUpload from './ListUpload';
import { color, tw } from '../../../shared/utils/utils';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';

interface SegmentConditionsBuilderProps {
  conditions: SegmentConditionGroup[];
  onChange: (conditions: SegmentConditionGroup[]) => void;
}

export default function SegmentConditionsBuilder({
  conditions,
  onChange
}: SegmentConditionsBuilderProps) {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addConditionGroup = () => {
    const newGroup: SegmentConditionGroup = {
      id: generateId(),
      operator: 'AND',
      conditionType: 'rule',
      conditions: [{
        id: generateId(),
        field: SEGMENT_FIELDS[0].key,
        operator: 'equals',
        value: '',
        type: 'string'
      }]
    };
    onChange([...conditions, newGroup]);
  };

  const removeConditionGroup = (groupId: string) => {
    onChange(conditions.filter(group => group.id !== groupId));
  };

  const updateConditionGroup = (groupId: string, updates: Partial<SegmentConditionGroup>) => {
    onChange(conditions.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    ));
  };

  const addCondition = (groupId: string) => {
    const newCondition: SegmentCondition = {
      id: generateId(),
      field: SEGMENT_FIELDS[0].key,
      operator: 'equals',
      value: '',
      type: 'string'
    };

    onChange(conditions.map(group =>
      group.id === groupId
        ? { ...group, conditions: [...group.conditions, newCondition] }
        : group
    ));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    onChange(conditions.map(group =>
      group.id === groupId
        ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
        : group
    ));
  };

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<SegmentCondition>) => {
    onChange(conditions.map(group =>
      group.id === groupId
        ? {
          ...group,
          conditions: group.conditions.map(condition =>
            condition.id === conditionId ? { ...condition, ...updates } : condition
          )
        }
        : group
    ));
  };

  const getFieldType = (fieldKey: string, isProfile360 = false) => {
    const fields = isProfile360 ? PROFILE_360_FIELDS : SEGMENT_FIELDS;
    const field = fields.find(f => f.key === fieldKey);
    return field?.type || 'string';
  };

  const getAvailableOperators = (fieldKey: string, isProfile360 = false) => {
    const fields = isProfile360 ? PROFILE_360_FIELDS : SEGMENT_FIELDS;
    const field = fields.find(f => f.key === fieldKey);
    return field?.operators || ['equals'];
  };

  const renderConditionValue = (groupId: string, condition: SegmentCondition, isProfile360 = false) => {
    const fieldType = getFieldType(condition.field, isProfile360);
    const updateFunction = isProfile360 ? updateProfileCondition : updateCondition;

    if (condition.operator === 'in' || condition.operator === 'not_in') {
      return (
        <input
          type="text"
          value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
          onChange={(e) => {
            const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
            updateFunction(groupId, condition.id, { value: values, type: 'array' });
          }}
          placeholder="Enter values separated by commas"
          className={`px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:outline-none text-sm`}
        />
      );
    }

    return (
      <input
        type={fieldType === 'number' ? 'number' : 'text'}
        value={condition.value as string | number}
        onChange={(e) => {
          const value = fieldType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
          updateFunction(groupId, condition.id, { value, type: fieldType });
        }}
        placeholder="Enter value"
        className={`px-3 py-2 border border-[${color.ui.border}] rounded-lg focus:outline-none text-sm`}
      />
    );
  };

  const addProfileCondition = (groupId: string) => {
    const newCondition: SegmentCondition = {
      id: generateId(),
      field: PROFILE_360_FIELDS[0].key,
      operator: 'equals',
      value: '',
      type: 'string'
    };

    onChange(conditions.map(group =>
      group.id === groupId
        ? {
          ...group,
          profileConditions: [...(group.profileConditions || []), newCondition]
        }
        : group
    ));
  };

  const removeProfileCondition = (groupId: string, conditionId: string) => {
    onChange(conditions.map(group =>
      group.id === groupId
        ? {
          ...group,
          profileConditions: (group.profileConditions || []).filter(c => c.id !== conditionId)
        }
        : group
    ));
  };

  const updateProfileCondition = (groupId: string, conditionId: string, updates: Partial<SegmentCondition>) => {
    onChange(conditions.map(group =>
      group.id === groupId
        ? {
          ...group,
          profileConditions: (group.profileConditions || []).map(condition =>
            condition.id === conditionId ? { ...condition, ...updates } : condition
          )
        }
        : group
    ));
  };

  if (conditions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No conditions defined yet</p>
        <button
          onClick={addConditionGroup}
          className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors text-sm"
          style={{ backgroundColor: color.sentra.main }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Condition Group
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conditions.map((group, groupIndex) => (
        <div key={group.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          {/* Group Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {groupIndex > 0 && (
                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded">
                  AND
                </span>
              )}

              {/* Condition Type Selection */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <div className="w-48">
                  <HeadlessSelect
                    options={[
                      { value: 'rule', label: 'Rule' },
                      { value: 'list', label: 'List' },
                      { value: 'segments', label: 'Segments' },
                      { value: '360', label: '360 Profile' }
                    ]}
                    value={group.conditionType}
                    onChange={(value) => updateConditionGroup(group.id, { conditionType: value as 'rule' | 'list' | 'segments' | '360' })}
                    placeholder="Select type"
                    className="text-sm"
                  />
                </div>
              </div>

              {group.conditionType === 'rule' && (
                <>
                  <div className="w-20">
                    <HeadlessSelect
                      options={[
                        { value: 'AND', label: 'AND' },
                        { value: 'OR', label: 'OR' }
                      ]}
                      value={group.operator}
                      onChange={(value) => updateConditionGroup(group.id, { operator: value as 'AND' | 'OR' })}
                      placeholder="AND"
                      className="text-sm"
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {group.conditions.length} condition{group.conditions.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => removeConditionGroup(group.id)}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
              title="Remove Group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Condition Content */}
          {group.conditionType === 'rule' && (
            <div className="space-y-3">
              {group.conditions.map((condition, conditionIndex) => (
                <div key={condition.id} className="flex items-center space-x-3 bg-white p-3 rounded border">
                  {conditionIndex > 0 && (
                    <span className={`px-2 py-1 bg-[${color.entities.segments}]/10 text-[${color.entities.segments}] text-xs font-medium rounded`}>
                      {group.operator}
                    </span>
                  )}

                  {/* Field Selection */}
                  <div className="min-w-[200px]">
                    <HeadlessSelect
                      options={SEGMENT_FIELDS.map(field => ({
                        value: field.key,
                        label: field.label
                      }))}
                      value={condition.field}
                      onChange={(value) => {
                        const fieldType = getFieldType(value as string);
                        const availableOperators = getAvailableOperators(value as string);
                        updateCondition(group.id, condition.id, {
                          field: value as string,
                          operator: availableOperators[0] as 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in',
                          type: fieldType,
                          value: fieldType === 'number' ? 0 : ''
                        });
                      }}
                      placeholder="Select field"
                      className="text-sm"
                    />
                  </div>

                  {/* Operator Selection */}
                  <div className="min-w-[120px]">
                    <HeadlessSelect
                      options={getAvailableOperators(condition.field).map(op => ({
                        value: op,
                        label: OPERATOR_LABELS[op]
                      }))}
                      value={condition.operator}
                      onChange={(value) => updateCondition(group.id, condition.id, { operator: value as 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' })}
                      placeholder="Select operator"
                      className="text-sm"
                    />
                  </div>

                  {/* Value Input */}
                  {renderConditionValue(group.id, condition)}

                  {/* Remove Condition */}
                  <button
                    onClick={() => removeCondition(group.id, condition.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                    title="Remove Condition"
                    disabled={group.conditions.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* List Upload Component */}
          {group.conditionType === 'list' && (
            <ListUpload
              listData={group.listData}
              onListDataChange={(listData) => updateConditionGroup(group.id, { listData })}
            />
          )}

          {/* Segments Selection */}
          {group.conditionType === 'segments' && (
            <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: `${color.entities.segments}10` }}>
              <h4 className={`font-medium ${tw.textPrimary} mb-2`}>Select Segments</h4>
              <p className={`text-sm ${tw.textSecondary} mb-3`}>Choose existing segments to include in this condition group.</p>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none">
                <option value="">Select a segment...</option>
                {/* This would be populated with actual segments from the backend */}
              </select>
            </div>
          )}

          {/* 360 Profile */}
          {group.conditionType === '360' && (
            <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: `${color.entities.segments}10` }}>
              <h4 className={`font-medium ${tw.textPrimary} mb-2`}>360 Customer Profile</h4>
              <p className={`text-sm ${tw.textSecondary} mb-3`}>Configure conditions based on comprehensive customer profile data.</p>

              <div className="space-y-3">
                {(group.profileConditions || []).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">No profile conditions defined yet</p>
                    <button
                      onClick={() => addProfileCondition(group.id)}
                      className="inline-flex items-center px-3 py-2 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: color.sentra.main }}
                      onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                      onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Profile Condition
                    </button>
                  </div>
                ) : (
                  <>
                    {group.profileConditions?.map((condition, conditionIndex) => (
                      <div key={condition.id} className="flex items-center space-x-3 bg-white p-3 rounded border">
                        {conditionIndex > 0 && (
                          <span className="px-2 py-1 text-xs font-medium rounded" style={{ backgroundColor: `${color.entities.segments}20`, color: color.entities.segments }}>
                            AND
                          </span>
                        )}

                        {/* Profile Field Selection */}
                        <select
                          value={condition.field}
                          onChange={(e) => {
                            const fieldType = getFieldType(e.target.value, true);
                            const availableOperators = getAvailableOperators(e.target.value, true);
                            updateProfileCondition(group.id, condition.id, {
                              field: e.target.value,
                              operator: availableOperators[0] as 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in',
                              type: fieldType,
                              value: fieldType === 'number' ? 0 : ''
                            });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none min-w-[200px]"
                          style={{
                            borderColor: color.ui.border
                          }}
                        >
                          {PROFILE_360_FIELDS.map(field => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </select>

                        {/* Operator Selection */}
                        <select
                          value={condition.operator}
                          onChange={(e) => updateProfileCondition(group.id, condition.id, { operator: e.target.value as 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                          style={{
                            borderColor: color.ui.border
                          }}
                        >
                          {getAvailableOperators(condition.field, true).map(op => (
                            <option key={op} value={op}>
                              {OPERATOR_LABELS[op]}
                            </option>
                          ))}
                        </select>

                        {/* Value Input */}
                        {renderConditionValue(group.id, condition, true)}

                        {/* Remove Condition */}
                        <button
                          onClick={() => removeProfileCondition(group.id, condition.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                          title="Remove Condition"
                          disabled={group.profileConditions?.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add Profile Condition Button */}
                    <button
                      onClick={() => addProfileCondition(group.id)}
                      className="inline-flex items-center px-3 py-1 text-sm rounded transition-colors"
                      style={{
                        color: color.sentra.main,
                        backgroundColor: `${color.sentra.main}10`
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}20`;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}10`;
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Profile Condition
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Add Condition Button - Only show for rule type */}
          {group.conditionType === 'rule' && (
            <button
              onClick={() => addCondition(group.id)}
              className={`mt-3 inline-flex items-center px-3 py-1 text-sm text-[${color.entities.segments}] hover:text-[${color.entities.segments}]/80 hover:bg-[${color.entities.segments}]/10 rounded transition-colors`}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Condition
            </button>
          )}
        </div>
      ))}

      {/* Add Group Button */}
      <button
        onClick={addConditionGroup}
        className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors text-sm"
        style={{ backgroundColor: color.sentra.main }}
        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Condition Group
      </button>
    </div>
  );
}
