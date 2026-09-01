import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState({ message: "", type: "success" });
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToast({ message: "", type });
    }, 3200);
  }, []);

  const closeToast = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast({ message: "", type: toast.type });
  }, [toast.type]);

  return { toast, showToast, closeToast };
}
