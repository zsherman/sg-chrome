var template_source;
var event_data;

function loadTemplate(data, callback) {
  var req = new XMLHttpRequest();

  req.open("GET", chrome.extension.getURL('src/templates/template.html'), true);
  req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
          template_source = req.responseText;
          callback(data);
      }
  };
  req.send(null);
  console.log(data);
}

function formatData(data) {
  var events = data.events;
  var m_names = new Array("January", "February", "March",
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December");

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var date = new Date(ev.datetime_local);
    ev.formatted_date = m_names[date.getMonth()] + " " + date.getDate();
    console.log(ev.formatted_date);
  }
}

function updateTemplate(data) {
  data.visible = !!data.all_events && !!data.artist;
  console.log(data);
  formatData(data.all_events);
  formatData(data.local_events);
  var template = Handlebars.compile(template_source);
  var html = template(data);
  if ($(".sg-extension")[0]) {
    $(".sg-extension").replaceWith(html);
  }
  else {
    $('html').append(html);
  }
  var logo_url = chrome.extension.getURL('src/images/logo.png');
  $('.sg-extension .logo').css('background-image', 'url(' + logo_url + ')');
  if (data.local_events.length != 0) {
    $('#tour-dates h3 img').attr('src', 'https://chairnerd.global.ssl.fastly.net/images/new/sgs-footer-logo.png').css('height', '30px');
    $('#tour-dates ul').empty();
    for(var item in data.local_events.events) {
      $('#tour-dates ul').append('<li><a href="' + data.local_events.events[item]['url'] + '"' + '>' + data.local_events.events[item]['title'] + '</a></li>');
    };
  };
}

// Handle event data from background.js
$.subscribe('retrieved', function(ev, data) {
  if (!template_source) {
    loadTemplate(data, updateTemplate.bind(this));
  }
  else {
    updateTemplate(data);
  }
});


// Handle chrome extension button being clicked
$.subscribe('omnibox', function(ev, data) {
  console.log("Omnibox");
  if($('.sg-extension').is(":visible")) {
    $(".sg-extension").slideUp('fast', function(){ $(this).hide(); } );
  }
  else {
    $(".sg-extension").slideDown('fast', function(){ $(this).show(); } );
  }
});

// Handle tabbing
$(document).on('click', '.sg-extension ul#menu .tab a', function(e) {
  e.preventDefault();
  var ref = $(this).attr('href');
  $('.sg-extension .tab-content').hide();
  $('' + ref + '').css('display', 'block');
  $('' + ref + '').show();
  $('.sg-extension ul#menu .selected').removeClass('selected');
  $(this).closest('li').addClass('selected');
});

$(document).on('click', '.sg-extension header a.close', function(e) {
  $(".sg-extension").slideUp('fast', function(){ $(this).hide(); } );
});

// Prevent background page from scrolling
$(document).on('DOMMouseScroll mousewheel', '.scrollable', function(ev) {
    var $this = $(this),
        scrollTop = this.scrollTop,
        scrollHeight = this.scrollHeight,
        height = $this.height(),
        delta = (ev.type == 'DOMMouseScroll' ?
            ev.originalEvent.detail * -40 :
            ev.originalEvent.wheelDelta),
        up = delta > 0;

    var prevent = function() {
        ev.stopPropagation();
        ev.preventDefault();
        ev.returnValue = false;
        return false;
    }

    if (!up && -delta > scrollHeight - height - scrollTop) {
        // Scrolling down, but this will take us past the bottom.
        $this.scrollTop(scrollHeight);
        return prevent();
    } else if (up && delta > scrollTop) {
        // Scrolling up, but this will take us past the top.
        $this.scrollTop(0);
        return prevent();
    }
});
