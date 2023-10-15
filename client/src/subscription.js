// Convert the VAPID key from base64 URL-safe format to a Uint8Array
const convertedVapidKey = urlBase64ToUint8Array(process.env.REACT_APP_PUBLIC_VAPID_KEY);

/**
 * Asks the user for notification permission.
 * @returns A promise that resolves to 'granted' if permission is granted, or false if denied.
 */
export function askPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });
        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(result => {
        if (result !== 'granted') {
            alert('Notification permission denied. If it was by mistake, turn it on from the settings.');
            return false;
        }
        return true;
    });
}

/**
 * Subscribes the user to push notifications.
 */
export function subscribeUserToPush() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function (registration) {
            if (!registration.pushManager) {
                console.warn('Push manager unavailable.');
                return;
            }

            registration.pushManager.getSubscription().then(function (existingSubscription) {
                if (existingSubscription === null) {
                    console.info('No push subscription detected. Making one...');
                    const subscribeOptions = {
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey,
                    };
                    registration.pushManager
                        .subscribe(subscribeOptions)
                        .then(function (newSubscription) {
                            console.log('New push subscription added.');
                            return sendSubscription(newSubscription);
                        })
                        .catch(function (e) {
                            if (Notification.permission !== 'granted') {
                                console.info('Permission was not granted.');
                            } else {
                                console.error('An error occurred during the subscription process.', e);
                            }
                        });
                } else {
                    console.info('Existing subscription detected.');
                    return sendSubscription(existingSubscription);
                }
            });
        });
    }
}

/**
 * Unsubscribes the user from push notifications.
 */
export function unsubscribeUser() {
    removeSubscription().then(function () {
        navigator.serviceWorker.ready.then(function (registration) {
            registration.pushManager
                .getSubscription()
                .then(function (subscription) {
                    if (subscription) {
                        return subscription.unsubscribe();
                    }
                })
                .catch(function (error) {
                    console.error('Error unsubscribing', error);
                })
                .then(function () {
                    console.info('User is unsubscribed.');
                });
        });
    });
}

/**
 * Removes the push subscription on the server.
 */
function removeSubscription() {
    return fetch('/api/notifications/unsubscribe', {
        method: 'POST',
    });
}

/**
 * Sends the push subscription to the server.
 * @param {Object} subscription - The push subscription.
 */
function sendSubscription(subscription) {
    return fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Converts a base64 URL-safe string to a Uint8Array.
 * @param {String} base64String - The base64 URL-safe string to convert.
 * @returns A Uint8Array containing the converted data.
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
