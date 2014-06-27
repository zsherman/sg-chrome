var o = $({});

$.subscribe = function() {
    o.on.apply(o, arguments);
};

$.unsubscribe = function() {
    o.off.apply(o, arguments);
};

$.publish = function() {
    o.trigger.apply(o, arguments);
};

var BaseParser = function() {
    var that = {};
    that.current_artist = null;
    that.artist_div =  null;
    that.track_div =  null;
    that.listing_div =  null;
    that.artist_selector = null;

    that.getCurrentArtist = null;
    that.initButtons = null;

    that.init = function() {
        return true;
    };

    that.initButtons = function() {
        return true;
    }

    that.getArtists = function() {
        var artists = [];
        that.listing_div.each(function(i, artist) {
            artists.push(artist.text);
        });
        return artists;
    };

    that.getArtistDiv = function() {
        var artist_div;
        if (that.player_iframe) {
            artist_div = $(that.player_iframe).contents().find(that.artist_selector)[0];
        }
        else {
            artist_div = $(that.artist_selector)[0];
        }
        return artist_div;
    }

    that.artistDivFinder = function(callback) {
        var selector = that.player_iframe || "body";
        $(selector).bind("DOMSubtreeModified", function() {
            var artist_div = that.getArtistDiv();
            if (artist_div) {
                $(selector).unbind("DOMSubtreeModified");
                that.initListener(callback);
            }
        });
    };


    that.initListener = function(callback) {
        that.updateArtist(callback);
        $(that.artist_selector).parent().bind("DOMSubtreeModified",function(){
            that.updateArtist(callback);
        });
    };

    that.updateArtist = function(callback) {
        var artist = that.getCurrentArtist();
        console.log(artist);
        if (artist && artist != that.current_artist) {
            that.current_artist = artist;
            callback(that.current_artist);
        }
    };

    that.getCurrentArtist = function() {
        var artist_div = that.getArtistDiv();
        console.log(artist_div);
        if (!artist_div) return null;
        return that.clean_artist(artist_div.text || artist_div.innerHTML);
    };

    that.clean_artist = function(artist) {
        return artist;
    };

    that.valid_page = function() {
        return true;
    };

    return that;
};

var HypemParser = function() {
    var that = BaseParser();
    that.artist_selector = "#player-nowplaying a";
    that.listing_div = $(".track_name .artist");

    that.initButtons = function() {
        $(".section-track").each(function(i, div) {
            var tools = $(div).find(".tools")[0];
            $(tools).prepend("<li class='playdiv' style='width: 26px; height : 26px; margin: 6px; background-color: red;'><a class='icon-toggle'></a></li>");
        });
    };
    return that;
};

var RdioParser = function() {
    var that = BaseParser();
    that.artist_selector = ".text_metadata .artist_title";
    return that;
};

// DOES NOT WORK YET, STUPID IFRAME
var SpotifyParser = function() {
    var that = BaseParser();
    that.artist_selector = "#track-artist a";
    that.player_iframe = "#app-player";
    return that;
};

var YoutubeParser = function() {
    var that = BaseParser();
    that.artist_selector = "#eow-title";

    that.init = function(callback) {
        setInterval(function() {
            that.updateArtist(callback);
        }, 500);
    };

    that.valid_page = function() {
        var category = $("#eow-category a")[0].text;
        if (category == "Music") {
            return true;
        }
        return false;
    };

    that.clean_artist = function(artist) {
        if (artist.indexOf("-") != -1) {
            return artist.split("-")[0].trim();
        }

        return null;
    };
    return that;
};

var API = function() {
    var that = {};
    that.api_url = "http://api.seatgeek.com/2";

    that.getArtistResults = function(artist, callback) {
        var url = that.api_url + "/performers?" + $.param({q : artist});
        console.log(url);
        $.getJSON(url, function(data) {
            console.log(data);
            if (data.performers.length != 0) {
                callback(data.performers[0]);
            }
            else {
                callback(null);
            }
        });
    };

    that.getEventResults = function(artist_id, callback) {
        var url = that.api_url + "/events?" + $.param({"performers.id" : artist_id});
        $.getJSON(url, function(data) {
            callback(data);
        });
    };

    return that;
};

var App = function(hostname) {
    var that = {};
    that.hostname = hostname;
    that.api = new API();
    that.artist_data;
    that.event_data;

    if (hostname == "www.rdio.com") {
        that.parser = new RdioParser();
    }
    else if (hostname == "hypem.com") {
        that.parser = new HypemParser();
    }
    else if (hostname == "play.spotify.com") {
        that.parser = new SpotifyParser();
    }
    else if (hostname == "www.youtube.com") {
        that.parser = new YoutubeParser();
    }

    that.init = function() {
        if (!that.parser.valid_page()) {
            return;
        }
        that.parser.artistDivFinder(that.artistUpdated.bind(that));
        that.parser.init(that.artistUpdated.bind(that));
        that.parser.initButtons();
    };

    that.artistUpdated = function(artist) {
        console.log("In app artist updated ", artist);
        that.api.getArtistResults(artist, that.artistRetrieved.bind(that));
    };

    that.artistRetrieved = function(artist_data) {
        if (artist_data) {
            that.artist_data = artist_data;
            that.api.getEventResults(artist_data.id, that.eventRetrieved);
        }
    };

    that.eventRetrieved = function(event_data) {
        if (event_data) {
            that.event_data = event_data;
            $.publish('retrieved', {event: that.event_data, artist: that.artist_data});
            console.log(event_data);
        };
    };

    return that;
};
var app = new App(location.hostname);
app.init();

