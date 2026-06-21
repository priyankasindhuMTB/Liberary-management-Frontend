  importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

  firebase.initializeApp({
    apiKey: "AIzaSyAHGf51Dj9iOO1L_NYaFacDhqEyVjnKbIY",
    authDomain: "librarymanagement-85ba3.firebaseapp.com",
    projectId: "librarymanagement-85ba3",
    storageBucket: "librarymanagement-85ba3.firebasestorage.app",
    messagingSenderId: "984114632226",
    appId: "1:984114632226:web:46f265cbe1beb798fa5c7b",
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(
      payload.notification?.title || "New Notification",
      {
        body: payload.notification?.body || "",
        icon: "/vite.svg",
        data: payload,
      }
    );
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    // ✅ FIXED
  const url = event.notification?.data?.FCM_MSG?.data?.url
    || event.notification?.data?.url
    || '/';

    event.waitUntil(
      clients.openWindow(url)
    );
  });