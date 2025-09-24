import { useState } from 'react';
import { ArrowRight, ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';
import { CreateCampaignRequest, CampaignScheduling } from '../../../types/campaign';

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

  const [recurrencePattern, setRecurrencePattern] = useState('Weeks');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [defaultStartTime, setDefaultStartTime] = useState('08:00 AM');
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

  const isFormValid = scheduling.start_date && scheduling.time_zone;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scheduling & Calendar Configuration</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure when and how your campaign will be delivered to customers
        </p>
      </div>

      {/* Campaign Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: 'immediate', label: 'Immediate', description: 'Send immediately after approval', icon: Zap },
            { value: 'scheduled', label: 'Scheduled', description: 'Send at specific date/time', icon: Calendar },
            { value: 'recurring', label: 'Recurring', description: 'Repeat on schedule', icon: Clock },
            { value: 'trigger_based', label: 'Trigger-based', description: 'Send based on events', icon: Settings }
          ].map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => updateScheduling({ type: type.value as CampaignScheduling['type'] })}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  scheduling.type === type.value
                    ? 'border-[#3b8169] bg-[#3b8169]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-6 h-6 text-[#3b8169] mb-2" />
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-500 mt-1">{type.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Scheduling Configuration */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone *
            </label>
            <select
              value={scheduling.time_zone}
              onChange={(e) => updateScheduling({ time_zone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
            >
              {timeZones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date (for scheduled campaigns) */}
          {scheduling.type === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={scheduling.start_date || ''}
                onChange={(e) => updateScheduling({ start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
          )}

          {/* End Date (for scheduled/recurring campaigns) */}
          {(scheduling.type === 'scheduled' || scheduling.type === 'recurring') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                value={scheduling.end_date || ''}
                onChange={(e) => updateScheduling({ end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Recurring Campaign Settings */}
      {scheduling.type === 'recurring' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Recurring Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency Type
              </label>
              <select
                value={scheduling.frequency?.type || 'weekly'}
                onChange={(e) => updateScheduling({
                  frequency: {
                    type: e.target.value as 'daily' | 'weekly' | 'monthly',
                    interval: scheduling.frequency?.interval || 1,
                    days_of_week: scheduling.frequency?.days_of_week,
                    days_of_month: scheduling.frequency?.days_of_month
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interval
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={scheduling.frequency?.interval || 1}
                onChange={(e) => updateScheduling({
                  frequency: {
                    type: scheduling.frequency?.type || 'weekly',
                    interval: Number(e.target.value),
                    days_of_week: scheduling.frequency?.days_of_week,
                    days_of_month: scheduling.frequency?.days_of_month
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Every {scheduling.frequency?.interval || 1} {scheduling.frequency?.type || 'week'}(s)
              </p>
            </div>
          </div>

          {/* Days of Week (for weekly frequency) */}
          {scheduling.frequency?.type === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scheduling.frequency?.days_of_week?.includes(day.value)
                        ? 'bg-[#3b8169] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivery Times */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Times</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {deliveryTimes.map((time) => (
            <button
              key={time}
              onClick={() => toggleDeliveryTime(time)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scheduling.delivery_times?.includes(time)
                  ? 'bg-[#3b8169] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Selected times: {scheduling.delivery_times?.length || 0} 
          {scheduling.delivery_times?.length ? ` (${scheduling.delivery_times.join(', ')})` : ''}
        </p>
      </div>

      {/* Frequency Capping */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Frequency Capping</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max per Day
              </label>
              <input
                type="number"
                min="1"
                value={scheduling.frequency_capping?.max_per_day || 1}
                onChange={(e) => updateScheduling({
                  frequency_capping: {
                    ...scheduling.frequency_capping,
                    max_per_day: Number(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max per Week
              </label>
              <input
                type="number"
                min="1"
                value={scheduling.frequency_capping?.max_per_week || 3}
                onChange={(e) => updateScheduling({
                  frequency_capping: {
                    ...scheduling.frequency_capping,
                    max_per_week: Number(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max per Month
              </label>
              <input
                type="number"
                min="1"
                value={scheduling.frequency_capping?.max_per_month || 10}
                onChange={(e) => updateScheduling({
                  frequency_capping: {
                    ...scheduling.frequency_capping,
                    max_per_month: Number(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Throttling Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Throttling Settings</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Sends per Hour
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={scheduling.throttling?.max_per_hour || 1000}
                onChange={(e) => updateScheduling({
                  throttling: {
                    max_per_hour: Number(e.target.value),
                    max_per_day: scheduling.throttling?.max_per_day || 10000
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Sends per Day
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={scheduling.throttling?.max_per_day || 10000}
                onChange={(e) => updateScheduling({
                  throttling: {
                    max_per_hour: scheduling.throttling?.max_per_hour || 1000,
                    max_per_day: Number(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Throttling helps prevent system overload and ensures smooth delivery
          </p>
        </div>
      </div>

      {/* Blackout Windows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Blackout Windows</h3>
          <button
            onClick={addBlackoutWindow}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Add Blackout Period
          </button>
        </div>

        {blackoutWindows.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">No blackout periods configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blackoutWindows.map((window) => (
              <div key={window.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={window.name}
                      onChange={(e) => updateBlackoutWindow(window.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={window.start_date}
                      onChange={(e) => updateBlackoutWindow(window.id, { start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={window.end_date}
                      onChange={(e) => updateBlackoutWindow(window.id, { end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeBlackoutWindow(window.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={window.reason || ''}
                    onChange={(e) => updateBlackoutWindow(window.id, { reason: e.target.value })}
                    placeholder="e.g., Holiday period, Maintenance window"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Warning */}
      {scheduling.type === 'scheduled' && !scheduling.start_date && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-900">Start Date Required</h4>
              <p className="text-sm text-amber-700 mt-1">
                Please set a start date for your scheduled campaign.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            isFormValid
              ? 'bg-gradient-to-r from-[#3b8169] to-[#2d5f4e] text-white hover:shadow-lg hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next Step
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
