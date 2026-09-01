import { useState } from "react";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { apiPost } from "../../api/apiHelpers";

const EMPTY = {
  name: "",
  ownerName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "",
  state: "",
};

export default function CreateFranchiseModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPost("/franchise", form);
      setForm(EMPTY);
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create franchise");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Franchise" width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Franchise Name" name="name" required value={form.name} onChange={handleChange} />
          <Input label="Owner Name" name="ownerName" required value={form.ownerName} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Owner Email" name="email" type="email" required value={form.email} onChange={handleChange} />
          <Input label="Owner Password" name="password" type="password" required value={form.password} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="City" name="city" value={form.city} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="State" name="state" value={form.state} onChange={handleChange} />
          <Input label="Address" name="address" value={form.address} onChange={handleChange} />
        </div>

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
            Create Franchise
          </Button>
        </div>
      </form>
    </Modal>
  );
}
