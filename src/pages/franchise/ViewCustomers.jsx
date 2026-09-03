import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../../api/apiHelpers";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { Loader, EmptyState, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import AddCustomerModal from "./AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import {
  Search,
  Plus,
  Users,
  Phone,
  Repeat,
  PhoneCall,
  MessageCircle,
  UserPlus,
  Check,
  Zap,
  Download,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Trash,
  Power
} from "lucide-react";
import {
  daysSinceLastVisit,
  isReminderDue,
  pickReminderTier,
  getWhatsappReminderLink,
  getCallLink,
  filterCustomersByDays,
  exportCustomersToExcel,
  REMINDER_FILTER_OPTIONS,
} from "./Reminders";

export default function ViewCustomers() {
  const { user } = useAuth();
  const { toast, showToast, closeToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [franchise, setFranchise] = useState(null);
  const [search, setSearch] = useState("");
  const [daysFilter, setDaysFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [sortByRedemptions, setSortByRedemptions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [savingId, setSavingId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await apiDelete(`/customers/${id}`);
      showToast("Customer deleted successfully");
      load(search);
    } catch {
      showToast("Could not delete customer", "error");
    }
  };

  const handleToggleStatus = async (c) => {
    try {
      await apiPatch(`/customers/${c._id}/status`, { isActive: !c.isActive });
      showToast("Customer status updated");
      load(search);
    } catch {
      showToast("Could not update status", "error");
    }
  };
  const load = async (q) => {
    setLoading(true);
    try {
      let franchiseName = "Franchise";

      // Fetch franchise info if user has franchiseId
      if (user?.franchiseId) {
        try {
          const franchiseRes = await apiGet(`/franchise/${user.franchiseId}/customers`);
          if (franchiseRes?.data?.data?.franchise?.name) {
            franchiseName = franchiseRes.data.data.franchise.name;
            setFranchise(franchiseRes.data.data.franchise);
          }
        } catch (franchiseError) {
          console.warn("Could not fetch franchise info:", franchiseError);
          // Use fallback
          franchiseName = user?.franchiseName || "Franchise";
        }
      }

      // Fetch customers with proper enrichment
      const res = await apiGet(`/customers${q ? `?search=${q}` : ""}`);
      const customersData = res.data.data || [];

      // Attach franchise name to each customer
      const enrichedCustomers = customersData.map(c => ({
        ...c,
        franchiseName: c.franchiseName || c.franchise?.name || franchiseName
      }));

      setCustomers(enrichedCustomers);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load customers",
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    load(search);
  };

  const addToContact = async (customer) => {
    if (customer.isContact || savedIds.has(customer._id) || savingId === customer._id) return;
    setSavingId(customer._id);
    try {
      const res = await apiPost("/customers/contact", {
        phone: customer.phone,
        name: customer.name,
      });
      showToast("Saved to contacts");
      setSavedIds((prev) => new Set(prev).add(customer._id));
      setCustomers((prev) =>
        prev.map((item) =>
          item._id === customer._id
            ? {
              ...item,
              isContact: true,
            }
            : item
        )
      );
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Could not save contact",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  // Filter & Sort
  let filteredList = filterCustomersByDays(customers, daysFilter);
  if (sortByRedemptions) {
    filteredList = [...filteredList].sort(
      (a, b) => (b.rewardsRedeemed || 0) - (a.rewardsRedeemed || 0)
    );
  }
  const displayedCustomers = filteredList;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(displayedCustomers.length / pageSize));
  const paginatedCustomers = displayedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasActiveFilters = daysFilter !== "all" || sortByRedemptions || Boolean(search);


  const handleDownloadExcel = () => {
    const filename = `customers-${daysFilter !== "all" ? `${daysFilter}days-inactivity` : "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    exportCustomersToExcel(displayedCustomers, filename);
    showToast(`Downloaded Excel sheet with ${displayedCustomers.length} customers`);
  };

  return (
    <div className="animate-fadeIn">
      {/* 📱 Compact Mobile-First Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Customers</h1>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            {displayedCustomers.length}
          </span>
        </div>

        <div className="flex items-center gap-2">


            {/* Quick Add Customer */}
          <Button variant="amber" onClick={() => setAddOpen(true)} className="px-3.5 py-2 text-xs sm:text-sm">
            <Plus size={15} />
            <span>Add</span>
          </Button>

          {/* Filters & Tools Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition ${showFilters || hasActiveFilters
                ? "border-amber-400 bg-amber-50 text-amber-900"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
          >
            <SlidersHorizontal size={14} className={hasActiveFilters ? "text-amber-600" : "text-slate-500"} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            )}
          </button>


          {/* Excel Download Button */}
          <Button
            variant="outline"
            disabled={displayedCustomers.length === 0}
            onClick={handleDownloadExcel}
            className="hidden sm:flex border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2 text-xs sm:text-sm"
          >
            <Download size={15} />
            <span className="hidden md:inline">Export</span> Excel
          </Button>

        
        </div>
      </div>

      {/* 🔽 Collapsible / One-Click Filter & Actions Panel */}
      {showFilters && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search customer name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[var(--amber)] focus:ring-2 focus:ring-[var(--amber)]/20 sm:text-sm"
                />
              </div>
              <Button type="submit" variant="outline" className="px-3 py-2 text-xs">
                Search
              </Button>
            </form>

            {/* Filter Pills & Options Row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Last Visit Dropdown */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                  <Clock size={13} className="text-slate-400" />
                  <span className="text-slate-500">Visit:</span>
                  <select
                    value={daysFilter}
                    onChange={(e) => {
                      setDaysFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    {REMINDER_FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setSortByRedemptions((v) => !v);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${sortByRedemptions
                      ? "border-amber-300 bg-amber-50 text-amber-800 font-semibold"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Repeat size={13} />
                  <span>Most Redeemed</span>
                </button>

                {/* Clear Filters Button if Active */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setDaysFilter("all");
                      setSortByRedemptions(false);
                      setSearch("");
                      setCurrentPage(1);
                      load("");
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              {/* Action Buttons: Excel */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  disabled={displayedCustomers.length === 0}
                  onClick={handleDownloadExcel}
                  className="sm:hidden border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Download size={13} />
                  Excel {daysFilter !== "all" ? `(${daysFilter}d)` : ""}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 Customers Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <Loader label="Loading customers..." />
        ) : displayedCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            subtitle={hasActiveFilters ? "Try clearing your filters or search" : "Add a customer to start tracking loyalty points"}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                    <th className="px-5 py-3 font-medium">Loyalty Points</th>
                    <th className="px-5 py-3 font-medium">Redemptions</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Last Visit</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCustomers.map((c) => {
                    const days = daysSinceLastVisit(c);
                    const due = isReminderDue(c);
                    const tier = pickReminderTier(days);
                    const isSaved = Boolean(c.isContact || savedIds.has(c._id));

                    return (
                      <tr key={c._id} className="hover:bg-slate-50/60">


                        {/* Name */}
                        <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                          {c.name || "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">


                            <a
                              href={getCallLink(c)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title="Call customer"
                            >
                              <PhoneCall size={13} />
                              Call
                            </a>

                            <a
                              href={getWhatsappReminderLink(c)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              title="Open WhatsApp reminder"
                            >
                              <MessageCircle size={13} />
                              Remind
                            </a>

                            <button
                              type="button"
                              disabled={isSaved || savingId === c._id}
                              onClick={() => addToContact(c)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${isSaved
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default"
                                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              title={isSaved ? "Saved to contacts" : "Save to contacts"}
                            >
                              {savingId === c._id ? (
                                <span className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                              ) : isSaved ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <UserPlus size={13} />
                              )}
                              {isSaved ? "Saved" : "Save"}
                            </button>

                            {/* <button
                              type="button"
                              onClick={() => handleToggleStatus(c)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title={c.isActive !== false ? "Deactivate" : "Activate"}
                            >
                              <Power size={13} className={c.isActive !== false ? "text-emerald-500" : "text-rose-500"} />
                            </button> */}

                            <button
                              type="button"
                              onClick={() => {
                                setEditingCustomer(c);
                                setEditCustomerOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title="Edit"
                            >
                              <Pencil size={13} className="text-blue-500" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(c._id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title="Delete"
                            >
                              <Trash size={13} className="text-rose-500" />
                            </button>
                          </div>
                        </td>



                        {/* Loyalty Points */}
                        <td className="px-5 py-3.5 font-semibold text-amber-700 dark:text-[var(--amber)]">
                          {c.loyaltyPoints}
                        </td>

                        {/* Redemptions */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {c.rewardsRedeemed > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.rewardsRedeemed >= 3
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              <Repeat size={12} />
                              {c.rewardsRedeemed}×
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {c.rewardEligible ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Reward Eligible
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Active</span>
                          )}
                        </td>

                        {/* ✨ Clean, Sleek Non-wrapping Last Visit Badge */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {days === null ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : days === 0 ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap">
                              Today
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${due
                                  ? "bg-rose-50 border border-rose-200 text-rose-700"
                                  : "bg-slate-50 border border-slate-200 text-slate-600"
                                }`}
                              title={tier ? `Reminder Tier: ${tier.label}` : undefined}
                            >
                              <Clock size={11} className={due ? "text-rose-500" : "text-slate-400"} />
                              {days}d ago{tier ? ` · ${tier.label}` : ""}
                            </span>
                          )}
                        </td>




                        {/* Phone */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <Phone size={13} className="text-slate-400" />
                            {c.phone}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 🔢 Pagination Controls */}
            {displayedCustomers.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                      {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, displayedCustomers.length)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{displayedCustomers.length}</span>
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={13} /> Prev
                    </button>
                    <span className="px-2 font-semibold text-slate-800">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AddCustomerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => load(search)}
      />

      <EditCustomerModal
        open={editCustomerOpen}
        customer={editingCustomer}
        onClose={() => setEditCustomerOpen(false)}
        onUpdated={() => {
          showToast("Customer updated successfully");
          load(search);
        }}
      />

      <Toast {...toast} onClose={closeToast} />
    </div>
  );
}