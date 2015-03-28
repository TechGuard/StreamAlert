
// Variables
var authenticated = false;
var streamersCount = 0;


// Update popup window and icon
function updateStatus() {
    var popup = "";
    var img = 'icon-19-off';

    if(authenticated) {
        if(streamersCount > 5){
            img = 'icon-19-on';
        } else {
            img = 'icon-19-' + streamersCount;
        }

        if(streamersCount > 0){
            popup = "popup.html";
        }
    }

    chrome.browserAction.setPopup({ popup: popup });
    chrome.browserAction.setIcon({ 'path': 'img/' + img + '.png' });
}

// Update streams
function updateStreams(data) {

}

// Update tick
function update() {
    setTimeout(update, REFRESH_AMOUNT * 1000);

    Twitch.getStatus(function(err, status) {
        authenticated = status.authenticated;

        if (authenticated) {
            Twitch.api({url: 'streams/followed'}, function(err, data) {
                if(err){
                    console.error(err);
                    return;
                }

                updateStreams(data);
                updateStatus();
            });
        } else {
            Twitch.login({
                popup: true,
                scope: ['user_read'],
                redirect_uri: chrome.extension.getURL('verify.html')
            });

            updateStatus();
        }

    })
}

// Login event
Twitch.events.addListener('auth.login', function() {
    authenticated = true;
    console.log("Authenticated: " + Twitch.getToken());
});

// Initialize Twitch SDK
Twitch.init({clientId: CLIENT_ID}, function(err, status) {
    console.log("Twitch SDK Initialized");

    update();
});