// hooks/useNetworkStatus.js
import { useEffect, useRef, useState } from "react";
import api from "../../api";

export default function useNetworkStatus(pollMs = 8000) {
  const [online, setOnline] = useState(navigator.onLine);
  const [restoring, setRestoring] = useState(false);
  const [explicitOffline, setExplicitOffline] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const handleOnline = () => {
      if (!explicitOffline) {
        setOnline(true);
        setRestoring(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          setRestoring(false);
        }, 3000);
      }
    };

    const handleOffline = () => {
      setOnline(false);
      setExplicitOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await api.get("/health", {
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!online || explicitOffline) {
          setOnline(true);
          setExplicitOffline(false);
          setRestoring(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setRestoring(false), 3000);
        }
      } catch (err) {
        if (!explicitOffline) {
          setOnline(false);
          setExplicitOffline(true);
        }
      }
    };

    // Initial check
    checkHealth();
    
    // Set up polling only if we're not explicitly offline
    if (!explicitOffline) {
      const id = setInterval(checkHealth, pollMs);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        if (timer.current) clearTimeout(timer.current);
        clearInterval(id);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pollMs, online, explicitOffline]);

  return { 
    online: online && !explicitOffline, 
    restoring,
    explicitOffline 
  };
}