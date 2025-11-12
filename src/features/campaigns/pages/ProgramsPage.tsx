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
  Database,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Eye,
  Filter,
} from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { programService } from "../services/programService";
import { Program } from "../types/program";
import ProgramModal from "../components/ProgramModal";

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
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    inactive: number;
    total_budget: number;
    spent_budget: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [filters, setFilters] = useState<{
    is_active?: boolean | "all";
    program_type?: string;
    created_by?: number;
    start_date_from?: string;
    start_date_to?: string;
    end_date_from?: string;
    end_date_to?: string;
    budget_min?: number;
    budget_max?: number;
  }>({});

  useEffect(() => {
    loadPrograms(true); // Always skip cache to get fresh data
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await programService.getProgramStats(true);
      if (response && typeof response === "object" && "data" in response) {
        const data = (response as any).data;
        // Parse string values from API response
        const total = parseInt(String(data.total_programs || 0), 10) || 0;
        const active = parseInt(String(data.active_programs || 0), 10) || 0;
        const totalBudget =
          parseFloat(String(data.total_budget_allocated || 0)) || 0;
        const spentBudget =
          parseFloat(String(data.total_budget_spent || 0)) || 0;

        setStats({
          total,
          active,
          inactive: total - active, // Calculate inactive from total - active
          total_budget: totalBudget,
          spent_budget: spentBudget,
        });
      }
    } catch (err) {
      console.error("Failed to load program stats:", err);
      // Fallback: calculate from programs
      const active = programs.filter((p) => p.is_active).length;
      const inactive = programs.filter((p) => !p.is_active).length;
      const totalBudget = programs.reduce(
        (sum, p) => sum + (parseFloat(String(p.budget_total || 0)) || 0),
        0
      );
      const spentBudget = programs.reduce(
        (sum, p) => sum + (parseFloat(String(p.budget_spent || 0)) || 0),
        0
      );
      setStats({
        total: programs.length,
        active,
        inactive,
        total_budget: totalBudget,
        spent_budget: spentBudget,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPrograms = async (skipCache = false) => {
    try {
      setLoading(true);
      // Check if we have any filters applied
      const hasFilters =
        Object.keys(filters).length > 0 &&
        Object.values(filters).some(
          (v) => v !== undefined && v !== "" && v !== "all"
        );

      // Check if only budget filters are applied
      const hasBudgetFilters = filters.budget_min || filters.budget_max;
      const hasOtherFilters =
        filters.is_active !== undefined &&
        filters.is_active !== "all" &&
        filters.is_active !== "" &&
        filters.is_active !== null;
      const hasOtherFilters2 =
        filters.program_type ||
        filters.created_by ||
        filters.start_date_from ||
        filters.start_date_to ||
        filters.end_date_from ||
        filters.end_date_to ||
        searchTerm;

      let response;
      if (hasBudgetFilters && !hasOtherFilters && !hasOtherFilters2) {
        // Use budget range endpoint if only budget filters are applied
        response = await programService.getProgramsByBudgetRange({
          budget_min: filters.budget_min,
          budget_max: filters.budget_max,
          limit: 100,
          offset: 0,
          skipCache: skipCache,
        });
      } else if (hasFilters || searchTerm) {
        // Use advanced search if filters or search term exist (without budget filters)
        response = await programService.advancedSearchPrograms({
          name: searchTerm || undefined,
          is_active:
            filters.is_active === "all"
              ? undefined
              : (filters.is_active as boolean | undefined),
          program_type: filters.program_type || undefined,
          created_by: filters.created_by || undefined,
          start_date_from: filters.start_date_from || undefined,
          start_date_to: filters.start_date_to || undefined,
          end_date_from: filters.end_date_from || undefined,
          end_date_to: filters.end_date_to || undefined,
          // Note: budget_min and budget_max are not supported by advancedSearchPrograms
          limit: 100,
          offset: 0,
          skipCache: skipCache,
        });
        // If budget filters are also applied, filter the results client-side
        if (hasBudgetFilters && response.data) {
          let filtered = response.data;
          if (filters.budget_min) {
            filtered = filtered.filter(
              (p) =>
                p.budget_total &&
                parseFloat(p.budget_total) >= (filters.budget_min as number)
            );
          }
          if (filters.budget_max) {
            filtered = filtered.filter(
              (p) =>
                p.budget_total &&
                parseFloat(p.budget_total) <= (filters.budget_max as number)
            );
          }
          response.data = filtered;
        }
      } else {
        // Use regular getAllPrograms if no filters
        response = await programService.getAllPrograms({
          limit: 100,
          offset: 0,
          skipCache: skipCache,
        });
      }
      setPrograms(response.data || []);
    } catch (err) {
      console.error("Failed to load programs:", err);
      showError("Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowAdvancedFilters(false);
      setIsClosingModal(false);
    }, 300);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handleCreateProgram = () => {
    setEditingProgram(undefined);
    setIsModalOpen(true);
  };

  const handleViewProgram = (program: Program) => {
    navigate(`/dashboard/programs/${program.id}`);
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
      await loadStats();
    } catch (err) {
      console.error("Failed to delete program:", err);
      showError("Failed to delete program", "Please try again later.");
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
      await loadStats();
    } catch (err) {
      console.error("Error toggling program status:", err);
      showError("Failed to toggle program status", "Please try again later.");
    }
  };

  const handleProgramSaved = async (programData: {
    name: string;
    code: string;
    description?: string;
    budget_total?: number;
    start_date?: string | null;
    end_date?: string | null;
  }) => {
    try {
      setIsSaving(true);
      // TODO: Get actual user ID from auth context
      const userId = 1;

      if (editingProgram) {
        // Check if dates changed
        const datesChanged =
          (programData.start_date !== undefined &&
            programData.start_date !==
              (editingProgram.start_date
                ? new Date(editingProgram.start_date)
                    .toISOString()
                    .split("T")[0]
                : "")) ||
          (programData.end_date !== undefined &&
            programData.end_date !==
              (editingProgram.end_date
                ? new Date(editingProgram.end_date).toISOString().split("T")[0]
                : ""));

        // Update existing program
        await programService.updateProgram(Number(editingProgram.id), {
          name: programData.name,
          code: programData.code,
          description: programData.description,
          budget_total: programData.budget_total,
          updated_by: userId,
        });

        // Update dates separately if they changed
        if (datesChanged) {
          await programService.updateProgramDates(Number(editingProgram.id), {
            start_date: programData.start_date || null,
            end_date: programData.end_date || null,
            updated_by: userId,
          });
        }

        showToast("Program updated successfully!");
      } else {
        // Create new program
        await programService.createProgram({
          name: programData.name,
          code: programData.code,
          description: programData.description,
          budget_total: programData.budget_total,
          start_date: programData.start_date || null,
          created_by: userId,
        });
        showToast("Program created successfully!");
      }
      setIsModalOpen(false);
      setEditingProgram(undefined);
      await loadPrograms(true); // Skip cache to get fresh data
      await loadStats(); // Reload stats after creating/updating
    } catch (err) {
      console.error("Failed to save program:", err);
      showError("Failed to save program", "Please try again later.");
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

  const programStatsCards = [
    {
      name: "Total Programs",
      value: statsLoading ? "..." : (stats?.total || 0).toLocaleString(),
      icon: Database,
      color: color.tertiary.tag1,
    },
    {
      name: "Active Programs",
      value: statsLoading ? "..." : (stats?.active || 0).toLocaleString(),
      icon: CheckCircle,
      color: color.tertiary.tag4,
    },
    {
      name: "Total Budget",
      value: statsLoading
        ? "..."
        : `$${(stats?.total_budget || 0).toLocaleString()}`,
      icon: DollarSign,
      color: color.tertiary.tag2,
    },
    {
      name: "Budget Spent",
      value: statsLoading
        ? "..."
        : `$${(stats?.spent_budget || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: color.tertiary.tag3,
    },
  ];

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
            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm text-white"
            style={{ backgroundColor: color.primary.action }}
          >
            <Plus className="w-4 h-4" />
            Create Program
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {programStatsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: stat.color }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-black">
                        {stat.value}
                      </p>
                      <p className={`${tw.cardSubHeading} ${tw.textSecondary}`}>
                        {stat.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-5">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
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
          <button
            onClick={() => setShowAdvancedFilters(true)}
            className={`flex items-center justify-center px-4 py-2 rounded-lg bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap sm:w-auto w-full`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
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
                className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto text-sm text-white"
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
                        <div className={`text-sm ${tw.textSecondary}`}>
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
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{
                            backgroundColor: color.primary.accent,
                          }}
                        >
                          {program.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewProgram(program)}
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
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                        <div className={`text-xs ${tw.textMuted} mb-2`}>
                          {program.code}
                        </div>
                        <div className={`text-sm ${tw.textSecondary} mb-2`}>
                          {program.description || "No description"}
                        </div>
                      </div>
                      <span
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{
                          backgroundColor: color.primary.accent,
                        }}
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
                        onClick={() => handleViewProgram(program)}
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
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* Advanced Filters Side Panel */}
      {(showAdvancedFilters || isClosingModal) &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] overflow-hidden ${
              isClosingModal
                ? "animate-out fade-out duration-300"
                : "animate-in fade-in duration-300"
            }`}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={handleCloseModal}
            ></div>
            <div
              className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                isClosingModal ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className={`p-6 border-b ${tw.borderDefault}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`${tw.subHeading} ${tw.textPrimary}`}>
                    Filter Programs
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className={`p-2 ${tw.textMuted} rounded-lg transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Status Filter */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Status" },
                      { value: true, label: "Active" },
                      { value: false, label: "Inactive" },
                    ].map((option) => (
                      <label
                        key={String(option.value)}
                        className="flex items-center"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={String(option.value)}
                          checked={filters.is_active === option.value}
                          onChange={() =>
                            handleFilterChange(
                              "is_active",
                              option.value === "all" ? "all" : option.value
                            )
                          }
                          className={`mr-3 text-[${color.primary.action}] focus:ring-[${color.primary.action}]`}
                        />
                        <span className={`text-sm ${tw.textSecondary}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Program Type Filter */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Program Type
                  </label>
                  <input
                    type="text"
                    value={filters.program_type || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "program_type",
                        e.target.value || undefined
                      )
                    }
                    placeholder="Enter program type"
                    className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                  />
                </div>

                {/* Creator Filter */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Created By (User ID)
                  </label>
                  <input
                    type="number"
                    value={filters.created_by || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "created_by",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Enter user ID"
                    className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                  />
                </div>

                {/* Start Date Range */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Start Date Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.start_date_from || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "start_date_from",
                          e.target.value || undefined
                        )
                      }
                      className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                    />
                    <input
                      type="date"
                      value={filters.start_date_to || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "start_date_to",
                          e.target.value || undefined
                        )
                      }
                      placeholder="To"
                      className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                    />
                  </div>
                </div>

                {/* End Date Range */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    End Date Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.end_date_from || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "end_date_from",
                          e.target.value || undefined
                        )
                      }
                      className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                    />
                    <input
                      type="date"
                      value={filters.end_date_to || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "end_date_to",
                          e.target.value || undefined
                        )
                      }
                      placeholder="To"
                      className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                    />
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Budget Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={filters.budget_min || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "budget_min",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Min Budget"
                      className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                    />
                    <input
                      type="number"
                      value={filters.budget_max || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "budget_max",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Max Budget"
                      className={`w-full px-3 py-2 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClearFilters}
                    className={`flex-1 px-4 py-2 text-sm border border-gray-300 ${tw.textSecondary} rounded-lg transition-colors`}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      loadPrograms(true);
                      handleCloseModal();
                    }}
                    className={`${tw.button} flex-1 px-4 py-2 text-sm`}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
