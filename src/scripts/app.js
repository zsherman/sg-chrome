var template_source;

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

function updateTemplate(data) {
  data.visible = !!data.events && !!data.artist;
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
}

$.subscribe('retrieved', function(ev, data) {
  if (!template_source) {
    loadTemplate(data, updateTemplate.bind(this));
  }
  else {
    updateTemplate(data);
  }
});


// Do all the sticky scrolling
$( document ).on( 'mousewheel DOMMouseScroll', '.sg-extension', function ( e ) {
    var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
    
    this.scrollTop += ( delta < 0 ? 1 : -1 ) * 8;
    e.preventDefault();
});

$(document).on('click', '.sg-extension ul#menu .tab a', function(e) {
  e.preventDefault();
  var ref = $(this).attr('href');
  console.log(ref);
  $('.sg-extension .tab-content').hide();
  $('' + ref + '').show();
  console.log(('' + ref + ''));
  $('.sg-extension ul#menu .selected').removeClass('selected');
  $(this).closest('li').addClass('selected');
});