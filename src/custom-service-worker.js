importScripts('./ngsw-worker.js');

(function () {
    'use strict';
    /*
    self.addEventListener('notificationclick', (event) => {
        event.notification.close()
        // This looks to see if the current is already open and
        // focuses if it is
        event.waitUntil(
            clients.matchAll({
            type: "window"
            })
            .then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url == '/me/notifications' && 'focus' in client)
                return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow('/me/notifications');
            }
            })
        );
    });
    */
}    
());