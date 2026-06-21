import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

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
  console.log("🚀 syncNotificationPermission started");
  try {
    // 1. Get the auth token FIRST to see if a user is logged in
    const authToken = localStorage.getItem("token");
    console.log("AUTH TOKEN:", authToken);

    // If there is no logged-in user, DO NOT try to update the backend
    if (!authToken) {
      console.log("⚠️ No logged-in user found. Skipping backend FCM registration.");
      return; 
    }

    const permission = await Notification.requestPermission();
    console.log("PERMISSION:", permission);

    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log("SERVICE WORKER:", registration);

    await navigator.serviceWorker.ready;
    console.log("✅ Service Worker Ready");

    const token = await getToken(messaging, {
      vapidKey: "BKOfMx3hiubcA-XqdjQX4CtNXpjurxaNKRMnRbZJJCOMqgdXfxoIl4TV4cSNPGge23QZvwHIs-31mAHVVmcLTYM",
      serviceWorkerRegistration: registration,
    });

    console.log("✅ FCM Token:", token);

    // 2. Since we already verified authToken exists above, we can safely make the API call
    if (token) {
      const API_URL = import.meta.env.VITE_API_URL;

      await axios.put(
        `${API_URL}/api/admin/update-fcm-token`,
        { fcmToken: token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("✅ FCM token saved to backend", token);
    }
  } catch (error) {
    console.error("❌ FULL FCM ERROR:", error);
    console.error("❌ ERROR CODE:", error.code);
    console.error("❌ ERROR MESSAGE:", error.message);
  }
};

export const listenForLiveMessages = () => {
  return onMessage(messaging, (payload) => {
    console.log("🔥 FOREGROUND MESSAGE:", payload);
    const title = payload.notification?.title || "New Notification";
    const body = payload.notification?.body || "";
    
    // Console output structure ke hisab se exact custom url extract karna:
    const targetUrl = payload.data?.url || payload.fcmOptions?.link || "/";

    if (Notification.permission === "granted") {
      // 1. Notification trigger points with clean metadata payload bindings
      const foregroundNotification = new Notification(title, { 
        body, 
        icon: "/vite.svg",
        data: { url: targetUrl } // Meta data reference wrap kiya
      });

      // 2. ⚡ CLICK HANDLER (Yeh ab tak missing tha!)
      foregroundNotification.onclick = (event) => {
        event.preventDefault(); // Stop default browser event triggers
        
        // Window window window focus management setup handle karna
        window.focus();
        
        // Dynamic path configuration structure processing array location route check redirect
        window.location.href = targetUrl; 
        
        foregroundNotification.close();
      };
    }
  });
};