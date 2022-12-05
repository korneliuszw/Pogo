self.addEventListener('push', (event) => {
    const {msg_up, msg_down, timestamp} = event.data.json()
    const chain  = self.registration.showNotification(msg_up, {
        body: msg_down,
        timestamp: timestamp
    })
    event.waitUntil(chain)
})