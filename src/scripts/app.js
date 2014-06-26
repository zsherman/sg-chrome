$(function() {
    console.log( "ready!" );

    $extension = $([
      "<div class='sg-extension'>",
      "  <header>",
      "     <div class='logo'></div>",
      "     <span>Childish Gambino</span>",
      "     <div class='settings'><i class='fa fa-gear'></i></div>",
      "  </header>",
      "  <div class='performer'>",
      "     <div class='count'>15 Shows Found for Childish Gambino'</div>",
      "  </div>",
      "  <ul class='events'>",
      "   <li class='group'><span>July 7th, Hammerstein Ballroom</span><a>Tickets</a></li>",
      "   <li class='group'><span>July 7th, Hammerstein Ballroom</span><a>Tickets</a></li>",
      "   <li class='group'><span>July 7th, Hammerstein Ballroom</span><a>Tickets</a></li>",
      "   <li class='group'><span>July 7th, Hammerstein Ballroom</span><a>Tickets</a></li>",
      "   <li class='group'><span>July 7th, Hammerstein Ballroom</span><a>Tickets</a></li>",
      "  </ul'>",
      "</div>"
    ].join(""));

    $('body').append($extension);
});