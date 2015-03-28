window.popup = {
    buildPage: function() {
        var streams = chrome.extension.getBackgroundPage().streams;

        if(streams.length > 0) {
            this.showStreamers(streams);
        } else {
            document.body.innerHTML = '<p class="no-streams">Sorry, nobody is live at the moment.</p>';
        }
    },
    showStreamers: function(streams) {
        var output = '';
        var firstGame = true;
        
        for(var game in streams){
            var isNull = game === 'null';

            if(firstGame){
                firstGame = false;
            } else {
                output += '<hr>';
            }
            output += '<div class="game-header">\n\
                            <a title="' + (isNull ? 'Uncategorized' : game) + '"' + (isNull ? '' : ' href="http://www.twitch.tv/directory/game/' + encodeURIComponent(game) + '"') + '>\n\
                                <img ' + createImg("game", "http://static-cdn.jtvnw.net/ttv-logoart/" + encodeURIComponent(game) + "-120x72.jpg") + '>\n\
                                <div class="title">\n\
                                    <h1>' + (isNull ? 'Uncategorized' : game) + '</h1>\n\
                                </div>\n\
                            </a>\n\
                       </div>';
            
            for(var i = 0; i < streams[game].length; i++){
                var stream = streams[game][i];
                
                output += '<div class="channel">\n\
                                <a title="' + stream.name + '" href="' + stream.url + '">\n\
                                    <img ' + createImg("profile", stream.logo) + ' width="80" height="80">\n\
                                    <div class="info">\n\
                                        <h2>' + stream.name + '</h2>\n\
                                        <h3>' + stream.status + '</h3>\n\
                                    </div>\n\
                                    <img ' + createImg("preview", stream.preview) + ' width="360" height="225">\n\
                                    <p class="live">\n\
                                        <img src="img/live.png">' + stream.viewers + '\n\
                                    </p>\n\
                                </a>\n\
                           </div>';
            }
        }
        
        this.loadImages();
        document.body.innerHTML = output;
    },
    loadImages: function(){
        setTimeout(function(){
            $('img').each(function(){
                var thisImage = this;
                var lsrc = $(thisImage).attr('lsrc') || '';
                
                if(lsrc.length > 0){
                    var img = new Image();
                    img.src = lsrc;
                                        
                    $(img).load(function(){
                        thisImage.src = this.src;
                    });
                    $(thisImage).removeAttr('lsrc');
                }
            });
            $('.background').each(function(){
                var thisDiv = this;
                var lstyle = $(thisDiv).attr('lstyle') || '';
                
                if(lstyle.length > 0){
                    $(thisDiv).removeAttr('lstyle');
                    $(thisDiv).attr('style', lstyle);
                }
            });
        }, 50);
    }
};

function createImg(placeholder, link){
    return 'src="' + chrome.extension.getURL("img/placeholder-" + placeholder + ".png") + '" lsrc="' + link + '"';
}

$(document).ready(function(){
    if(chrome.extension.getBackgroundPage().authenticated) {
        popup.buildPage();
    } else {
        document.body.innerHTML = '<img src="' + chrome.extension.getURL("img/connect_dark.png") + '" class="twitch-connect" href="#" />';

        $('.twitch-connect').click(function() {
            chrome.extension.getBackgroundPage().twitchLogin();
        })
    }
});