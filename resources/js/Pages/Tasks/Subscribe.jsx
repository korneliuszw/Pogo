import { Inertia } from "@inertiajs/inertia"
import { useCallback } from "react"

console.log(import.meta.env)

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env['VITE_NOTIFICATION_PUBLIC_KEY'])
}

export const useSubscribe = () => {
    const sendToServer = useCallback((pushSub) => {
        console.log(pushSub)
        return Inertia.post(route('notifications.subscribe'), pushSub, {
            onSuccess: () => console.log('success!')
        })
    }, [])

    const subscribeToPush = useCallback((workerResult) => {
        return workerResult.pushManager.subscribe(subscribeOptions)
    }, [])

    const registerWorker = useCallback((notificationResult) => {
        navigator.serviceWorker
            .register('/worker.js')
            .then(() => navigator.serviceWorker.ready)
            .then(f => subscribeToPush(f, notificationResult))
            .then(sendToServer)
            .catch(console.error)
        if (!notificationResult) return
    }, [sendToServer, subscribeToPush])
    return {
        askPermission: registerWorker
    }
}
