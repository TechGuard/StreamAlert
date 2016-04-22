var popupElm = $('#popup');

window.popup = {
    buildPage: function() {
        var background = chrome.extension.getBackgroundPage();

        background.getOptions(function(options) {
            popup.showStreamers(background.streams, options);
        });
    },
    showStreamers: function(streams, options) {
        var output = '';
        var firstGame = true;
        
        for(var game in streams){
            var isNull = game === 'null';

            if(options.category) {

                if (firstGame) {
                    firstGame = false;
                } else {
                    output += '<hr>\n';
                }

                output += '\
                       <div class="game-header">\n\
                            <a title="' + (isNull ? 'Uncategorized' : game) + '"' + (isNull ? '' : ' href="http://www.twitch.tv/directory/game/' + encodeURIComponent(game) + '"') + '>\n\
                                <div class="boxart">\n\
                                    <img ' + createImg("game", "https://static-cdn.jtvnw.net/ttv-boxart/" + encodeURIComponent(game) + "-60x83.jpg") + ' width="60" height="83">\n\
                                </div>\n\
                                <div class="title">\n\
                                    <h1>' + (isNull ? 'Uncategorized' : game) + '</h1>\n\
                                </div>\n\
                            </a>\n\
                       </div>\n';
            }

            for(var i = 0; i < streams[game].length; i++){
                var stream = streams[game][i];
                
                output += '\
                           <div class="channel' + (options.preview ? '' : ' no-preview') + '">\n\
                                <a title="' + stream.name + '" href="' + stream.url + '">\n\
                                    <img class="profile" ' + createImg("profile", stream.logo) + ' width="80" height="80">\n\
                                    <div class="info">\n\
                                        <h2>' + stream.name + '</h2>\n\
                                        <h3>' + stream.status + '</h3>\n\
                                    </div>\n';

                if(options.viewcount) {
                    output += '\
                                    <p class="live">\n\
                                        <svg class="svg-glyph_live" height="16px" version="1.1" viewBox="0 0 16 16" width="16px" x="0px" y="0px">\n\
                                            <path clip-rule="evenodd" d="M11,14H5H2v-1l3-3h2L5,8V2h6v6l-2,2h2l3,3v1H11z" fill="red" fill-rule="evenodd"></path>\n\
                                        </svg>\n\
                                        ' + formatNumber(stream.viewers) + '\n\
                                    </p>\n';
                }

                if(options.preview) {
                    output += '\
                                    <img class="preview" ' + createImg("preview", stream.preview) + ' width="360" height="225">\n';
                }

                output += '\
                                </a>\n\
                           </div>\n';
            }
        }

        popupElm.html(output + '<div id="title-resizer" class="game-header"><div class="title"><h1>Undefined</h1></div></div>');

        setTimeout(function() {
            popup.loadImages();
            popup.fixTitles();
        }, 0);
    },
    loadImages: function(){
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
    },
    fixTitles: function() {
        var resizer = $('#title-resizer');
        var titleElm = resizer.find('.title');
        var textElm = titleElm.find('h1');

        $('.title h1').each(function() {
            var size = 28;

            textElm.text($(this).text());

            do {
                textElm.css('font-size', size + 'px').css('line-height', size + 'px');
                size--;
            } while(titleElm.outerHeight() > 60 && size >= 10);

            size++;
            $(this).css('font-size', size + 'px').css('line-height', size + 'px');
        });
    }
};

function createImg(placeholder, link){
    return 'src="' + getURL("img/placeholder-" + placeholder + ".png") + '" lsrc="' + link + '"';
}

function getURL(path) {
    return chrome.extension.getURL(path);
}

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function(){
    var background = chrome.extension.getBackgroundPage();

    if(background.authenticated) {
        if(background.streamersCount > 0) {
            popup.buildPage();
        } else {
            popupElm.html('<p class="no-streams">There are no streamers live right now.</p>');
        }
    } else {
        popupElm.html('<img src="' + getURL("img/connect_dark.png") + '" class="twitch-connect" href="#" />');

        $('.twitch-connect').click(function() {
            background.twitchLogin();
        })
    }
});