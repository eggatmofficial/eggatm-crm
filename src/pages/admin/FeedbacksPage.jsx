import { useEffect, useState, useMemo } from "react";
import { apiGet, apiDelete } from "../../api/apiHelpers";
import StatCard from "../../components/StatCard";
import Button from "../../components/Button";
import { Loader, EmptyState, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import { MessageSquare, Star, Trash2, Calendar, Phone, Store, Filter } from "lucide-react";

export default function FeedbacksPage() {
  const { toast, showToast, closeToast } = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedFranchise, setSelectedFranchise] = useState("ALL");
  const [selectedRating, setSelectedRating] = useState("ALL");

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/userpanel/feedbacks");
      if (res.data?.success) {
        setFeedbacks(res.data.data || []);
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load feedbacks",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unique list of franchise names for the filter dropdown
  const franchiseOptions = useMemo(() => {
    const names = new Set();
    feedbacks.forEach((f) => {
      if (f.franchiseName) {
        names.add(f.franchiseName);
      }
    });
    return Array.from(names);
  }, [feedbacks]);

  // Filtered feedbacks list
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchFranchise =
        selectedFranchise === "ALL" || f.franchiseName === selectedFranchise;
      const matchRating =
        selectedRating === "ALL" || String(f.rating || 5) === String(selectedRating);
      return matchFranchise && matchRating;
    });
  }, [feedbacks, selectedFranchise, selectedRating]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback entry?")) return;
    try {
      await apiDelete(`/userpanel/feedbacks/${id}`);
      showToast("Feedback deleted successfully");
      loadFeedbacks();
    } catch (err) {
      showToast("Failed to delete feedback", "error");
    }
  };

  if (loading) return <Loader label="Loading customer feedbacks..." />;

  const totalCount = filteredFeedbacks.length;
  const avgRating =
    totalCount > 0
      ? (filteredFeedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / totalCount).toFixed(1)
      : "0.0";
  const fiveStarCount = filteredFeedbacks.filter((f) => (f.rating || 5) === 5).length;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Customer Feedbacks
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reviews and ratings submitted by customers via User Panel
          </p>
        </div>
        <Button variant="outline" onClick={loadFeedbacks}>
          🔄 Refresh
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={MessageSquare}
          label="Total Feedbacks"
          value={totalCount}
          accent="navy"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={`${avgRating} ⭐`}
          accent="amber"
        />
        <StatCard
          icon={Star}
          label="5-Star Reviews"
          value={fiveStarCount}
          accent="emerald"
        />
      </div>

      {/* Filter Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Filter size={18} className="text-amber-500" />
          <span>Filter Reviews:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Franchise Select Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Franchise:
            </label>
            <select
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="ALL">All Franchises ({feedbacks.length})</option>
              {franchiseOptions.map((name) => {
                const count = feedbacks.filter((f) => f.franchiseName === name).length;
                return (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Rating Select Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rating:
            </label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
              <option value="4">4 Stars ⭐⭐⭐⭐</option>
              <option value="3">3 Stars ⭐⭐⭐</option>
              <option value="2">2 Stars ⭐⭐</option>
              <option value="1">1 Star ⭐</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedFranchise !== "ALL" || selectedRating !== "ALL") && (
            <button
              onClick={() => {
                setSelectedFranchise("ALL");
                setSelectedRating("ALL");
              }}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Feedbacks Table / List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">
            Reviews List ({filteredFeedbacks.length} showing)
          </h2>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No matching feedbacks found"
            subtitle="Try clearing or changing your franchise/rating filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Date & Time</th>
                  <th className="px-6 py-3.5 font-medium">Customer Name</th>
                  <th className="px-6 py-3.5 font-medium">Customer Mobile</th>
                  <th className="px-6 py-3.5 font-medium">Outlet / Franchise</th>
                  <th className="px-6 py-3.5 font-medium">Rating</th>
                  <th className="px-6 py-3.5 font-medium">Comments / Review</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filteredFeedbacks.map((f) => {
                  const dateStr = f.createdAt
                    ? new Date(f.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—";

                  return (
                    <tr key={f._id} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {dateStr}
                        </div>
                      </td>
                      {/* Customer Name */}
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {f.customerName ? (
                          <span>{f.customerName}</span>
                        ) : (
                          <span className="text-xs font-medium italic text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      {/* Customer Mobile */}
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-amber-500" />
                          +91 {f.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Store size={14} className="text-slate-400" />
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                            {f.franchiseName || "Egg! ATM"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= (f.rating || 5)
                                  ? "text-amber-400"
                                  : "text-slate-200 dark:text-slate-700"
                              }
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                            ({f.rating || 5}/5)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs text-slate-700 dark:text-slate-300">
                        {f.comments ? (
                          <p className="line-clamp-2 italic text-slate-800 dark:text-slate-200">
                            "{f.comments}"
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400">No written comment</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          className="!p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => handleDelete(f._id)}
                          title="Delete feedback"
                        >
                          <Trash2 size={16} />
                        </Button>
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
