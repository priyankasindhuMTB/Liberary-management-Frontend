// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 👈 Paste your real credentials here too for background message handling
firebase.initializeApp({
  apiKey: "AIzaSyCQWoZieh3J3SqPRxr8x5Uq57CCDnkYanw",
  authDomain: "librarymanagement-af34f.firebaseapp.com",
  projectId: "librarymanagement-af34f",
  storageBucket: "librarymanagement-af34f.firebasestorage.app",
  messagingSenderId: "900586787761",
  appId: "1:900586787761:web:1be9fa28247c17d18b2390"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});