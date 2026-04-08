"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface PushState {
  supported: boolean;
  permission: NotificationPermission | "default";
  subscribed: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "default",
    subscribed: false,
  });
  const [loading, setLoading] = useState(false);

  // Check initial state
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setState((prev) => ({
      ...prev,
      supported,
      permission: supported ? Notification.permission : "default",
    }));

    // Register service worker
    if (supported) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
          // Check existing subscription
          registration.pushManager.getSubscription().then((sub) => {
            setState((prev) => ({ ...prev, subscribed: !!sub }));
          });
        })
        .catch((err) => console.error("SW registration failed:", err));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.supported) {
      toast.error("此瀏覽器不支援推播通知");
      return false;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission === "granted") {
        toast.success("🔔 通知權限已開啟！");
        return true;
      } else if (permission === "denied") {
        toast.error("通知權限被拒絕，請在瀏覽器設定中開啟");
        return false;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.supported]);

  const subscribe = useCallback(async () => {
    if (!state.supported) return;

    const hasPermission = state.permission === "granted" || await requestPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // For demo: use a placeholder VAPID key
      // In production: generate with web-push library and store server-side
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        // Demo mode: just show local notifications
        setState((prev) => ({ ...prev, subscribed: true }));
        toast.success("🔔 本地通知已啟用（Demo 模式）");

        // Schedule a demo notification
        setTimeout(() => {
          registration.showNotification("🧬 Vitrion", {
            body: "這是一則測試通知 — 打卡提醒已就位！",
            icon: "/icons/icon-192.png",
          });
        }, 3000);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      // TODO: Send subscription to backend
      console.log("Push subscription:", JSON.stringify(subscription));
      setState((prev) => ({ ...prev, subscribed: true }));
      toast.success("🔔 推播通知已訂閱");
    } catch (err) {
      console.error("Push subscription failed:", err);
      toast.error("推播通知訂閱失敗");
    } finally {
      setLoading(false);
    }
  }, [state.supported, state.permission, requestPermission]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      setState((prev) => ({ ...prev, subscribed: false }));
      toast.success("🔕 已取消推播通知");
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  }, []);

  // Schedule daily reminder (local)
  const scheduleDailyReminder = useCallback((hour: number = 9, minute: number = 0) => {
    if (!state.subscribed) return;

    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    setTimeout(async () => {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("🧬 每日打卡時間！", {
        body: "別忘了記錄今天的補給品攝取 💊",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      });
    }, delay);

    toast.success(`⏰ 每日提醒已設定: ${hour}:${minute.toString().padStart(2, "0")}`);
  }, [state.subscribed]);

  return {
    ...state,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
    scheduleDailyReminder,
  };
}

// Helper: convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
