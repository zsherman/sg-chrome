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
            console.log($(that.player_iframe).contents());
        }
        else {
            artist_div = $(that.artist_selector)[0];
        }
        return artist_div;
    }

    that.artistDivFinder = function(callback) {
        var selector = that.player_iframe || "body";
        $(selector).bind("DOMSubtreeModified", function() {
            console.log("modified");
            var artist_div = that.getArtistDiv();
            if (artist_div) {
                $(selector).unbind("DOMSubtreeModified");
                that.initListener(callback);
            }
        });
    };


    that.initListener = function(callback) {
        that.updateArtist(callback);
        var watcher = that.change_watch_selector ? $(that.change_watch_selector) : $(that.artist_selector).parent();
        watcher.bind("DOMSubtreeModified",function(){
            that.updateArtist(callback);
        });
    };

    that.updateArtist = function(callback) {
        var artist = that.getCurrentArtist();
        if (artist && artist != that.current_artist) {
            that.current_artist = artist;
            callback(that.current_artist);
        }
    };

    that.getCurrentArtist = function() {
        var artist_div = that.getArtistDiv();
        if (!artist_div) return null;
        return that.cleanArtist(artist_div.text || artist_div.innerHTML);
    };

    that.cleanArtist = function(artist) {
        return artist;
    };

    that.validPage = function() {
        return true;
    };

    that.selectArtist = function(artist_list) {
        if (!artist_list) return;
        for (var i = 0; i < artist_list.length; i++) {
            function clean(title) {
                return title.trim().toLowerCase().replace(/\s/g, '').replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            }
            if (clean(that.current_artist) == clean(artist_list[i].name)) {
                return artist_list[i];
            }
        }
    };

    return that;
};

var HypemParser = function() {
    var that = BaseParser();
    that.artist_selector = "#player-nowplaying a";
    that.listing_div = $(".track_name .artist");
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

var SongzaParser = function() {
    var that = BaseParser();
    that.artist_selector = ".miniplayer-info-artist-name a";
    that.change_watch_selector = ".player-wrapper";

    that.cleanArtist = function(artist) {
        if (artist.indexOf("by ") != -1) {
            return artist.substring(3);
        }

        return null;
    };

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

    that.validPage = function() {
        var category = $("#eow-category a")[0].text;
        if (category == "Music") {
            return true;
        }
        return false;
    };

    that.cleanArtist = function(artist) {
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
    that.client_id = "MzkyODY1fDE0MDM4ODEwMDA";

    that.getArtistResults = function(artist, callback) {
        var url = that.api_url + "/performers?" + $.param({q : artist});
        $.getJSON(url, function(data) {
            if (data.performers.length != 0) {
                callback(data.performers);
            }
            else {
                callback(null);
            }
        });
    };

    that.getArtistIdResults = function(artist, callback) {
        var url = that.api_url + "/performers?" + $.param({q : artist});
        $.getJSON(url, function(data) {
            callback(data.performers[0]);
        });
    };

    that.getEventResults = function(artist_id, callback) {
        var url = that.api_url + "/events?" + $.param({"performers.id" : artist_id});
        $.getJSON(url, function(data) {
            callback(data);
        });
    };

    that.getGeoEventResults = function(artist_id, callback) {
        var url = that.api_url + "/events?" + $.param({"performers.id" : artist_id, "geoip" : true});
        $.getJSON(url, function(data) {
            callback(data);
        });
    };

    that.getRelatedResults = function(artist_id, callback) {
        var url = that.api_url + "/recommendations/performers?" + $.param({"performers.id" : artist_id, "client_id" : that.client_id});
        $.getJSON(url, function(data) {
            callback(data);
        }).fail(function(data) {
            callback(data);
        }
        );
    };

    return that;
};


var App = function(hostname) {
    var that = {};
    that.hostname = hostname;
    that.api = new API();
    that.artist_data;
    that.event_data;
    that.geo_event_data;
    that.related_data;

    if (hostname == "www.rdio.com") {
        that.parser = new RdioParser();
    }
    else if (hostname == "hypem.com") {
        that.parser = new HypemParser();
    }
    else if (hostname == "songza.com") {
        that.parser = new SongzaParser();
    }
    else if (hostname == "play.spotify.com") {
        that.parser = new SpotifyParser();
    }
    else if (hostname == "www.youtube.com") {
        that.parser = new YoutubeParser();
    }

    that.init = function() {
        // $.subscribe('updated', that.artistSelected.bind(that));
        that.initButtonListener(that.onButtonClick.bind(that));
        that.parser.artistDivFinder(that.artistUpdated.bind(that));
        that.parser.init(that.artistUpdated.bind(that));
        that.parser.initButtons();
    };

    that.initButtonListener = function(callback) {
        chrome.runtime.onMessage.addListener(callback);
    };

    that.onButtonClick = function(request, sender, sendResponse) {
        console.log("button click");
        $.publish('omnibox', {message: 'SG Chrome Button Was Clicked'});
    };

    that.clear = function() {
        that.artist_data = that.event_data = that.related_data = that.geo_event_data = null;
    };

    that.artistUpdatedById = function(artist_id) {
        that.clear();
        that.api.getArtistIdResults(artist, that.artistRetrieved.bind(that));
    };

    that.artistUpdated = function(artist) {
        that.clear();
        that.api.getArtistResults(artist, that.artistListRetrieved.bind(that));
    };

    that.artistListRetrieved = function(artist_list) {
        var artist_data = that.parser.selectArtist(artist_list);
        if (artist_data) {
            that.artistRetrieved(artist_data);
        }
        else {
            chrome.runtime.sendMessage({active : false});
        }
    };

    that.artistRetrieved = function(artist_data) {
        that.artist_data = artist_data;
        that.api.getEventResults(artist_data.id, that.eventRetrieved);
        that.api.getGeoEventResults(artist_data.id, that.geoEventRetrieved);
        that.api.getRelatedResults(artist_data.id, that.relatedRetrieved);
    };

    that.eventRetrieved = function(event_data) {
        that.event_data = event_data;
        if (!that.event_data) {
            that.related_data = {err : "No event response"};
        }
        that.tryPublish();
    };

    that.geoEventRetrieved = function(event_data) {
        that.geo_event_data = event_data;
        if (!that.geo_event_data) {
            that.related_data = {err : "No geo response"};
        }
        that.tryPublish();
    };

    that.relatedRetrieved = function(related_data) {
        that.related_data = related_data;
        if (!that.related_data) {
            that.related_data = {err : "No related artists found"};
        }
        that.tryPublish();
    }

    that.tryPublish = function() {
        if (!(that.artist_data && that.event_data && that.related_data && that.geo_event_data)) return;
        var message = {all_events: that.event_data, local_events: that.geo_event_data, artist: that.artist_data, related: that.related_data};
        console.log(that.event_data.events.length != 0);
        chrome.runtime.sendMessage({active : that.geo_event_data.events.length != 0});
        $.publish('retrieved', message);
    };

    return that;
};

var sg_app = new App(location.hostname);
sg_app.init();

