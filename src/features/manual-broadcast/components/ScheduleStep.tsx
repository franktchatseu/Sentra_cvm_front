import { useState } from "react";
import { Calendar, Clock, Send, AlertCircle } from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { ManualBroadcastData } from "../pages/CreateManualBroadcastPage";

interface ScheduleStepProps {
  data: ManualBroadcastData;
  onUpdate: (data: Partial<ManualBroadcastData>) => void;
  onSubmit: () => void;
  onPrevious: () => void;
}

export default function ScheduleStep({
  data,
  onUpdate,
  onSubmit,
  onPrevious,
}: ScheduleStepProps) {
  const [scheduleType, setScheduleType] = useState<"now" | "later">(
    data.scheduleType || "now"
  );
  const [scheduleDate, setScheduleDate] = useState(data.scheduleDate || "");
  const [scheduleTime, setScheduleTime] = useState(data.scheduleTime || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // Validation
    if (scheduleType === "later") {
      if (!scheduleDate) {
        setError("Please select a date");
        return;
      }
      if (!scheduleTime) {
        setError("Please select a time");
        return;
      }

      // Check if scheduled time is in the future
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      const now = new Date();
      if (scheduledDateTime <= now) {
        setError("Please select a future date and time");
        return;
      }
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Update data
      onUpdate({
        scheduleType: scheduleType,
        scheduleDate: scheduleDate,
        scheduleTime: scheduleTime,
      });

      // Submit
      await onSubmit();
    } catch (err) {
      console.error("Failed to submit:", err);
      setError("Failed to create broadcast. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get minimum time (current time if today is selected)
  const getMinTime = () => {
    if (scheduleDate === getMinDate()) {
      const now = new Date();
      return now.toTimeString().slice(0, 5);
    }
    return "";
  };

  return (
    <div className="bg-white rounded-md shadow-sm border" style={{ borderColor: color.border.default }}>
      <div className="p-6 border-b" style={{ borderColor: color.border.default }}>
        <h2 className={`text-xl font-semibold ${tw.textPrimary}`}>Schedule Broadcast</h2>
        <p className={`text-sm ${tw.textSecondary} mt-1`}>
          Choose when to launch your broadcast
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Schedule Type Selection */}
        <div>
          <label className={`block text-sm font-medium ${tw.textPrimary} mb-3`}>
            When do you want to send this broadcast? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Send Now */}
            <button
              type="button"
              onClick={() => setScheduleType("now")}
              disabled={isSubmitting}
              className="flex items-start gap-4 p-4 rounded-md border-2 transition-all text-left"
              style={{
                borderColor:
                  scheduleType === "now"
                    ? color.primary.accent
                    : color.border.default,
                backgroundColor:
                  scheduleType === "now"
                    ? `${color.primary.accent}10`
                    : "white",
                opacity: isSubmitting ? 0.5 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor:
                    scheduleType === "now"
                      ? color.primary.accent
                      : color.surface.cards,
                }}
              >
                <Send
                  className="w-6 h-6"
                  style={{
                    color:
                      scheduleType === "now" ? "white" : color.text.secondary,
                  }}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`text-base font-semibold ${
                    scheduleType === "now" ? tw.textPrimary : tw.textSecondary
                  }`}
                >
                  Send Now
                </p>
                <p className={`text-sm ${tw.textMuted} mt-1`}>
                  Send the broadcast immediately to all recipients
                </p>
              </div>
              {scheduleType === "now" && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color.primary.accent }}
                />
              )}
            </button>

            {/* Schedule for Later */}
            <button
              type="button"
              onClick={() => setScheduleType("later")}
              disabled={isSubmitting}
              className="flex items-start gap-4 p-4 rounded-md border-2 transition-all text-left"
              style={{
                borderColor:
                  scheduleType === "later"
                    ? color.primary.accent
                    : color.border.default,
                backgroundColor:
                  scheduleType === "later"
                    ? `${color.primary.accent}10`
                    : "white",
                opacity: isSubmitting ? 0.5 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor:
                    scheduleType === "later"
                      ? color.primary.accent
                      : color.surface.cards,
                }}
              >
                <Calendar
                  className="w-6 h-6"
                  style={{
                    color:
                      scheduleType === "later"
                        ? "white"
                        : color.text.secondary,
                  }}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`text-base font-semibold ${
                    scheduleType === "later"
                      ? tw.textPrimary
                      : tw.textSecondary
                  }`}
                >
                  Schedule for Later
                </p>
                <p className={`text-sm ${tw.textMuted} mt-1`}>
                  Choose a specific date and time for sending
                </p>
              </div>
              {scheduleType === "later" && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color.primary.accent }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Schedule Date & Time (only show if "later" is selected) */}
        {scheduleType === "later" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: color.text.muted }}
                />
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                  style={{
                    borderColor: color.border.default,
                    color: color.text.primary,
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                Time *
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: color.text.muted }}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  min={scheduleDate === getMinDate() ? getMinTime() : ""}
                  className="w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                  style={{
                    borderColor: color.border.default,
                    color: color.text.primary,
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div
          className="p-4 rounded-md"
          style={{ backgroundColor: `${color.primary.accent}10` }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: color.primary.accent }}
          >
            Broadcast Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={tw.textSecondary}>Audience:</span>
              <span className={`font-medium ${tw.textPrimary}`}>
                {data.audienceName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={tw.textSecondary}>Recipients:</span>
              <span className={`font-medium ${tw.textPrimary}`}>
                {data.rowCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={tw.textSecondary}>Channel:</span>
              <span className={`font-medium ${tw.textPrimary}`}>
                {data.channel || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={tw.textSecondary}>Schedule:</span>
              <span className={`font-medium ${tw.textPrimary}`}>
                {scheduleType === "now"
                  ? "Send immediately"
                  : scheduleDate && scheduleTime
                  ? `${new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}`
                  : "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-md flex items-start space-x-2"
            style={{
              backgroundColor: `${color.status.danger}10`,
              border: `1px solid ${color.status.danger}30`,
            }}
          >
            <AlertCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: color.status.danger }}
            />
            <p className="text-sm" style={{ color: color.status.danger }}>
              {error}
            </p>
          </div>
        )}

        {/* Warning Message */}
        <div
          className="p-3 rounded-md flex items-start space-x-2"
          style={{
            backgroundColor: `${color.status.warning}10`,
            border: `1px solid ${color.status.warning}30`,
          }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: color.status.warning }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: color.status.warning }}>
              Ready to launch?
            </p>
            <p className={`text-xs ${tw.textMuted} mt-1`}>
              Once you click "Launch Broadcast", the message will be{" "}
              {scheduleType === "now" ? "sent immediately" : "scheduled"} and cannot be
              cancelled. Please review all details carefully.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-6 border-t flex items-center justify-between"
        style={{ borderColor: color.border.default }}
      >
        <button
          onClick={onPrevious}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-md transition-all text-sm font-semibold disabled:opacity-50"
          style={{
            backgroundColor: color.surface.cards,
            border: `1px solid ${color.border.default}`,
            color: color.text.primary,
          }}
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (scheduleType === "later" && (!scheduleDate || !scheduleTime))
          }
          className="px-8 py-2.5 text-white rounded-md transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: color.primary.action }}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Launch Broadcast
            </>
          )}
        </button>
      </div>
    </div>
  );
}
