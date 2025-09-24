import { Plus, Trash2 } from 'lucide-react';
import { 
  SegmentCondition, 
  SegmentConditionGroup, 
  SEGMENT_FIELDS, 
  PROFILE_360_FIELDS,
  OPERATOR_LABELS 
} from '../../types/segment';
import ListUpload from './ListUpload';

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
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <select
                  value={group.conditionType}
                  onChange={(e) => updateConditionGroup(group.id, { conditionType: e.target.value as 'rule' | 'list' | 'segments' | '360' })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rule">Rule</option>
                  <option value="list">List</option>
                  <option value="segments">Segments</option>
                  <option value="360">360 Profile</option>
                </select>
              </div>

              {group.conditionType === 'rule' && (
                <>
                  <select
                    value={group.operator}
                    onChange={(e) => updateConditionGroup(group.id, { operator: e.target.value as 'AND' | 'OR' })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
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
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {group.operator}
                    </span>
                  )}
                  
                  {/* Field Selection */}
                  <select
                    value={condition.field}
                    onChange={(e) => {
                      const fieldType = getFieldType(e.target.value);
                      const availableOperators = getAvailableOperators(e.target.value);
                      updateCondition(group.id, condition.id, {
                        field: e.target.value,
                        operator: availableOperators[0] as any,
                        type: fieldType,
                        value: fieldType === 'number' ? 0 : ''
                      });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                  >
                    {SEGMENT_FIELDS.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  {/* Operator Selection */}
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(group.id, condition.id, { operator: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getAvailableOperators(condition.field).map(op => (
                      <option key={op} value={op}>
                        {OPERATOR_LABELS[op]}
                      </option>
                    ))}
                  </select>

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
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Select Segments</h4>
              <p className="text-sm text-green-700 mb-3">Choose existing segments to include in this condition group.</p>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Select a segment...</option>
                {/* This would be populated with actual segments from the backend */}
              </select>
            </div>
          )}

          {/* 360 Profile */}
          {group.conditionType === '360' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">360 Customer Profile</h4>
              <p className="text-sm text-purple-700 mb-3">Configure conditions based on comprehensive customer profile data.</p>
              
              <div className="space-y-3">
                {(group.profileConditions || []).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">No profile conditions defined yet</p>
                    <button
                      onClick={() => addProfileCondition(group.id)}
                      className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
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
                              operator: availableOperators[0] as any,
                              type: fieldType,
                              value: fieldType === 'number' ? 0 : ''
                            });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[200px]"
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
                          onChange={(e) => updateProfileCondition(group.id, condition.id, { operator: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      className="inline-flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors"
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
              className="mt-3 inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
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
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Condition Group
      </button>
    </div>
  );
}
