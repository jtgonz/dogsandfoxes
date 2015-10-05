var pieWidth = 300, pieHeight = 300;

// define a reactive data source to hold keystroke info
Session.set('keystats', [
  {label: 'correct', num: 0},
  {label: 'incorrect', num: 0},
  {label: 'untyped', num: 44}
]);

Template.vizpie.onRendered( function() {

  // grab svg element from DOM, and add a group to hold the chart
  var svg = d3.select('#piechart')
      .attr('width', pieWidth)
      .attr('height', pieHeight)
    .append('g')
      .attr('transform', 'translate(' + pieWidth/2 + ',' + pieHeight/2 + ')');

  // create new pie layout. Calling pie(values) will return an array of objects
  // with startAngle/endAngle properties corresponding to the values.
  var pie = d3.layout.pie()
      .sort(null)   // need this so segments don't shift position
      .value(function (d) { return d.num });

  // d3.svg.arc returns a function, which you can invoke to generate svg path
  // data in the shape of an arc.
  var arc = d3.svg.arc()
      .innerRadius(100)
      .outerRadius(150);

  // create color scale
  var color = d3.scale.ordinal()
      .domain([0,1,2])
      .range(['#1f77b4', '#ff7f0e', '#aec7e8']);

  // create path elements -- set color and store initial arc data in _current
  var path = svg.selectAll('path')
      .data(pie(Session.get('keystats')))
    .enter().append('path')
      .attr('fill', function(d, i) { return color(i); })
      .attr('d', arc)
      .each(function (d) { this._current = d; });

  // this is where we update the data visualization
  Tracker.autorun( function () {
    // compute new angles and bind to svg path elements
    path = path.data(pie(Session.get('keystats')));

    // tween to new position. Use arcTween to construct a new interpolator that
    // goes from _current to the new position
    path.transition().duration(200).attrTween('d', arcTween);
  });

  // run this to construct a new interpolator from _current to a
  // '_current' and 'a' are both pie data objects
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(1);

    // function that when called w/ time step t, returns svg path data
    // for the interpolated pie object
    return function(t) {
      return arc(i(t));
    };
  }

});


/*
function update() {
  console.log('supdate');
}*/

/*
Template.vizpie.helpers({
  showPie: function() {

    //console.log(svg);

    //console.log(Session.get('keystats'));

    if (svg == null)
      return;

    console.log(Session.get('keystats'));

    update();
/*
    // compute new angles and bind to svg path elements
    path = path.data(pie(Session.get('keystats')));

    path.transition().duration(200).attrTween("d", )


    // select arc elements and bind data to them
    // use label as key to join on
    var g = svg.selectAll('.arc')
      .data(Session.get('keystats'), function (d) { return d.label });

    g.select('path')
  }
});

/*
var pie = d3.layout.pie()
    .sort(null)
    .value(function (d) { return d.population; });




// this will have to go in a reactive computation

var g = svg.selectAll('.arc')
    .data(pie(data))
  .enter().append('g')
    .attr('class', 'arc');



Template.dataviz.onRendered({

  var svg = d3.select('#piechart')
      .attr('width', pieWidth)
      .attr('height', pieHeight);


  var pie = d3.layout.pie()
      .value()

  
});*/