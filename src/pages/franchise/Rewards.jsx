import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../../api/apiHelpers";
import Button from "../../components/Button";
import { Loader, EmptyState, Toast } from "../../components/Feedback";
import { useToast } from "../../components/useToast";
import { Gift, Phone, RotateCcw, UserPlus, Check, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { normalizePhoneForWhatsapp } from "./Reminders";

export default function Rewards() {
  const { user } = useAuth();
  const { toast, showToast, closeToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/customers/rewards");
      setCustomers(res.data.data.topCustomers || []);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load rewards",
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

  const eligible = customers.filter((c) => c.rewardEligible);

  const redeem = async (customer) => {
    if (!window.confirm(`Redeem reward for ${customer.name || customer.phone}?`))
      return;
    setResettingId(customer._id);
    try {
      await apiPatch(`/customers/rewards/reset/${customer._id}`);
      showToast("Reward redeemed successfully");
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || "Redeem failed", "error");
    } finally {
      setResettingId(null);
    }
  };

  const addToContact = async (customer) => {
    if (savedIds.has(customer._id) || savingId === customer._id) return;
    setSavingId(customer._id);
    try {
      await apiPost("/customers/contact", {
        phone: customer.phone,
        name: customer.name,
      });
      showToast("Added to contacts");
      setSavedIds((prev) => new Set(prev).add(customer._id));
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Could not save contact",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  const sendRewardWhatsapp = (customer) => {
    if (!customer.phone) {
      showToast("Customer has no phone number", "error");
      return;
    }

    const customerName = customer.name
      ? customer.name.replace(/^ATM-/, "").trim()
      : "Customer";
    const franchiseName = user?.franchiseName || "";

    const msg =
`🎉 Congratulations, ${customerName}! 🥚❤️

You have reached 100 Reward Points! ⭐

🎁 Your FREE DISH is ready!

Redeem any ONE DISH from our menu at:

🥚 Egg! ATM – ${franchiseName}

Just tell us your mobile number and redeem your reward! 😋🔥

Any Time Muttai ❤️`;

    const cleanPhone = normalizePhoneForWhatsapp(customer.phone);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    showToast(`WhatsApp opened for ${customerName}`);
  };

  if (loading) return <Loader label="Loading rewards..." />;

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Rewards</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customers who have crossed the reward points threshold
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {eligible.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No customers eligible yet"
            subtitle="Customers become eligible once they cross the reward threshold"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                   <th className="px-6 py-3 font-medium text-right">Actions</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Points</th>
                 
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eligible.map((c) => {
                  const isSaved = savedIds.has(c._id);
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {c.name || "—"}
                      </td>
                        <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant={isSaved ? "ghost" : "outline"}
                            className="!px-3 !py-1.5"
                            loading={savingId === c._id}
                            disabled={isSaved}
                            onClick={() => addToContact(c)}
                          >
                            {isSaved ? <Check size={14} /> : <UserPlus size={14} />}
                            {isSaved ? "Saved" : "Save"}
                          </Button>
                          <button
                            onClick={() => sendRewardWhatsapp(c)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95"
                            title="Send reward congratulation on WhatsApp"
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </button>
                          <Button
                            variant="outline"
                            className="!px-3 !py-1.5"
                            loading={resettingId === c._id}
                            onClick={() => redeem(c)}
                          >
                            <RotateCcw size={14} />
                            Redeem
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Phone size={13} className="text-slate-400" />
                          {c.phone}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {c.loyaltyPoints} pts
                        </span>
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