// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

// Your real configuration keys pulled from your project dashboard screen
const firebaseConfig = {
  apiKey: "AIzaSyCQWoZIeh3J3SqPRXr8x5Uq57CCDnkYanw",
  authDomain: "librarymanagement-af34f.firebaseapp.com",
  projectId: "librarymanagement-af34f",
  storageBucket: "librarymanagement-af34f.firebasestorage.app",
  messagingSenderId: "900586787761",
  appId: "1:900586787761:web:1be9fa28247c17d18b2390"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

/**
 * Requests browser push notification permission and handles saving
 * the generated token to the authenticated administrator account profile.
 * @param {string} adminEmail - The logged-in administrator's email address
 */
// firebaseConfig.js — handleSubmit fix
export const syncNotificationPermission = async () => { // ← email parameter hatao
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const deviceToken = await getToken(messaging, {
        vapidKey: "BBxnCqCESJ2XC3Ex8yB2LWq6N6TC4BM--pnjr_ALXIhPWkRhSvcdHINBzn6H_4sLYTbySQi3usUxN5UwCb6Rdkk"
      });


      if (deviceToken) {
        console.log("🎯 FCM Token:", deviceToken);

        const API_URL = import.meta.env.VITE_API_URL;
        const authToken = localStorage.getItem("token");

        // ✅ Sirf fcmToken bhejo — backend JWT se admin identify karega
        await axios.put(
          `${API_URL}/api/admin/update-fcm-token`,
          { fcmToken: deviceToken },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log("✅ FCM Token saved!");
      }
    }
  } catch (error) {
    console.error("❌ FCM Error:", error.message);
  }
};
// Listener fallback for active browser windows to catch alerts live
// firebaseConfig.js
export const listenForLiveMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("📨 Live message:", payload);

    // Simple browser notification dikhao
    if (Notification.permission === "granted") {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/logo.png"
      });
    }
  });
};