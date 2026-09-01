import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../../api/apiHelpers";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Loader, EmptyState, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import EditCustomerModal from "./EditCustomerModal";
import {
  Phone,
  UserPlus,
  Search,
  BookUser,
  PhoneCall,
  MessageCircle,
  Zap,
  Check,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Pencil,
  Trash,
  Power,
  Download
} from "lucide-react";
import {
  daysSinceLastVisit,
  isReminderDue,
  pickReminderTier,
  getWhatsappReminderLink,
  getCallLink,
  exportCustomersToExcel,
} from "./Reminders";

export default function Contacts() {
  const { user } = useAuth();
  const { toast, showToast, closeToast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [franchise, setFranchise] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Quick Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await apiDelete(`/customers/${id}`);
      showToast("Contact deleted successfully");
      load(search);
    } catch {
      showToast("Could not delete contact", "error");
    }
  };

  const handleToggleStatus = async (c) => {
    try {
      await apiPatch(`/customers/${c._id}/status`, { isActive: !c.isActive });
      showToast("Contact status updated");
      load(search);
    } catch {
      showToast("Could not update status", "error");
    }
  };

  const handleDownloadExcel = () => {
    const filename = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    exportCustomersToExcel(contacts, filename);
    showToast(`Downloaded Excel sheet with ${contacts.length} contacts`);
  };

  const handleQuickSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost("/customers/contact", form);
      showToast("Contact added successfully");
      setForm({ name: "", phone: "" });
      setShowAddForm(false);
      load(search);
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not add contact", "error");
    } finally {
      setSaving(false);
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

      // Fetch contacts with proper enrichment
      const params = new URLSearchParams({ contactsOnly: "true" });
      if (q) params.set("search", q);
      const res = await apiGet(`/customers?${params.toString()}`);
      const contactsData = res.data.data || [];
      
      // Attach franchise name to each contact
      const enrichedContacts = contactsData.map(c => ({
        ...c,
        franchiseName: c.franchiseName || c.franchise?.name || franchiseName
      }));
      
      setContacts(enrichedContacts);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load contacts",
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



  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(contacts.length / pageSize));
  const paginatedContacts = contacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="animate-fadeIn">
      {/* 📱 Header Styled like Customers Screen */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Contacts</h1>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            {contacts.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Excel Download Button */}
          <Button
            variant="outline"
            disabled={contacts.length === 0}
            onClick={handleDownloadExcel}
            className="hidden sm:flex border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2 text-xs sm:text-sm"
          >
            <Download size={15} />
            <span className="hidden md:inline">Export</span> Excel
          </Button>

          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition ${
              showFilters || Boolean(search)
                ? "border-amber-400 bg-amber-50 text-amber-900"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={14} className={search ? "text-amber-600" : "text-slate-500"} />
            <span>Filters</span>
            {search && <span className="h-2 w-2 rounded-full bg-amber-500" />}
          </button>

          {/* Add Contact Button */}
          {/* <Button
            variant="amber"
            onClick={() => setShowAddForm((v) => !v)}
            className="px-3.5 py-2 text-xs sm:text-sm"
          >
            <Plus size={15} />
            <span>Add</span>
          </Button> */}
        </div>
      </div>

      {/* ➕ Expandable Quick Add Contact Form */}
      {showAddForm && (
        <form
          onSubmit={handleQuickSave}
          className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Add New Contact
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-amber-100/60 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="98765 43210"
                required
                inputMode="numeric"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Name (optional)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contact Name"
              />
            </div>
            <Button
              type="submit"
              variant="amber"
              disabled={saving || !form.phone}
              className="h-10 px-4 text-xs font-semibold"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <UserPlus size={15} />
              )}
              Save
            </Button>
          </div>
        </form>
      )}

      {/* 🔽 Filters Panel */}
      {showFilters && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search contact name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 sm:text-sm"
                />
              </div>
              <Button type="submit" variant="outline" className="px-3 py-2 text-xs">
                Search
              </Button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    load("");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </form>

       
          </div>
        </div>
      )}

      {/* 📋 Contacts Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <Loader label="Loading contacts..." />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={BookUser}
            title="No contacts saved yet"
            subtitle="Add contacts to easily manage and remind them."
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Last Visit</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedContacts.map((c) => {
                    const days = daysSinceLastVisit(c);
                    const due = isReminderDue(c);
                    const tier = pickReminderTier(days);
                   

                    return (
                      <tr key={c._id} className="hover:bg-slate-50/60">
                        {/* Name */}
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-800">
                          {c.name || "—"}
                        </td>

                          {/* Actions */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={getCallLink(c)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title="Call contact"
                            >
                              <PhoneCall size={13} />
                              Call
                            </a>

                            <a
                              href={getWhatsappReminderLink(c)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              title="Open WhatsApp"
                            >
                              <MessageCircle size={13} />
                              Remind
                            </a>
                            
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

                       

                        {/* Last Visit */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {days === null ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : days === 0 ? (
                            <span className="inline-flex items-center whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              Today
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                due
                                  ? "border border-rose-200 bg-rose-50 text-rose-700"
                                  : "border border-slate-200 bg-slate-50 text-slate-600"
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

            {/* 🔢 Pagination Footer */}
            {contacts.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                      {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, contacts.length)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{contacts.length}</span>
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
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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

      <EditCustomerModal
        open={editCustomerOpen}
        customer={editingCustomer}
        onClose={() => setEditCustomerOpen(false)}
        onUpdated={() => {
          showToast("Contact updated successfully");
          load(search);
        }}
      />

      <Toast {...toast} onClose={closeToast} />
    </div>
  );
}