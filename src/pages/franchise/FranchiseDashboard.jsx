import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/apiHelpers";
import StatCard from "../../components/StatCard";
import Button from "../../components/Button";
import { Loader, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import AddCustomerModal from "./AddCustomerModal";
import CheckPointsWidget from "./CheckPointsWidget";
import { Users, Plus, List, Gift } from "lucide-react";

export default function FranchiseDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/customers");
      setCount(res.data.data.length);
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

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="animate-fadeIn">
      {/* Compact mobile-first header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-[var(--text-primary)] sm:text-xl">
            Dashboard
          </h1>
          <p className="truncate text-xs text-[var(--text-muted)]">
            Customers &amp; loyalty points
          </p>
        </div>
        {/* <button
          onClick={() => setAddOpen(true)}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-[var(--amber)] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
        >
          <Plus size={14} />
          <span>Add</span>
        </button> */}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={count}
          accent="navy"
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="amber" onClick={() => navigate("/franchise/customers")}>
              <Plus size={16} />
              Add Customer
            </Button>
            <Button variant="outline" onClick={() => navigate("/franchise/customers")}>
              <List size={16} />
              View Customers
            </Button>
            <Button variant="outline" onClick={() => navigate("/franchise/rewards")}>
              <Gift size={16} />
              Rewards
            </Button>
          </div>
        </div>
      </div>

      <CheckPointsWidget onContactAdded={() => showToast("Saved to contacts")} />

      <AddCustomerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={load}
      />

      <Toast {...toast} onClose={closeToast} />
    </div>
  );
}
