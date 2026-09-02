// import { useState, useEffect } from "react";
// import Modal from "../../components/Modal";
// import Input from "../../components/Input";
// import Button from "../../components/Button";
// import { apiPost, apiGet } from "../../api/apiHelpers";
// import { CheckCircle2, MessageCircle, Loader2 } from "lucide-react";
// import { normalizePhoneForWhatsapp } from "./Reminders";

// const EMPTY = { name: "", phone: "", billAmount: "" };

// export default function AddCustomerModal({ open, onClose, onSaved }) {
//   const [form, setForm] = useState(EMPTY);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState(null);
  
//   const [isExisting, setIsExisting] = useState(false);
//   const [checking, setChecking] = useState(false);

//   useEffect(() => {
//     const checkPhone = async () => {
//       // Use the exact phone string (trimmed) to match what might be in the database (e.g. with spaces)
//       const mobileToSearch = form.phone.trim();
//       // Only check if there are at least 10 digits
//       if (mobileToSearch.replace(/\D/g, "").length >= 10) {
//         setChecking(true);
//         try {
//           const res = await apiGet(
//             `/customers/check?mobile=${encodeURIComponent(mobileToSearch)}`
//           );
//           if (res.data.data) {
//             setIsExisting(true);
//             const fetchedName = res.data.data.name;
//             // Autofill name if available, but don't autofill the default "Customer"
//             if (!form.name && fetchedName && fetchedName !== "Customer") {
//               setForm((f) => ({
//                 ...f,
//                 name: fetchedName.replace("ATM-", ""),
//               }));
//             }
//           } else {
//             setIsExisting(false);
//           }
//         } catch (err) {
//           setIsExisting(false);
//         } finally {
//           setChecking(false);
//         }
//       } else {
//         setIsExisting(false);
//       }
//     };

