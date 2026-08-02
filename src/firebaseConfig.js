import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import toast from "react-hot-toast";
import React from "react";
import FirebaseToast from "./Components/FirebaseToast";

const firebaseConfig = {
  apiKey: "AIzaSyAHGf51Dj9iOO1L_NYaFacDhqEyVjnKbIY",
  authDomain: "librarymanagement-85ba3.firebaseapp.com",
  projectId: "librarymanagement-85ba3",
  storageBucket: "librarymanagement-85ba3.firebasestorage.app",
  messagingSenderId: "984114632226",
  appId: "1:984114632226:web:46f265cbe1beb798fa5c7b",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/* ============================================
   SYNC FCM TOKEN WITH BACKEND
   ============================================ */
export const syncNotificationPermission = async () => {
  try {
    const authToken = localStorage.getItem("token");
    if (!authToken) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey:
        "BKOfMx3hiubcA-XqdjQX4CtNXpjurxaNKRMnRbZJJCOMqgdXfxoIl4TV4cSNPGge23QZvwHIs-31mAHVVmcLTYM",
      serviceWorkerRegistration: registration,
    });

    if (token) {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.put(
        `${API_URL}/api/admin/update-fcm-token`,
        { fcmToken: token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    }
  } catch (error) {
    console.error("FCM setup error:", error.message);
  }
};

/* ============================================
   LISTEN FOR LIVE FOREGROUND MESSAGES
   Shows ONLY the professional in-app toast
   ============================================ */
export const listenForLiveMessages = () => {
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "New Notification";
    const body = payload.notification?.body || "";
    const targetUrl = payload.data?.url || null;

    // Check if tab is visible
    const isTabVisible = !document.hidden;

    if (isTabVisible) {
      // ✅ Show beautiful in-app toast
      toast.custom(
        (t) =>
          React.createElement(FirebaseToast, {
            t,
            title,
            body,
            targetUrl,
          }),
        {
          duration: 6000,
          position: "top-right",
        }
      );
    } else {
      // ✅ Tab hidden → Show browser notification
      if (Notification.permission === "granted") {
        const n = new Notification(title, {
          body,
          icon: "/vite.svg",
          badge: "/vite.svg",
          data: { url: targetUrl },
        });
        n.onclick = (event) => {
          event.preventDefault();
          window.focus();
          if (targetUrl) window.location.href = targetUrl;
          n.close();
        };
      }
    }
  });
};