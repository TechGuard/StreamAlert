
// Initialize Twitch SDK
Twitch.init({ clientId: CLIENT_ID, checkAuthentication: true }, function(err, status) {
    console.log("Twitch SDK Initialized");

    if (status.authenticated) {

        document.getElementById('success').style.display = 'block';
        console.log("Authenticated: " + status.token);
    } else {

        document.getElementById('fail').style.display = 'block';
        console.log("Failed to authenticate: " + status.error + " (" + status.errorDescription + ")");
    }
});