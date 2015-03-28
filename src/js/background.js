
// Update tick
function update() {
    setTimeout(update, REFRESH_AMOUNT * 1000);

    Twitch.getStatus(function(err, status) {

        if (!status.authenticated) {
            Twitch.login({
                popup: true,
                scope: ['user_read'],
                redirect_uri: chrome.extension.getURL('verify.html')
            });
        }

    })
}

// Login event
Twitch.events.addListener('auth.login', function() {
    console.log("Authenticated: " + Twitch.getToken());
});

// Initialize Twitch SDK
Twitch.init({clientId: CLIENT_ID}, function(err, status) {
    console.log("Twitch SDK Initialized");

    update();
});