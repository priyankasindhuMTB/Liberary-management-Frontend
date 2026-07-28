import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import toast from "react-hot-toast";

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

export const listenForLiveMessages = () => {
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "New Notification";
    const body = payload.notification?.body || "";
    const targetUrl = payload.data?.url || "/";

    // In-app toast (always visible while logged in)
    toast(`${title}\n${body}`, {
      icon: "🔔",
      duration: 6000,
      style: { whiteSpace: "pre-line", maxWidth: 420 },
    });

    // Browser notification while tab is open
    if (Notification.permission === "granted") {
      const n = new Notification(title, {
        body,
        icon: "/vite.svg",
        data: { url: targetUrl },
      });
      n.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (targetUrl) window.location.href = targetUrl;
        n.close();
      };
    }
  });
};
