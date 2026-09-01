// import { X } from "lucide-react";

// export default function Modal({ open, onClose, title, children, width = "max-w-md" }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
//         onClick={onClose}
//       />
//       <div
//         className={`relative w-full ${width} animate-scaleIn rounded-2xl bg-white p-6 shadow-2xl dark:bg-[var(--bg-surface)] dark:border dark:border-white/10`}
//       >
//         <div className="mb-5 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
//           <button
//             onClick={onClose}
//             className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
//           >
//             <X size={18} />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }



import { X } from "lucide-react";

export default function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  width = "max-w-md",
  showCloseIcon = true // Controlled by prop (defaults to true)
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${width} animate-scaleIn rounded-2xl bg-white p-6 shadow-2xl dark:bg-[var(--bg-surface)] dark:border dark:border-white/10`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          
          {/* Conditionally hide the X icon */}
          {showCloseIcon && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}