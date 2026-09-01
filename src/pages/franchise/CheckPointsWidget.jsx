import { useState } from "react";
import { apiGet, apiPost } from "../../api/apiHelpers";
import Button from "../../components/Button";
import { Search, UserPlus, CheckCircle2 } from "lucide-react";

export default function CheckPointsWidget({ onContactAdded }) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");
  const [savedToContact, setSavedToContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setChecked(false);
    setSavedToContact(false);
    try {
      const res = await apiGet(`/customers/check?mobile=${mobile}`);
      setCustomer(res.data.data);
      setChecked(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not check points");
    } finally {
      setLoading(false);
    }
  };

  const addToContact = async () => {
    setSavingContact(true);
    try {
      await apiPost("/customers/contact", {
        phone: mobile,
        name: customer?.name || "",
      });
      setSavedToContact(true);
      onContactAdded && onContactAdded();
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-slate-800">Check Customer Points</h3>
      <p className="mt-1 text-sm text-slate-500">
        Enter a mobile number to see loyalty points earned so far.
      </p>

      <form onSubmit={handleCheck} className="mt-4 flex gap-2">
        <input
          required
          inputMode="numeric"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            setChecked(false);
          }}
          className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--amber)] focus:ring-2 focus:ring-[var(--amber)]/20"
        />
        <Button type="submit" variant="primary" loading={loading}>
          <Search size={15} />
          Check
        </Button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {checked && !customer && !error && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          No customer found for this number.
          {savedToContact ? (
            <p className="mt-2 flex items-center gap-1.5 font-medium text-emerald-600">
              <CheckCircle2 size={15} /> Saved to contacts
            </p>
          ) : (
            <Button
              variant="outline"
              className="mt-3 w-full"
              loading={savingContact}
              onClick={addToContact}
            >
              <UserPlus size={15} />
              Add to Contact
            </Button>
          )}
        </div>
      )}

      {checked && customer && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">
                {customer.name || "Unnamed Customer"}
              </p>
              <p className="text-sm text-slate-500">{customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-700 dark:text-[var(--amber)]">
                {customer.loyaltyPoints}
              </p>
              <p className="text-xs text-slate-400">points</p>
            </div>
          </div>

          {customer.rewardEligible && (
            <span className="mt-3 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Reward Eligible
            </span>
          )}
        </div>
      )}
    </div>
  );
}
