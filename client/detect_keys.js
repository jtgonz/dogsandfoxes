var reftext = 'the quick brown fox jumps over the lazy dog.';
var blinktime = 500;
var userid, startTime, timer;

Session.set('time', null);
Session.set('istyping', false);
Session.set('timeDisplay', 0);

Meteor.startup( function () {

  // if we don't have any ID stored for this user, create new record
  // in Scores collection, and store the returned ID in a cookie
  userid = Cookie.get('userid');
  if (userid == null) {
    Scores.insert({}, function (e, id) {
      userid = id;
      Cookie.set('userid', userid);
    });
  }

  // store user's best time in a reactive variable.
  if (Cookie.get('best') != null) {
    Session.set('best', Cookie.get('best'));
  } else {
    Session.set('best', 10000000);
  }

  // set cursor to position zero
  Session.set('cursor', 0);

  // setup interval for cursor to blink
  // 'blink' is a reactive variable, so the CSS will update automatically
  Meteor.setInterval( function () {
    Session.set('blink', !Session.get('blink'));
  }, blinktime);

  // set up input text
  Session.set('intext', '');

  /*** Event Handlers for Key Presses ***/

  // FYI -- keypress will relay what the actual character should be. So you'll
  // get unique events for R and SHIFT+R. Whereas with keydown, you'll get
  // two events if you do something like SHIFT+R (one for SHIFT and one for R).

  $(document).on('keypress', function (e) {
    // get current text and new keypress
    var text = Session.get('intext');
    var toAdd = String.fromCharCode(e.keyCode);

    // log time if we just started typing
    if (!Session.get('istyping')) {
      Session.set('istyping', true);
      startTime = Date.now();

      timer = Meteor.setInterval( function () {
        Session.set('timeDisplay', Math.round((Date.now() - startTime) / 10) / 100);
      }, 80);
    }

    // update text to display
    Session.set('intext', text+toAdd);

    // make sure cursor is visible
    Session.set('blink', true);

    // increment cursor position
    Session.set('cursor', Session.get('cursor')+1);

    if (Session.get('intext') == reftext) {
      sendScore();
    }

  });

  $(document).on('keydown', function (e) {
    // get current text and cursor
    var text = Session.get('intext');
    var cursor = Session.get('cursor');
    
    // BACKSPACE
    if (e.keyCode == 8) {

      // don't navigate back a page
      e.preventDefault();

      // don't do anything if we're at the beginning of the line
      if (cursor == 0) return;

      var first = text.slice(0, cursor-1);
      var last = text.slice(cursor);
      Session.set('intext', first+last);

      // decrement cursor position
      Session.set('cursor', cursor-1);
      
    // DELETE
    } else if (e.keyCode == 46) {
      //delete

    // ESCAPE
    } else if (e.keyCode == 27) {
      //escape
    }
  });
});

Template.inputdogfox.helpers({

  // control visibility of cursor (border element on input text box)
  blink: function() {
    if (Session.get("blink")) {
      return 'blink-on'
    } else {
      return 'blink-off'
    }
  },

  // return styled user input text
  letters: function() {

    var styled = '';
    var text = Session.get('intext');

    var countCorrect = 0;
    var countIncorrect = 0;

    // iterate through typed text, count number of correct and incorrect characters,
    // and style them accordingly
    for (var i = 0; i < text.length; i++) {

      var color;

      if (text[i] == reftext[i]) {
        color = 'correct';
        countCorrect += 1;
      } else {
        color = 'incorrect';
        countIncorrect += 1;
      }

      // if the character is whitespace, replace with &nbsp so DOM doesn't ignore it
      var letter = text[i] != ' ' ? text[i] : '&nbsp';
      styled = styled + '<span class="' + color + '">' + letter + '</span>';
    }

    // update keystats object -- this will trigger update in the DOM
    Session.set('keystats', [
      {label: 'correct', num: countCorrect},
      {label: 'incorrect', num: countIncorrect},
      {label: 'untyped', num: Math.max(44-countCorrect-countIncorrect,0)}
    ]);

    return styled;
  },

  // display original text behind user input text. hide the portion of
  // text that overlaps with what the user has already typed
  reference: function() {
    var cursor = Session.get('cursor');
    var first = reftext.slice(0, cursor);
    var last = reftext.slice(cursor);

    return '<span class="hidden">' + first + '</span>' + last;
  }
});

Template.stats.helpers({
  typing: function() {
    return Session.get('istyping');
  },
  currentTime: function() {
    return Session.get('timeDisplay');
  },
  lastTime: function() {
    return Math.round(Session.get('time')/10)/100;
  },
  haveSpeed: function() {
    return Session.get('time') !== null;
  },
  fastest: function() {
    return Session.get('best');
  }
})

function sendScore() {
  // update user's score in database

  var secs = Date.now() - startTime;
  Session.set('time', secs);
  Session.set('istyping', false);
  Meteor.clearInterval(timer);

  if (Math.round(secs/10)/100 < Session.get('best')) {
    Scores.update(userid, {time: secs});
    Session.set('best', Math.round(secs/10)/100);
    Cookie.set('best', Math.round(secs/10)/100);
  }

  // animate textbox and reset input
  Session.set('intext', '');
  Session.set('cursor', 0);
}