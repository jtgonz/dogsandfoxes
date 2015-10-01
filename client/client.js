var reftext = 'the quick brown fox jumps over the lazy dog.';
var blinktime = 500;

Session.set('intext', '');
Session.set('cursor', 0);
Session.set('blink', true);

Meteor.startup( function () {

  Meteor.setInterval( function () {
    Session.set('blink', !Session.get('blink'));
  }, blinktime);

  $(document).on('keypress', function (e) {
    // get current text and new keypress
    var text = Session.get('intext');
    var toAdd = String.fromCharCode(e.keyCode);

    // update text to display
    Session.set('intext', text+toAdd);

    // make sure cursor is visible
    Session.set('blink', true);

    // increment cursor position
    Session.set('cursor', Session.get('cursor')+1);

  });
  $(document).on('keydown', function (e) {
    // get current text and cursor
    var text = Session.get('intext');
    var cursor = Session.get('cursor');
    
    if (e.keyCode == 8) {
      // don't do anything if we're at the beginning of the line
      if (cursor == 0) return;

      var first = text.slice(0, cursor-1);
      var last = text.slice(cursor);
      Session.set('intext', first+last);

      // decrement cursor position
      Session.set('cursor', cursor-1);
      
    } else if (e.keyCode == 46) {
      //delete
    }
  });
});

Template.inputdogfox.helpers({
  blink: function() {
    if (Session.get("blink")) {
      return 'blink-on'
    } else {
      return 'blink-off'
    }
  },
  letters: function() {

    var styled = '';
    var text = Session.get('intext');

    for (var i = 0; i < text.length; i++) {
      var color = text[i] == reftext[i] ? 'correct' : 'incorrect';
      var letter = text[i] != ' ' ? text[i] : '&nbsp';
      styled = styled + '<span class="' + color + '">' + letter + '</span>';
    }

    return styled;
  },
  reference: function() {
    var cursor = Session.get('cursor');
    var first = reftext.slice(0, cursor);
    var last = reftext.slice(cursor);

    return '<span class="hidden">' + first + '</span>' + last;
  }
});