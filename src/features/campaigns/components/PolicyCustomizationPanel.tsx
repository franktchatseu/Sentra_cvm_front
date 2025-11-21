import React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  CommunicationPolicyConfiguration,
  TimeWindowConfig,
  MaximumCommunicationConfig,
  DNDConfig,
  VIPListConfig,
  DNDCategory,
  DND_CATEGORIES,
  DAYS_OF_WEEK,
} from "../types/communicationPolicyConfig";
import { color, tw, components } from "../../../shared/utils/utils";

interface PolicyCustomizationPanelProps {
  policy: CommunicationPolicyConfiguration;
  config: any;
  onConfigChange: (newConfig: any) => void;
}

export default function PolicyCustomizationPanel({
  policy,
  config,
  onConfigChange,
}: PolicyCustomizationPanelProps) {
  const renderTimeWindowCustomization = () => {
    const timeConfig = config as TimeWindowConfig;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
              Start Time
            </label>
            <input
              type="time"
              value={timeConfig.startTime}
              onChange={(e) =>
                onConfigChange({ ...timeConfig, startTime: e.target.value })
              }
              className={`${components.input.default} w-full px-3 py-2`}
            />
          </div>
          <div>
            <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
              End Time
            </label>
            <input
              type="time"
              value={timeConfig.endTime}
              onChange={(e) =>
                onConfigChange({ ...timeConfig, endTime: e.target.value })
              }
              className={`${components.input.default} w-full px-3 py-2`}
            />
          </div>
        </div>
        <div>
          <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
            Days of Week (optional)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <label key={day.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={timeConfig.days?.includes(day.value) || false}
                  onChange={(e) => {
                    const days = timeConfig.days || [];
                    const newDays = e.target.checked
                      ? [...days, day.value]
                      : days.filter((d) => d !== day.value);
                    onConfigChange({ ...timeConfig, days: newDays });
                  }}
                  className={`rounded ${tw.borderDefault} focus:ring-2 focus:ring-[${color.primary.action}] text-[${color.primary.action}]`}
                  style={
                    {
                      accentColor: color.primary.action,
                      "--tw-ring-color": color.primary.action,
                    } as React.CSSProperties
                  }
                />
                <span className={`${tw.caption} ${tw.textSecondary}`}>
                  {day.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMaxCommunicationCustomization = () => {
    const maxConfig = config as MaximumCommunicationConfig;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
              Period Type
            </label>
            <select
              value={maxConfig.type}
              onChange={(e) =>
                onConfigChange({
                  ...maxConfig,
                  type: e.target.value as "daily" | "weekly" | "monthly",
                })
              }
              className={`${components.input.default} w-full px-3 py-2`}
            >
              <option value="daily">Daily Maximum</option>
              <option value="weekly">Weekly Maximum</option>
              <option value="monthly">Monthly Maximum</option>
            </select>
          </div>
          <div>
            <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
              Maximum Count
            </label>
            <input
              type="number"
              min="1"
              value={maxConfig.maxCount}
              onChange={(e) =>
                onConfigChange({
                  ...maxConfig,
                  maxCount: parseInt(e.target.value) || 1,
                })
              }
              className={`${components.input.default} w-full px-3 py-2`}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDNDCustomization = () => {
    const dndConfig = config as DNDConfig;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className={`${tw.body} font-medium ${tw.textPrimary}`}>
            DND Categories
          </h5>
          <button
            type="button"
            onClick={() => {
              const newCategory: DNDCategory = {
                id: Date.now().toString(),
                name: "",
                type: "marketing",
                status: "stop",
              };
              onConfigChange({
                ...dndConfig,
                categories: [...dndConfig.categories, newCategory],
              });
            }}
            className={`${tw.button} flex items-center gap-1 text-xs px-3 py-1`}
          >
            <Plus className="w-3 h-3" />
            Add Category
          </button>
        </div>
        <div className="space-y-3">
          {dndConfig.categories.map((category, index) => (
            <div
              key={category.id}
              className={`p-3 ${tw.borderDefault} border rounded-md`}
            >
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    className={`block ${tw.label} ${tw.textSecondary} mb-1`}
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      const newCategories = [...dndConfig.categories];
                      newCategories[index] = {
                        ...category,
                        name: e.target.value,
                      };
                      onConfigChange({
                        ...dndConfig,
                        categories: newCategories,
                      });
                    }}
                    className={`${components.input.default} w-full px-2 py-1 ${tw.caption}`}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label
                    className={`block ${tw.label} ${tw.textSecondary} mb-1`}
                  >
                    Type
                  </label>
                  <select
                    value={category.type}
                    onChange={(e) => {
                      const newCategories = [...dndConfig.categories];
                      newCategories[index] = {
                        ...category,
                        type: e.target.value as any,
                      };
                      onConfigChange({
                        ...dndConfig,
                        categories: newCategories,
                      });
                    }}
                    className={`${components.input.default} w-full px-2 py-1 ${tw.caption}`}
                  >
                    {DND_CATEGORIES.map((cat) => (
                      <option key={cat.type} value={cat.type}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label
                      className={`block ${tw.label} ${tw.textSecondary} mb-1`}
                    >
                      Status
                    </label>
                    <select
                      value={category.status}
                      onChange={(e) => {
                        const newCategories = [...dndConfig.categories];
                        newCategories[index] = {
                          ...category,
                          status: e.target.value as "stop" | "subscribe",
                        };
                        onConfigChange({
                          ...dndConfig,
                          categories: newCategories,
                        });
                      }}
                      className={`${components.input.default} w-full px-2 py-1 ${tw.caption}`}
                    >
                      <option value="stop">Stop</option>
                      <option value="subscribe">Subscribe</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCategories = dndConfig.categories.filter(
                        (_, i) => i !== index
                      );
                      onConfigChange({
                        ...dndConfig,
                        categories: newCategories,
                      });
                    }}
                    className={`p-1 ${tw.danger} ${tw.statusDanger10} rounded`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {dndConfig.categories.length === 0 && (
            <p className={`${tw.caption} ${tw.textMuted} text-center py-4`}>
              No DND categories configured. Click "Add Category" to get started.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderVIPListCustomization = () => {
    const vipConfig = config as VIPListConfig;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
              Action
            </label>
            <select
              value={vipConfig.action}
              onChange={(e) =>
                onConfigChange({
                  ...vipConfig,
                  action: e.target.value as "include" | "exclude",
                })
              }
              className={`${components.input.default} w-full px-3 py-2`}
            >
              <option value="include">Include VIP List</option>
              <option value="exclude">Exclude VIP List</option>
            </select>
          </div>
          <div>
            <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
              Priority
            </label>
            <input
              type="number"
              min="1"
              value={vipConfig.priority || 1}
              onChange={(e) =>
                onConfigChange({
                  ...vipConfig,
                  priority: parseInt(e.target.value) || 1,
                })
              }
              className={`${components.input.default} w-full px-3 py-2`}
            />
          </div>
        </div>
        <div>
          <p className={`${tw.caption} ${tw.textMuted}`}>
            VIP lists will be managed separately. This configuration defines how
            VIP customers are handled in campaigns.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {policy.type === "timeWindow" && renderTimeWindowCustomization()}
      {policy.type === "maximumCommunication" &&
        renderMaxCommunicationCustomization()}
      {policy.type === "dnd" && renderDNDCustomization()}
      {policy.type === "vipList" && renderVIPListCustomization()}
    </div>
  );
}
