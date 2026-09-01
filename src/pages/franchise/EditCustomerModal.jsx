import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { apiPut } from "../../api/apiHelpers";

export default function EditCustomerModal({ open, customer, onClose, onUpdated }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      // Remove ATM- prefix if it exists for editing purposes
      const cleanName = customer.name?.startsWith("ATM-") ? customer.name.replace("ATM-", "") : (customer.name || "");
      setForm({
        name: cleanName,
        phone: customer.phone || "",
      });
    }
  }, [customer]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (payload.name && !payload.name.startsWith("ATM-")) {
         payload.name = `ATM-${payload.name}`;
      }

      await apiPut(`/customers/${customer._id}`, payload);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Customer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Customer Phone Number"
          name="phone"
          required
          inputMode="numeric"
          value={form.phone}
          onChange={handleChange}
        />
        
        <Input
          label="Customer Name"
          name="name"
          placeholder="Walk-in customer"
          value={form.name}
          onChange={handleChange}
        />

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="amber" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