//     const timer = setTimeout(checkPhone, 500);
//     return () => clearTimeout(timer);
//   }, [form.phone]);

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleClose = () => {
//     setForm(EMPTY);
//     setResult(null);
//     setError("");
//     setIsExisting(false);
//     onClose();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError("");
//     try {
//       // Add 'ATM-' prefix to the name if provided
//       const payload = { ...form };
//       if (payload.name && !payload.name.startsWith("ATM-")) {
//         payload.name = `ATM-${payload.name}`;
//       }
      
//       const res = await apiPost("/customers", payload);
//       setResult(res.data.data);
//       onSaved && onSaved();
//     } catch (err) {
//       setError(err?.response?.data?.message || "Could not add customer");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getWhatsappMessage = () => {
//     if (!result) return "";
//     const msg = `Thank you for visiting our shop! ✨

// Today you earned *${result.pointsEarned} reward points!* 🎉
// Total reward points: *${result.customer.loyaltyPoints} points*

// Reach 100 points and you will get any ONE DISH Free from our shop menu 🍽️`;
//     return encodeURIComponent(msg);
//   };

//   const getWhatsappLink = () => {
//     if (!form.phone) return "#";
//     const phone = normalizePhoneForWhatsapp(form.phone);
//     return `https://wa.me/${phone}?text=${getWhatsappMessage()}`;
//   };

//   return (
//     <Modal open={open} onClose={handleClose} title="Add Customer">
//       {result ? (
//         <div className="flex flex-col items-center gap-3 py-4 text-center">
//           <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
//             <CheckCircle2 size={30} />
//           </div>
//           <p className="text-lg font-semibold text-slate-900">
//             Points added successfully
//           </p>
//           <p className="text-sm text-slate-500">
//             {result.pointsEarned} point{result.pointsEarned !== 1 ? "s" : ""}{" "}
//             added for {form.phone}. Total balance:{" "}
//             <span className="font-semibold text-slate-700">
//               {result.customer.loyaltyPoints}
//             </span>
//           </p>
//           <div className="mt-4 flex w-full flex-col gap-2">
//             <a
//               href={getWhatsappLink()}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
//             >
//               <MessageCircle size={18} />
//               Send WhatsApp Message
//             </a>
//             <Button variant="outline" className="w-full" onClick={handleClose}>
//               Done
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Input
//             label="Customer Phone Number"
//             name="phone"
//             required
//             inputMode="numeric"
//             placeholder="98765 43210"
//             value={form.phone}
//             onChange={handleChange}
//           />
//           <div className="relative">
//             <Input
//               label="Customer Name"
//               name="name"
//               placeholder="Walk-in customer"
//               value={form.name}
//               onChange={handleChange}
//             />
//             {checking && (
//               <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-slate-400" />
//             )}
//           </div>
//           <Input
//             label="Bill Amount (₹)"
//             name="billAmount"
//             type="number"
//             min={0}
//             required
//             placeholder="0"
//             value={form.billAmount}
//             onChange={handleChange}
//           />

//           {error && (
//             <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
//               {error}
//             </p>
//           )}

//           <div className="flex justify-end gap-3 pt-2">
//             <Button type="button" variant="outline" onClick={handleClose}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="amber" loading={saving}>
//               Submit
//             </Button>
//           </div>
//         </form>
//       )}
//     </Modal>
//   );
// }












import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { apiPost, apiGet } from "../../api/apiHelpers";
import { CheckCircle2, MessageCircle, Loader2 } from "lucide-react";
import { normalizePhoneForWhatsapp } from "./Reminders";
import { useAuth } from "../../context/AuthContext";

const EMPTY = { name: "", phone: "", billAmount: "" };

export default function AddCustomerModal({ open, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  
  const [isExisting, setIsExisting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkPhone = async () => {
      const mobileToSearch = form.phone.trim();
      if (mobileToSearch.replace(/\D/g, "").length >= 10) {
        setChecking(true);
        try {
          const res = await apiGet(
            `/customers/check?mobile=${encodeURIComponent(mobileToSearch)}`
          );
          if (res.data.data) {
            setIsExisting(true);
            const fetchedName = res.data.data.name;
            if (!form.name && fetchedName && fetchedName !== "Customer") {
              setForm((f) => ({
                ...f,
                name: fetchedName.replace("ATM-", ""),
              }));
            }
          } else {
            setIsExisting(false);
          }
        } catch (err) {
          setIsExisting(false);
        } finally {
          setChecking(false);
        }
      } else {
        setIsExisting(false);
      }
    };

    const timer = setTimeout(checkPhone, 500);
    return () => clearTimeout(timer);
  }, [form.phone]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleClose = () => {
    setForm(EMPTY);
    setResult(null);
    setError("");
    setIsExisting(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (payload.name && !payload.name.startsWith("ATM-")) {
        payload.name = payload.name;
      }
      
      const res = await apiPost("/customers", payload);
      setResult(res.data.data);
      onSaved && onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not add customer");
    } finally {
      setSaving(false);
    }
  };
  console.log("result", result);

 const getWhatsappMessage = () => {
    if (!result) return "";
    
    // Extract customer name (or fallback to Customer)
    const customerName = form.name ? form.name.replace(/^ATM-/, "") : "Customer";
    // Replace with your dynamic franchise name variable if available
    const franchiseName = result?.franchiseName || user?.franchiseName || "";

    const msg = `Hi ${customerName}! 👋❤️

Thank you for visiting Egg! ATM – ${franchiseName}! 🥚🔥

Today you earned +${result.pointsEarned} Reward Points! 🎉

⭐ Your Total Points: ${result.customer.loyaltyPoints}

🎁 Reach 100 Points and enjoy ANY ONE DISH FREE from our menu! 🍽️🔥

See you again soon! ❤️
Egg! ATM – Any Time Muttai 🥚`;

    return encodeURIComponent(msg);
  };

  const handleWhatsappClick = () => {
    if (form.phone) {
      const phone = normalizePhoneForWhatsapp(form.phone);
      const url = `https://wa.me/${phone}?text=${getWhatsappMessage()}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Customer" showCloseIcon={false}>
      {result ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={30} />
          </div>
          <p className="text-lg font-semibold text-slate-900">
            Points added successfully
          </p>
          <p className="text-sm text-slate-500">
            {result.pointsEarned} point{result.pointsEarned !== 1 ? "s" : ""}{" "}
            added for {form.phone}. Total Reward Points:{" "}
            <span className="font-semibold text-slate-700">
              {result.customer.loyaltyPoints}
            </span>
          </p>
          <div className="mt-4 flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={handleWhatsappClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <MessageCircle size={18} />
              Send WhatsApp Message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Phone Number"
            name="phone"
            required
            inputMode="numeric"
            placeholder="98765 43210"
            value={form.phone}
            onChange={handleChange}
          />
          <div className="relative">
            <Input
              label="Customer Name"
              name="name"
              placeholder="Walk-in customer"
              value={form.name}
              onChange={handleChange}
            />
            {checking && (
              <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
          <Input
            label="Bill Amount (₹)"
            name="billAmount"
            type="number"
            min={0}
            required
            placeholder="0"
            value={form.billAmount}
            onChange={handleChange}
          />

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="amber" loading={saving}>
              Submit
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}