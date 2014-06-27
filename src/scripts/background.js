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

    that.getCurrentArtist = null;
    that.initButtons = null;

    that.getArtists = function() {
        var artists = [];
        that.listing_div.each(function(i, artist) {
            artists.push(artist.text);
        });
        return artists;
    };


    that.initListener = function(callback) {
        that.updateArtist(callback);
        console.log(that.track_div);
        that.track_div.bind("DOMSubtreeModified",function(){
            that.updateArtist(callback);
        });
    };

    that.updateArtist = function(callback) {
        var artist = that.getCurrentArtist();
        console.log
        if (artist && artist != that.current_artist) {
            that.current_artist = artist;
            callback(that.current_artist);
        }
    };

    return that;
};

var HypemParser = function() {
    var that = BaseParser();
    that.track_div = $('#player-nowplaying');
    that.listing_div = $(".track_name .artist");

    that.getCurrentArtist = function() {
        var artist_div = $("#player-nowplaying a")[0];
        if (!artist_div) return null;

        return artist_div.text;
    };

    that.initButtons = function() {
        $(".section-track").each(function(i, div) {
            var tools = $(div).find(".tools")[0];
            $(tools).prepend("<li class='playdiv' style='width: 26px; height : 26px; margin: 6px; background-color: red;'><a class='icon-toggle'></a></li>");
        });
    };
    return that;
};

var API = function() {
    var that = {};
    that.api_url = "http://api.seatgeek.com/2";

    that.getArtistResults = function(artist, callback) {
        var url = that.api_url + "/performers?" + $.param({q : artist});
        $.getJSON(url, function(data) {
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

var App = function() {
    var that = {};
    that.parser = new HypemParser();
    that.api = new API();
    that.artist_data;
    that.event_data;

    that.init = function() {
        that.parser.initListener(that.artistUpdated.bind(that));
        that.parser.initButtons();
    };

    that.artistUpdated = function(artist) {
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

var app = new App();
app.init();

