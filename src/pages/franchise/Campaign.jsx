import { useEffect, useState } from "react";
import { apiGet } from "../../api/apiHelpers";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { Loader, EmptyState, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import Modal from "../../components/Modal";
import {
  Megaphone,
  Search,
  MessageCircle,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Send,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  SkipForward,
  Check
} from "lucide-react";
import {
  normalizePhoneForWhatsapp,
  daysSinceLastVisit,
  REMINDER_FILTER_OPTIONS,
  filterCustomersByDays
} from "./Reminders";

const DEFAULT_TEMPLATE = `Hi {{Customer Name}}! 👋❤️

Thank you for visiting Egg! ATM – {{Franchise Name}}! 🥚🔥

⭐ Your Total Points: {{Total Points}}

🎁 Reach 100 Points and enjoy ANY ONE DISH FREE from our menu! 🍽️🔥

See you again soon! ❤️
Egg! ATM – {{Franchise Name}} 🥚
📞 Contact: {{Franchise Phone}}`;

export function getWhatsappDirectUrl(phone, text) {
  const cleanPhone = normalizePhoneForWhatsapp(phone);
  const encodedText = encodeURIComponent(text);
  const isMobile = typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

export default function Campaign() {
  const { user } = useAuth();
  const { toast, showToast, closeToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [franchiseName, setFranchiseName] = useState("");
  const [franchisePhone, setFranchisePhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [daysFilter, setDaysFilter] = useState("all");

  // Single Broadcast Message Input Box
  const [template, setTemplate] = useState("");

  // Selected customer IDs for batch sending
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Custom per-customer message overrides: { [customerId]: string }
  const [customMessages, setCustomMessages] = useState({});

  // Sent status tracking in local state and persistent storage
  const storageKey = `crm_campaign_sent_${user?.franchiseId || "default"}`;
  const [sentIds, setSentIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Queue Dispatcher Modal State
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueList, setQueueList] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Save sentIds to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(sentIds)));
    } catch {
      /* noop */
    }
  }, [sentIds, storageKey]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      let fName = user?.franchiseName || "";
      let fPhone = user?.franchisePhone || user?.phone || "";

      // Set immediately from user object so it shows without waiting for API
      setFranchiseName(fName);
      setFranchisePhone(fPhone);

      if (user?.franchiseId) {
        try {
          const fRes = await apiGet(`/franchise/${user.franchiseId}/customers`);
          if (fRes?.data?.data?.franchise) {
            const fObj = fRes.data.data.franchise;
            if (fObj.name) fName = fObj.name;
            if (fObj.phone) fPhone = fObj.phone;
          }
        } catch {
          /* use fallback */
        }
      }
      setFranchiseName(fName);
      setFranchisePhone(fPhone);

      const res = await apiGet("/customers");
      const list = res.data.data || [];
      const enriched = list.map((c) => ({
        ...c,
        franchiseName: c.franchiseName || c.franchise?.name || fName,
        franchisePhone: c.franchisePhone || c.franchise?.phone || fPhone,
      }));

      setCustomers(enriched);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute final message text for a customer based on template or custom override
  const renderCustomerMessage = (customer) => {
    if (!customer) return "";
    if (customMessages[customer._id] !== undefined) {
      return customMessages[customer._id];
    }

    const name = customer.name ? customer.name.replace(/^ATM-/, "").trim() : "Customer";
    const fName = customer.franchiseName || franchiseName;
    const fPhone = customer.franchisePhone || franchisePhone || "";
    const points = customer.loyaltyPoints ?? 0;

    return template
      .replace(/\{\{\s*Customer Name\s*\}\}/gi, name)
      .replace(/\{\{\s*Franchise Name\s*\}\}/gi, fName)
      .replace(/\{\{\s*Franchise Phone\s*\}\}/gi, fPhone)
      .replace(/\{\{\s*Total Points\s*\}\}/gi, String(points));
  };

  const handleCustomMessageChange = (customerId, text) => {
    setCustomMessages((prev) => ({
      ...prev,
      [customerId]: text,
    }));
  };

  const handleResetCustomerMessage = (customerId) => {
    setCustomMessages((prev) => {
      const copy = { ...prev };
      delete copy[customerId];
      return copy;
    });
  };

  // Launch Queue Dispatcher for selected contacts to bypass popup blocker
  const handleStartQueueCampaign = () => {
    if (selectedIds.size === 0) {
      showToast("Please select at least one contact to send", "error");
      return;
    }

    const selectedCustomers = customers.filter((c) => selectedIds.has(c._id));
    setQueueList(selectedCustomers);
    setQueueIndex(0);
    setQueueModalOpen(true);
  };

  // Send current item in queue and advance to next
  const handleSendQueueCurrent = () => {
    const currentCustomer = queueList[queueIndex];
    if (!currentCustomer) return;

    if (currentCustomer.phone) {
      const text = renderCustomerMessage(currentCustomer);
      const url = getWhatsappDirectUrl(currentCustomer.phone, text);
      window.open(url, "_blank", "noopener,noreferrer");
    }

    setSentIds((prev) => new Set(prev).add(currentCustomer._id));
    
    // Advance queue
    if (queueIndex + 1 < queueList.length) {
      setQueueIndex((i) => i + 1);
    } else {
      setQueueIndex(queueList.length);
      setSelectedIds(new Set());
    }
  };

  const handleSkipQueueCurrent = () => {
    if (queueIndex + 1 < queueList.length) {
      setQueueIndex((i) => i + 1);
    } else {
      setQueueIndex(queueList.length);
    }
  };

  const handleSendWhatsapp = (customer) => {
    if (!customer.phone) {
      showToast("Customer has no phone number", "error");
      return;
    }

    const text = renderCustomerMessage(customer);
    const url = getWhatsappDirectUrl(customer.phone, text);

    window.open(url, "_blank", "noopener,noreferrer");

    setSentIds((prev) => new Set(prev).add(customer._id));
    showToast(`WhatsApp opened for ${customer.name || customer.phone}`);
  };

  const handleClearSentHistory = () => {
    setSentIds(new Set());
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
    showToast("Cleared sent history status");
  };

  // Filtered customer list
  let filtered = customers;

  if (daysFilter !== "all") {
    filtered = filterCustomersByDays(filtered, daysFilter);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }

  // Checkbox Selection Helpers
  const isAllFilteredSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c._id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c._id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.add(c._id));
        return next;
      });
    }
  };

  const toggleSelectCustomer = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = filtered.slice(startIndex, startIndex + pageSize);

  const currentQueueCustomer = queueList[queueIndex];
  const isQueueComplete = queueList.length > 0 && queueIndex >= queueList.length;

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--amber)]/10 text-[var(--amber)]">
              <Megaphone size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                WhatsApp Campaign
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Franchise: <span className="font-semibold text-slate-700 dark:text-slate-200">{franchiseName}</span>
                {franchisePhone && <span className="ml-2">({franchisePhone})</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sentIds.size > 0 && (
            <button
              onClick={handleClearSentHistory}
              className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
            >
              Clear Sent History ({sentIds.size})
            </button>
          )}
          <Button variant="secondary" onClick={loadData} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* INFORMATION BANNER */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          
          <p className="mt-0.5">
         Selecting multiple contacts and clicking <strong>Send Campaign to Selected</strong> opens a guided queue dispatcher that safely opens WhatsApp Web for each selected contact one by one!
          </p>
        </div>
      </div>

      {/* BROADCAST MESSAGE INPUT BOX */}
      <div className="rounded-2xl border border-slate-200 bg-[var(--bg-surface)] p-5 shadow-sm dark:border-white/10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--amber)]" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Campaign Message Template
            </h2>
          </div>
          <button
            onClick={() => {
              setTemplate("");
              setCustomMessages({});
              showToast("Cleared message template");
            }}
            className="text-xs text-slate-500 hover:text-[var(--amber)] dark:text-slate-400"
          >
            Clear Message
          </button>
        </div>


        <textarea
          rows={6}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-mono text-slate-800 placeholder-slate-400 transition focus:border-[var(--amber)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--amber)]/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-transparent"
          placeholder="Type your campaign broadcast message here..."
        />
      </div>

      {/* SELECTION ACTION BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAllFiltered}
            className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {isAllFilteredSelected ? (
              <CheckSquare size={16} className="text-emerald-600" />
            ) : (
              <Square size={16} className="text-slate-400" />
            )}
            {isAllFilteredSelected ? "Unselect All" : "Select All Filtered"}
          </button>

          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Selected: <strong className="text-slate-900 dark:text-white">{selectedIds.size}</strong> contacts
          </span>
        </div>

        <button
          onClick={handleStartQueueCampaign}
          disabled={selectedIds.size === 0}
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition ${
            selectedIds.size === 0
              ? "bg-slate-300 cursor-not-allowed dark:bg-slate-700"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/20"
          }`}
        >
          <Send size={18} />
          Send Campaign to Selected ({selectedIds.size})
        </button>
      </div>

      {/* CONTROLS & FILTERS BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-[var(--bg-surface)] py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[var(--amber)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)]/20 dark:border-white/10 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={daysFilter}
              onChange={(e) => {
                setDaysFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-[var(--amber)] focus:outline-none dark:border-white/10 dark:text-slate-200"
            >
              {REMINDER_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total: <strong className="text-slate-800 dark:text-slate-100">{filtered.length}</strong> customers
          </span>
        </div>
      </div>

      {/* CUSTOMER CAMPAIGN LIST */}
      {loading ? (
        <Loader label="Loading franchise customers..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          subtitle={search ? "Try adjusting your search query." : "No customers registered for this franchise yet."}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {paginatedCustomers.map((customer) => {
              const currentMsg = renderCustomerMessage(customer);
              const isOverridden = customMessages[customer._id] !== undefined;
              const isSent = sentIds.has(customer._id);
              const isSelected = selectedIds.has(customer._id);
              const days = daysSinceLastVisit(customer);

              return (
                <div
                  key={customer._id}
                  className={`rounded-2xl border bg-[var(--bg-surface)] p-5 shadow-sm transition-all dark:border-white/10 ${
                    isSelected ? "ring-2 ring-emerald-500/50 border-emerald-500" : ""
                  } ${
                    isSent ? "border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* CHECKBOX & CUSTOMER INFO */}
                    <div className="flex items-start gap-3 min-w-[220px]">
                      <button
                        onClick={() => toggleSelectCustomer(customer._id)}
                        className="mt-1 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition"
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="text-emerald-600" />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {customer.name ? customer.name.replace(/^ATM-/, "") : "Customer"}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                          📞 {customer.phone}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            ⭐ {customer.loyaltyPoints ?? 0} Points
                          </span>
                          {days !== null && (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                              🕒 {days} days ago
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* MESSAGE EDIT INPUT BOX */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Message Preview / Edit for WhatsApp:</span>
                        {isOverridden && (
                          <button
                            onClick={() => handleResetCustomerMessage(customer._id)}
                            className="text-[var(--amber)] hover:underline"
                          >
                            Reset to Template
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={4}
                        value={currentMsg}
                        onChange={(e) => handleCustomMessageChange(customer._id, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 shadow-inner transition focus:border-[var(--amber)] focus:outline-none focus:ring-1 focus:ring-[var(--amber)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
                      />
                    </div>

                    {/* DYNAMIC ACTION BUTTON */}
                    <div className="flex items-center justify-end lg:pt-5">
                      {isSent ? (
                        <button
                          onClick={() => handleSendWhatsapp(customer)}
                          className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-800 border border-emerald-300 shadow-sm transition hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50"
                          title="Click to resend WhatsApp message"
                        >
                          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                          Sended ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendWhatsapp(customer)}
                          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
                        >
                          <MessageCircle size={18} />
                          Send WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs"
                >
                  <ChevronLeft size={16} /> Prev
                </Button>
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs"
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BATCH CAMPAIGN DISPATCHER QUEUE MODAL */}
      <Modal
        open={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        title={`Campaign Dispatcher (${queueIndex >= queueList.length ? queueList.length : queueIndex + 1} / ${queueList.length})`}
      >
        {isQueueComplete ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Campaign Batch Complete! 🎉
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                All {queueList.length} campaign messages have been processed and launched.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setQueueModalOpen(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Close Dispatcher
              </Button>
            </div>
          </div>
        ) : currentQueueCustomer ? (
          <div className="space-y-5">
            {/* PROGRESS BAR */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Sending Progress</span>
                <span>{queueIndex + 1} of {queueList.length}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((queueIndex + 1) / queueList.length) * 100}%` }}
                />
              </div>
            </div>

            {/* CURRENT CUSTOMER CARD */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {currentQueueCustomer.name ? currentQueueCustomer.name.replace(/^ATM-/, "") : "Customer"}
                </h4>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded dark:bg-amber-950 dark:text-amber-300">
                  ⭐ {currentQueueCustomer.loyaltyPoints ?? 0} Pts
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                📞 {currentQueueCustomer.phone}
              </p>
            </div>

            {/* MESSAGE PREVIEW */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Message to send:
              </label>
              <textarea
                rows={4}
                readOnly
                value={renderCustomerMessage(currentQueueCustomer)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 shadow-inner dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSkipQueueCurrent}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <SkipForward size={16} /> Skip Contact
              </button>

              <button
                onClick={handleSendQueueCurrent}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
              >
                <MessageCircle size={18} />
                Send on WhatsApp & Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
