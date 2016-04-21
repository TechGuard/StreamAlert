
// Variables
var tickIntervalId = 0;
var authenticated = false;
var sendLoginRequest = true;

var streams = {};
var streamersCount = 0;
var streamsHistory = [];
var notificationLinks = [];


// Update popup window and icon
function updateStatus() {
    var img = 'icon-19-off';

    if(authenticated) {
        if(streamersCount > 5){
            img = 'icon-19-on';
        } else {
            img = 'icon-19-' + streamersCount;
        }
    }

    chrome.browserAction.setIcon({ 'path': 'img/' + img + '.png' });
}

// Update streams
function updateStreams(data) {
    var newStreams = [];
    var newStreamersCount = 0;
    var timestamp = new Date().getTime();

    if(data.streams)
    for(var stream in data.streams){
        stream = data.streams[stream];

        var channel = {
            id: stream.channel._id,
            name: stream.channel.display_name,
            status: stream.channel.status,
            logo: (stream.channel.logo === null ? "http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png" : stream.channel.logo),
            preview: stream.preview.medium,
            viewers: stream.viewers,
            url: stream.channel.url
        };

        if(channel['status'] == undefined){
            channel['status'] = 'No description available.';
        }

        if(!newStreams[stream.game]){
            newStreams[stream.game] = [];
        }

        newStreamersCount++;
        newStreams[stream.game].push(channel);

        // Send Notification
        if(streamsHistory[channel.name] && timestamp - streamsHistory[channel.name] >= ALERT_IGNORE_TIME * 60 * 1000) {
            delete streamsHistory[channel.name];
        }

        if(!streamsHistory[channel.name]) {
            sendNotification(channel);
        }

        streamsHistory[channel.name] = timestamp;
    }

    streams = newStreams;
    streamersCount = newStreamersCount;
}

// Update tick
function update() {
    Twitch.getStatus(function(err, status) {
        authenticated = status.authenticated;

        if (authenticated) {
            Twitch.api({url: 'streams/followed'}, function(err, data) {
                if(!err){
                    updateStreams(data);
                }

                updateStatus();
            });

            return;
        }

        if(sendLoginRequest) {
            sendLoginRequest = false;

            twitchLogin();
        }

        updateStatus();
    });
}

// Handle login request
function twitchLogin() {
    Twitch.login({
        popup: true,
        scope: ['user_read'],
        redirect_uri: chrome.extension.getURL('verify.html')
    });
}

// New verified session
function verifiedSession(session){
    Twitch._config.session = session;
    Twitch.events.emit('auth.login');

    restart();
}

function restart(){
    clearInterval(tickIntervalId); // clear
    tickIntervalId = setInterval(update, REFRESH_AMOUNT * 1000); // set
    update(); // no delay
}

// Handle notifications
function sendNotification(channel){
    var notificationId = 'channel_live_' + channel.id;

    chrome.notifications.create(notificationId, {
        type: 'image',
        iconUrl: channel.logo,
        title: channel.name + ' is now live!',
        message: channel.status,
        imageUrl: channel.preview,
        buttons: [ {
            title: 'Watch',
            iconUrl: 'img/icon-play.png'
        } ]
    }, function(){
        notificationLinks[notificationId] = channel.url;
    });
}

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    if(buttonIndex !== 0 || !notificationLinks[notificationId]){
        return;
    }

    chrome.tabs.create({ 'url': notificationLinks[notificationId] });
    chrome.notifications.clear(notificationId, function(){ });
});

// Login event
Twitch.events.addListener('auth.login', function() {
    authenticated = true;
    sendLoginRequest = true;
    console.log("Authenticated: " + Twitch.getToken());
});

// Initialize Twitch SDK
Twitch.init({clientId: CLIENT_ID}, function(err, status) {
    console.log("Twitch SDK Initialized");

    tickIntervalId = setInterval(update, REFRESH_AMOUNT * 1000);
    update();
});