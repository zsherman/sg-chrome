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
}

$.subscribe('retrieved', function(ev, data) {
  if (!template_source) {
    loadTemplate(data, updateTemplate.bind(this));
  }
  else {
    updateTemplate(data);
  }
});
