var HypemParser = function() {
    this.current_artist;
};
HypemParser.prototype.getArtists = function() {
    var artists = [];
    $(".track_name .artist").each(function(i, artist) {
        artists.push(artist.text);
    });
    return artists;
};
HypemParser.prototype.getCurrentArtist = function() {
    var artist_div = $("#player-nowplaying a")[0];
    if (!artist_div) return null;

    return artist_div.text;
};
HypemParser.prototype.initListener = function() {
    var that = this;
    this.updateArtist();
    $('#player-nowplaying').bind("DOMSubtreeModified",function(){
        that.updateArtist();
    });
};
HypemParser.prototype.updateArtist = function() {
    var artist = this.getCurrentArtist();
    if (artist && artist != this.current_artist) {
        this.current_artist = artist;
        this.artistUpdated();
    }
};
HypemParser.prototype.artistUpdated = function() {
    console.log("Now playing", this.current_artist);
};

var parser = new HypemParser();
console.log(parser.getArtists());
parser.initListener();
