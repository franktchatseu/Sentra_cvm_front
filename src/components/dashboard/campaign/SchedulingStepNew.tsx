import { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { CreateCampaignRequest, CampaignScheduling } from '../../../types/campaign';
import { tw } from '../../../design/utils';
import StepNavigation from '../../ui/StepNavigation';

interface SchedulingStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export default function SchedulingStep({
  onNext,
  onPrev,
  formData,
  setFormData
}: SchedulingStepProps) {
  const [scheduling, setScheduling] = useState<CampaignScheduling>(
    formData.scheduling || {
      type: 'scheduled',
      time_zone: '(GMT+02:00) Sudan',
      start_date: '',
      end_date: ''
    }
  );

  const [endType, setEndType] = useState<'never' | 'at'>('never');
  const [startType, setStartType] = useState<'datetime' | 'previous'>('datetime');

  const [recurrencePattern, setRecurrencePattern] = useState('Weeks');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [defaultStartTime, setDefaultStartTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6]); // Monday to Saturday
  const [setSpecificStartTime, setSetSpecificStartTime] = useState(false);
  const [startDeliveryOnCompletion, setStartDeliveryOnCompletion] = useState(false);
  const [targetRenderTime, setTargetRenderTime] = useState('Real Time');
  const [startBroadcastBefore, setStartBroadcastBefore] = useState('Before');
  const [hoursBeforeBroadcast, setHoursBeforeBroadcast] = useState(0);

  const handleNext = () => {
    setFormData({
      ...formData,
      scheduling: {
        ...scheduling,
        frequency: {
          type: recurrencePattern.toLowerCase() as 'daily' | 'weekly',
          interval: recurrenceInterval,
          days_of_week: selectedDays
        }
      }
    });
    onNext();
  };

  const updateScheduling = (updates: Partial<CampaignScheduling>) => {
    setScheduling(prev => ({ ...prev, ...updates }));
  };

  const toggleDayOfWeek = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const isFormValid = scheduling.start_date && scheduling.start_date !== '' && scheduling.time_zone;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Broadcast Schedule Range</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure your campaign broadcast schedule and delivery settings
        </p>
      </div>

      {/* Broadcast Schedule Range */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Broadcast Schedule Range</h3>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {/* Start Options */}
          <div className="mb-6">
            <div className="flex items-center space-x-6 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="startType"
                  value="datetime"
                  checked={startType === 'datetime'}
                  onChange={() => setStartType('datetime')}
                  className="w-4 h-4 text-[#3b8169] border-gray-300 focus:ring-[#3b8169]"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Start date/time</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="startType"
                  value="previous"
                  checked={startType === 'previous'}
                  onChange={() => setStartType('previous')}
                  className="w-4 h-4 text-[#3b8169] border-gray-300 focus:ring-[#3b8169]"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Starts when the previous broadcast is aborted</span>
              </label>
            </div>
          </div>

          {/* Start Date/Time Input - Only show when datetime is selected */}
          {startType === 'datetime' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Start Date/Time</label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="date"
                    value={scheduling.start_date?.split('T')[0] || '2025-09-22'}
                    onChange={(e) => updateScheduling({ start_date: e.target.value + 'T08:00' })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white text-gray-900"
                    style={{ minWidth: '140px', backgroundColor: 'white' }}
                  />
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value="08:00"
                    onChange={(e) => updateScheduling({ start_date: scheduling.start_date?.split('T')[0] + 'T' + e.target.value || '2025-09-22T' + e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white text-gray-900"
                    style={{ minWidth: '100px', backgroundColor: 'white' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* End Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">End</label>
            <div className="flex items-center space-x-6 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="endType"
                  value="never"
                  checked={endType === 'never'}
                  onChange={() => {
                    setEndType('never');
                    updateScheduling({ end_date: '' });
                  }}
                  className="w-4 h-4 text-[#3b8169] border-gray-300 focus:ring-[#3b8169]"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Never</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="endType"
                  value="at"
                  checked={endType === 'at'}
                  onChange={() => {
                    setEndType('at');
                    updateScheduling({ end_date: '2025-12-31T23:59' });
                  }}
                  className="w-4 h-4 text-[#3b8169] border-gray-300 focus:ring-[#3b8169]"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">At</span>
              </label>
            </div>
          </div>

          {/* End Date Input (conditional) */}
          {endType === 'at' && (
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="date"
                    value={scheduling.end_date?.split('T')[0] || '2025-12-31'}
                    onChange={(e) => updateScheduling({ end_date: e.target.value + 'T23:59' })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white text-gray-900"
                    style={{ minWidth: '140px', backgroundColor: 'white' }}
                  />
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value="23:59"
                    onChange={(e) => updateScheduling({ end_date: scheduling.end_date?.split('T')[0] + 'T' + e.target.value || '2025-12-31T' + e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white text-gray-900"
                    style={{ minWidth: '100px', backgroundColor: 'white' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Time Zone</label>
            <select
              value={scheduling.time_zone}
              onChange={(e) => updateScheduling({ time_zone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white"
            >
              <option value="(GMT+02:00) Sudan">(GMT+02:00) Sudan</option>
              <option value="(GMT+00:00) UTC">UTC (Coordinated Universal Time)</option>
              <option value="(GMT-05:00) Eastern">Eastern Time (ET)</option>
              <option value="(GMT-06:00) Central">Central Time (CT)</option>
              <option value="(GMT+01:00) Paris">Paris (CET/CEST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recurrence Pattern and Delivery */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Recurrence Pattern and Delivery</h3>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Recurrence Pattern */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence Pattern</label>
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white"
              >
                <option value="Weeks">Weeks</option>
                <option value="Days">Days</option>
                <option value="Months">Months</option>
              </select>
            </div>

            {/* Recur Every */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recur Every</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-600">{recurrencePattern}</span>
              </div>
            </div>

            {/* Default Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Start Time</label>
              <input
                type="time"
                value={defaultStartTime}
                onChange={(e) => setDefaultStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Days of Week */}
          <div className="mb-6">
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <label key={day.value} className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.value)}
                    onChange={() => toggleDayOfWeek(day.value)}
                    className="w-4 h-4 text-[#3b8169] border-gray-300 rounded focus:ring-[#3b8169] mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Zone Display */}
          <div className="mb-6">
            <span className="text-sm text-gray-600">(GMT+02:00) Sudan</span>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={setSpecificStartTime}
                onChange={(e) => setSetSpecificStartTime(e.target.checked)}
                className="w-4 h-4 text-[#3b8169] border-gray-300 rounded focus:ring-[#3b8169]"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Set specific start time for days</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={startDeliveryOnCompletion}
                onChange={(e) => setStartDeliveryOnCompletion(e.target.checked)}
                className="w-4 h-4 text-[#3b8169] border-gray-300 rounded focus:ring-[#3b8169]"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Start delivery on completion of specific Broadcasts</span>
            </label>
          </div>
        </div>
      </div>

      {/* Target Render Time */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Target Render Time</h3>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-8 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="renderTime"
                value="Pre-Render"
                checked={targetRenderTime === 'Pre-Render'}
                onChange={(e) => setTargetRenderTime(e.target.value)}
                className="w-4 h-4 text-[#3b8169] border-gray-300 focus:ring-[#3b8169]"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Pre-Render</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="renderTime"
                value="Real Time"
                checked={targetRenderTime === 'Real Time'}
                onChange={(e) => setTargetRenderTime(e.target.value)}
                className="w-4 h-4 text-[#3b8169] border-gray-300 focus:ring-[#3b8169]"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Real Time</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="renderTime"
                value="Broadcast Schedule"
                checked={targetRenderTime === 'Broadcast Schedule'}
                onChange={(e) => setTargetRenderTime(e.target.value)}
                className="w-4 h-4 text-[#3b8169] border-gray-300 focus:ring-[#3b8169]"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Broadcast Schedule</span>
            </label>
          </div>

          {targetRenderTime === 'Broadcast Schedule' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start broadcasts</label>
                  <select
                    value={startBroadcastBefore}
                    onChange={(e) => setStartBroadcastBefore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white"
                  >
                    <option value="Before">Before</option>
                    <option value="After">After</option>
                    <option value="At">At</option>
                  </select>
                </div>

                {startBroadcastBefore === 'At' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value="12:00"
                      onChange={(e) => console.log('Time changed:', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent bg-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                    <input
                      type="number"
                      min="0"
                      value={hoursBeforeBroadcast}
                      onChange={(e) => setHoursBeforeBroadcast(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {startBroadcastBefore !== 'At' && (
                <div className="text-right">
                  <span className="text-sm text-gray-600">from broadcast send time</span>
                </div>
              )}
            </div>
          )}

          {/* Time Zone Display for Target Render Time */}
          <div className="mt-4">
            <span className="text-sm text-gray-600">(GMT+02:00) Sudan</span>
          </div>
        </div>
      </div>

      {/* Preview Schedule Button */}
      <div className="text-center">
        <button className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors ${tw.button.primary}`}>
          <Calendar className="w-5 h-5 mr-2" />
          Preview Schedule
        </button>
      </div>

      {/* Validation Warning */}
      {(!scheduling.start_date || scheduling.start_date === '') && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-900">Start Date Required</h4>
              <p className="text-sm text-amber-700 mt-1">
                Please set a start date for your broadcast schedule.
              </p>
            </div>
          </div>
        </div>
      )}

      <StepNavigation
        onNext={handleNext}
        onPrev={onPrev}
        isNextDisabled={!isFormValid}
      />
    </div>
  );
}
