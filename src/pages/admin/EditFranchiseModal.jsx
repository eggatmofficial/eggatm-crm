import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { apiGet, apiPut } from "../../api/apiHelpers";

export default function EditFranchiseModal({ open, franchiseId, onClose, onUpdated }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && franchiseId) {
      setLoading(true);
      apiGet(`/franchise/${franchiseId}`)
        .then((res) => setForm(res.data.data))
        .catch(() => setError("Failed to load franchise details"))
        .finally(() => setLoading(false));
    }
  }, [open, franchiseId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPut(`/franchise/${franchiseId}`, form);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update franchise");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Franchise" width="max-w-lg">
      {loading ? (
        <p>Loading...</p>
      ) : form ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Franchise Name" name="name" required value={form.name || ""} onChange={handleChange} />
            <Input label="Owner Name" name="ownerName" required value={form.ownerName || ""} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Owner Email" name="email" type="email" value={form.email || ""} onChange={handleChange} />
            <Input label="Phone" name="phone" value={form.phone || ""} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="City" name="city" value={form.city || ""} onChange={handleChange} />
            <Input label="State" name="state" value={form.state || ""} onChange={handleChange} />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             <Input label="Address" name="address" value={form.address || ""} onChange={handleChange} />
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
              Save Changes
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}
