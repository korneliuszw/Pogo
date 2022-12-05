import { Inertia } from "@inertiajs/inertia"
import { useCallback } from "react"

console.log(import.meta.env)

const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: import.meta.env['VITE_NOTIFICATION_PUBLIC_KEY']
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
            .then(navigator.serviceWorker.ready)
            .then(f => subscribeToPush(f, notificationResult))
            .then(sendToServer)
        if (!notificationResult) return
    }, [sendToServer, subscribeToPush])

    const askPermission = useCallback(() => {
        Notification.requestPermission().then(registerWorker)
    }, [registerWorker])

    return {
        askPermission
    }
}
