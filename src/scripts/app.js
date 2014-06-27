$(function() {
    console.log( "ready!" );

    $.subscribe('retrieved', function(ev, data) {
      console.log(ev);
      console.log(data);
      var req = new XMLHttpRequest();
      req.open("GET", chrome.extension.getURL('template.html'), true);
      req.onreadystatechange = function() {
          if (req.readyState == 4 && req.status == 200) {
              var source = req.responseText;
              var template = Handlebars.compile(source);
              var html = template(data);
              $('html').append(html);
          }
      };
      req.send(null);
    });

});