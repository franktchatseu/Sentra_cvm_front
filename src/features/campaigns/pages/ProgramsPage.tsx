import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  Power,
  PowerOff,
} from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { programService } from "../services/programService";
import { Program } from "../types/program";

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program?: Program;
  onSave: (program: {
    name: string;
    code: string;
    description?: string;
    budget_total?: number;
  }) => Promise<void>;
  isSaving?: boolean;
}

function ProgramModal({
  isOpen,
  onClose,
  program,
  onSave,
  isSaving = false,
}: ProgramModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    budget_total: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        code: program.code,
        description: program.description || "",
        budget_total: program.budget_total || "",
      });
    } else {
      setFormData({ name: "", code: "", description: "", budget_total: "" });
    }
    setError("");
  }, [program, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Program name is required");
      return;
    }

    if (!formData.code.trim()) {
      setError("Program code is required");
      return;
    }

    if (formData.name.length > 128) {
      setError("Program name must be 128 characters or less");
      return;
    }

    setError("");

    const programData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      description: formData.description.trim() || undefined,
      budget_total: formData.budget_total
        ? parseFloat(formData.budget_total)
        : undefined,
    };

    await onSave(programData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {program ? "Edit Program" : "Create New Program"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter program name"
                maxLength={128}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter program code (e.g., PROG-Q4-2024)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Total
              </label>
              <input
                type="number"
                value={formData.budget_total}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    budget_total: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter program description"
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    color.interactive.hover;
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  color.primary.action;
              }}
            >
              {isSaving
                ? "Saving..."
                : program
                ? "Update Program"
                : "Create Program"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function ProgramsPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success: showToast, error: showError } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPrograms(true); // Always skip cache to get fresh data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const loadPrograms = async (skipCache = false) => {
    try {
      setLoading(true);
      const response = await programService.getAllPrograms({
        limit: 100,
        offset: 0,
        skipCache: skipCache,
      });
      setPrograms(response.data || []);
    } catch (err) {
      console.error("Failed to load programs:", err);
      showError("Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = () => {
    setEditingProgram(undefined);
    setIsModalOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleDeleteProgram = async (program: Program) => {
    const confirmed = await confirm({
      title: "Delete Program",
      message: `Are you sure you want to delete "${program.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await programService.deleteProgram(Number(program.id));
      showToast(`Program "${program.name}" deleted successfully!`);
      await loadPrograms(true);
    } catch (err) {
      console.error("Error deleting program:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete program";
      showError(errorMessage);
    }
  };

  const handleToggleActive = async (program: Program) => {
    try {
      // TODO: Get actual user ID from auth context
      const userId = 1;

      if (program.is_active) {
        await programService.deactivateProgram(Number(program.id), userId);
        showToast(`Program "${program.name}" deactivated successfully!`);
      } else {
        await programService.activateProgram(Number(program.id), userId);
        showToast(`Program "${program.name}" activated successfully!`);
      }

      await loadPrograms(true);
    } catch (err) {
      console.error("Error toggling program status:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle program status";
      showError(errorMessage);
    }
  };

  const handleProgramSaved = async (programData: {
    name: string;
    code: string;
    description?: string;
    budget_total?: number;
  }) => {
    try {
      setIsSaving(true);
      // TODO: Get actual user ID from auth context
      const userId = 1;

      if (editingProgram) {
        // Update existing program
        await programService.updateProgram(Number(editingProgram.id), {
          ...programData,
          updated_by: userId,
        });
        showToast("Program updated successfully!");
      } else {
        // Create new program
        await programService.createProgram({
          ...programData,
          created_by: userId,
        });
        showToast("Program created successfully!");
      }
      setIsModalOpen(false);
      setEditingProgram(undefined);
      await loadPrograms(true); // Skip cache to get fresh data
    } catch (err) {
      console.error("Failed to save program:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save program";
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPrograms = (programs || []).filter(
    (program) =>
      program?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program?.description &&
        program.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/campaigns")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>Programs</h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              Organize campaigns into programs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateProgram}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
            style={{ backgroundColor: color.primary.action }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                color.interactive.hover;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                color.primary.action;
            }}
          >
            <Plus className="w-4 h-4" />
            Create Program
          </button>
        </div>
      </div>

      <div className={`bg-white my-5`}>
        <div className="relative w-full">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.text.muted}]`}
          />
          <input
            type="text"
            placeholder="Search programs by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm border border-[${color.border.default}] rounded-lg focus:outline-none`}
          />
        </div>
      </div>

      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] overflow-hidden`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner
              variant="modern"
              size="lg"
              color="primary"
              className="mr-3"
            />
            <span className={`${tw.textSecondary}`}>Loading programs...</span>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <h3 className={`${tw.cardHeading} ${tw.textPrimary} mb-1`}>
              {searchTerm ? "No programs found" : "No programs yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Create your first program to get started."}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateProgram}
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                style={{ backgroundColor: color.primary.action }}
              >
                <Plus className="w-4 h-4" />
                Create Program
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${tw.borderDefault}`}
                  style={{ background: color.surface.tableHeader }}
                >
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Program
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Code
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Budget
                    </th>
                    <th
                      className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPrograms.map((program) => (
                    <tr
                      key={program.id}
                      className="hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div
                              className={`text-base font-semibold ${tw.textPrimary}`}
                            >
                              {program.name}
                            </div>
                            <div className={`text-sm ${tw.textMuted}`}>
                              {program.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm font-mono ${tw.textSecondary}`}
                        >
                          {program.code}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${tw.textPrimary}`}>
                          {program.budget_total
                            ? `$${parseFloat(
                                program.budget_total
                              ).toLocaleString()}`
                            : "-"}
                        </div>
                        {program.budget_spent && (
                          <div className={`text-xs ${tw.textMuted}`}>
                            Spent: $
                            {parseFloat(program.budget_spent).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            program.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {program.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleActive(program)}
                            className={`p-2 rounded-lg transition-colors ${
                              program.is_active
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              program.is_active ? "Deactivate" : "Activate"
                            }
                          >
                            {program.is_active ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditProgram(program)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.primary.action,
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = `${color.primary.action}10`;
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "transparent";
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(program)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className={`text-base font-semibold ${tw.textPrimary} mb-1`}
                        >
                          {program.name}
                        </div>
                        <div
                          className={`text-xs font-mono ${tw.textMuted} mb-2`}
                        >
                          {program.code}
                        </div>
                        <div className={`text-sm ${tw.textSecondary} mb-2`}>
                          {program.description || "No description"}
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          program.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {program.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {program.budget_total && (
                      <div className={`text-sm ${tw.textPrimary}`}>
                        Budget: $
                        {parseFloat(program.budget_total).toLocaleString()}
                        {program.budget_spent && (
                          <span className={`text-xs ${tw.textMuted} ml-2`}>
                            (Spent: $
                            {parseFloat(program.budget_spent).toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                      <button
                        onClick={() => handleToggleActive(program)}
                        className={`p-2 rounded-lg transition-colors ${
                          program.is_active
                            ? "text-orange-600 hover:bg-orange-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={program.is_active ? "Deactivate" : "Activate"}
                      >
                        {program.is_active ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditProgram(program)}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          color: color.primary.action,
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.target as HTMLButtonElement
                          ).style.backgroundColor = `${color.primary.action}10`;
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.target as HTMLButtonElement
                          ).style.backgroundColor = "transparent";
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ProgramModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProgram(undefined);
        }}
        program={editingProgram}
        onSave={handleProgramSaved}
        isSaving={isSaving}
      />
    </div>
  );
}
