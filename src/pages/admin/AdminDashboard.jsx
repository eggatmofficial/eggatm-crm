import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPatch, apiDownload } from "../../api/apiHelpers";
import StatCard from "../../components/StatCard";
import Button from "../../components/Button";
import { Loader, EmptyState, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import CreateFranchiseModal from "./CreateFranchiseModal";
import EditFranchiseModal from "./EditFranchiseModal";
import { apiDelete } from "../../api/apiHelpers";
import {
  Building2,
  Users,
  Plus,
  Download,
  ChevronRight,
  Check,
  Pencil,
  Trash,
  Power
} from "lucide-react";

function EditableConfigCell({ franchise, field, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(franchise[field]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await apiPatch(`/franchise/${franchise.franchiseId}/rewards-config`, {
        [field]: Number(value),
      });
      onSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
      >
        {value}
        <Pencil size={12} className="text-slate-400" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-[var(--amber)]"
      />
      <button
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
      >
        <Check size={14} />
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFranchiseId, setEditingFranchiseId] = useState(null);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/franchise/customers/summary");
      setData(res.data.data);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load dashboard",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadAll = async () => {
    setExportingAll(true);
    try {
      await apiDownload(
        "/franchise/customers/export",
        `all-franchises-customers-${Date.now()}.xlsx`
      );
    } catch {
      showToast("Excel export failed", "error");
    } finally {
      setExportingAll(false);
    }
  };

  const downloadOne = async (f) => {
    setExportingId(f.franchiseId);
    try {
      await apiDownload(
        `/franchise/customers/export?franchiseId=${f.franchiseId}`,
        `${f.name || "franchise"}-customers.xlsx`
      );
    } catch {
      showToast("Excel export failed", "error");
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this franchise?")) return;
    try {
      await apiDelete(`/franchise/${id}`);
      showToast("Franchise deleted successfully");
      load();
    } catch {
      showToast("Could not delete franchise", "error");
    }
  };

  const handleToggleStatus = async (f) => {
    try {
      await apiPatch(`/franchise/${f.franchiseId}/status`, { isActive: !f.isActive });
      showToast("Franchise status updated");
      load();
    } catch {
      showToast("Could not update status", "error");
    }
  };

  if (loading) return <Loader label="Loading dashboard..." />;

  const franchises = data?.franchises || [];

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Franchises, customer counts &amp; loyalty configuration
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" loading={exportingAll} onClick={downloadAll}>
            <Download size={16} />
            Download All (Excel)
          </Button>
          <Button variant="amber" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Create Franchise
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard
          icon={Building2}
          label="Total Franchises"
          value={data?.totalFranchises ?? 0}
          accent="navy"
        />
        <StatCard
          icon={Users}
          label="Total Customers (All Franchises)"
          value={data?.totalCustomers ?? 0}
          accent="amber"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-800">
            Franchise-wise Customer Count
          </h2>
        </div>

        {franchises.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No franchises yet"
            subtitle="Create your first franchise to get started"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Franchise</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Customers</th>
                  <th className="px-6 py-3 font-medium">₹ / Point(Amount)</th>
                  <th className="px-6 py-3 font-medium">Reward at</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {franchises.map((f) => (
                  <tr key={f.franchiseId} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => navigate(`/admin/franchises/${f.franchiseId}`)}
                        className="flex items-center gap-2 font-medium text-amber-700 hover:underline dark:text-[var(--amber)]"
                      >
                        {f.name}
                        <ChevronRight size={14} className="text-slate-400" />
                      </button>
                      <p className="text-xs text-slate-400">{f.franchiseCode}</p>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{f.phone || "—"}</td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-[var(--amber)]/15 dark:text-[var(--amber)]">
                        {f.customerCount}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <EditableConfigCell
                        franchise={f}
                        field="pointsPerAmount"
                        onSaved={load}
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <EditableConfigCell
                        franchise={f}
                        field="rewardThreshold"
                        onSaved={load}
                      />
                      <span className="ml-1 text-xs text-slate-400">pts</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* <Button
                          variant="ghost"
                          className="!p-1.5"
                          onClick={() => handleToggleStatus(f)}
                          title={f.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power size={14} className={f.isActive ? "text-emerald-500" : "text-rose-500"} />
                        </Button> */}
                        <Button
                          variant="ghost"
                          className="!p-1.5"
                          onClick={() => {
                            setEditingFranchiseId(f.franchiseId);
                            setEditModalOpen(true);
                          }}
                        >
                          <Pencil size={14} className="text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="!p-1.5"
                          onClick={() => handleDelete(f.franchiseId)}
                        >
                          <Trash size={14} className="text-rose-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-3 !py-1.5 ml-2"
                          loading={exportingId === f.franchiseId}
                          onClick={() => downloadOne(f)}
                        >
                          <Download size={14} />
                          Excel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateFranchiseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          showToast("Franchise created successfully");
          load();
        }}
      />

      <EditFranchiseModal
        open={editModalOpen}
        franchiseId={editingFranchiseId}
        onClose={() => setEditModalOpen(false)}
        onUpdated={() => {
          showToast("Franchise updated successfully");
          load();
        }}
      />

      <Toast {...toast} onClose={closeToast} />
    </div>
  );
}
