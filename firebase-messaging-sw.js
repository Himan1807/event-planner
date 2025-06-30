importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBur0RoviX8Y-gckEJ7nuKebavXaPLLtoQ",
    authDomain: "event-planner-2b116.firebaseapp.com",
    projectId: "event-planner-2b116",
    storageBucket: "event-planner-2b116.firebasestorage.app",
    messagingSenderId: "175124040884",
    appId: "1:175124040884:web:d4cc7ed283c697416e5be1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/Images/icon1-192.png'
    });
});