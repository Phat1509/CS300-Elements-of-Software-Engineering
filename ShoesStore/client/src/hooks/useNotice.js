// client/src/hooks/useNotice.js
import { useRef, useState } from "react";

export default function useNotice(defaultTimeout = 3000) {
  const [notice, setNotice] = useState(null); // { type, message }
  const timerRef = useRef(null);

  const showNotice = (type, message, timeout = defaultTimeout) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotice({ type, message });
    timerRef.current = setTimeout(() => {
      setNotice(null);
      timerRef.current = null;
    }, timeout);
  };

  const clearNotice = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotice(null);
  };

  return { notice, showNotice, clearNotice };
}