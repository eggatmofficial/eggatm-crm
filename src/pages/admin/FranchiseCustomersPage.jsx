import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../../api/apiHelpers";
import Button from "../../components/Button";
import { Loader, EmptyState, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import { ArrowLeft, Phone, Download, Users, Clock } from "lucide-react";
import {
  daysSinceLastVisit,
  pickReminderTier,
  filterCustomersByDays,
  exportCustomersToExcel,
  REMINDER_FILTER_OPTIONS,
} from "../franchise/Reminders";

export default function FranchiseCustomersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [franchise, setFranchise] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [daysFilter, setDaysFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/franchise/${id}/customers`);
        setFranchise(res.data.data.franchise);
        setCustomers(res.data.data.customers);
      } catch (err) {
        showToast(
          err?.response?.data?.message || "Failed to load franchise",
          "error"
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const displayedCustomers = filterCustomersByDays(customers, daysFilter).map(
    (c) => ({
      ...c,
      franchiseName: franchise?.name || "Franchise",
      franchiseCode: franchise?.franchiseCode || "—",
    })
  );

  const handleDownload = () => {
    const filename = `${franchise?.name || "franchise"}-customers-${daysFilter !== "all" ? `${daysFilter}days` : "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    exportCustomersToExcel(displayedCustomers, filename);
    showToast(`Downloaded Excel sheet with ${displayedCustomers.length} customers`);
  };

  if (loading) return <Loader label="Loading franchise..." />;

  return (
    <div className="animate-fadeIn">
      <button
        onClick={() => navigate("/admin")}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{franchise?.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {franchise?.franchiseCode} · {displayedCustomers.length} of {customers.length} customer
            {customers.length !== 1 ? "s" : ""}
            {daysFilter !== "all" ? ` · Filtered: ${REMINDER_FILTER_OPTIONS.find(o => o.value === daysFilter)?.label}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Days Inactivity filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <Clock size={14} className="text-slate-400" />
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              {REMINDER_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            disabled={displayedCustomers.length === 0}
            onClick={handleDownload}
          >
            <Download size={16} />
            Download Excel {daysFilter !== "all" ? `(${daysFilter}d)` : "(All)"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {displayedCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            subtitle="No customers matching the selected last-visit filter"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Phone Number</th>
                  <th className="px-6 py-3 font-medium">Loyalty Points</th>
                  <th className="px-6 py-3 font-medium">Last Visit</th>
                  <th className="px-6 py-3 font-medium">Reward Eligible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedCustomers.map((c) => {
                  const days = daysSinceLastVisit(c);
                  const tier = pickReminderTier(days);
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {c.name || "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Phone size={13} className="text-slate-400" />
                          {c.phone}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {c.loyaltyPoints}
                      </td>
                      <td className="px-6 py-3.5">
                        {days === null ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              tier
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                            title={tier ? `Reminder Tier: ${tier.label}` : undefined}
                          >
                            {days === 0 ? "Today" : `${days}d ago`}
                            {tier ? ` · ${tier.label}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {c.rewardEligible ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Eligible
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast {...toast} onClose={closeToast} />
    </div>
  );
}

