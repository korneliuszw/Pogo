self.addEventListener('push', (event) => {
    const msg = event.data.text()
    const chain  = self.registration.showNotification("Przypomnienie", {
        body: `Zadanie ${msg} zostało rozpoczęte`
    })
    event.waitUntil(chain)
})