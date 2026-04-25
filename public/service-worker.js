// service-worker.js

self.addEventListener("push", (event) => {
    // The Web Push API sends the entire options object in the 'push' event's data.
    // The payload we send from the server is: { title: "...", options: { body: "...", data: { url: "..." } } }
    
    // 1. Parse the incoming JSON data
    const { title, options } = event.data.json();

    // 2. Use event.waitUntil to keep the service worker alive until the notification is shown
    event.waitUntil(
        self.registration.showNotification(title, {
            // Spread the options object to pull out body, icon, vibrate, etc.
            ...options,
            // Ensure the data object is correctly structured for the click handler
            data: options.data 
        })
    );
});


self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    
    // Get the URL we stored in the notification data (e.g., "/community/post-id")
    const targetUrl = event.notification.data.url;
    
    // Ensure the target URL is absolute for navigation
    const absoluteTargetUrl = new URL(targetUrl, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            
            let matchingClient = null;
            let openClient = null;

            // 1. Look for an existing client (tab) on the same origin
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // Check if the client is on the same origin as the service worker
                if (client.url.startsWith(self.location.origin)) {
                    openClient = client; // Keep track of an open client
                    
                    // Prioritize finding an exact match (e.g., if the user is already on the post page)
                    if (client.url === absoluteTargetUrl) {
                        matchingClient = client;
                        break;
                    }
                }
            }

            // 2. Decide the action:
            if (matchingClient) {
                // Case A: The user is already on the target page. Just focus the tab.
                return matchingClient.focus();
            } else if (openClient) {
                // Case B: An app tab is open but on a different page. Focus it and navigate.
                openClient.focus();
                return openClient.navigate(absoluteTargetUrl);
            } else {
                // Case C: No app tabs are open. Open a new window.
                return clients.openWindow(absoluteTargetUrl);
            }
        })
    );
});