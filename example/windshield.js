/**
 * windshield.js - simple way to render incoming GeoJson points on a map. See randomPoints for expected return for the point fetching function
 * 
 * Many thanks to Jon Rohan, who wrote the original non-generic version of this for a SimpleGeo dashboard
 */

/**
 * Arguments:
 *  * queue - the array to inserts the points into (filled in by Windshield)
 *  * sw - the object containing the south-west corner coordinates of the map's extent (with "lat" and "lon" keys)
 *  * ne - the object containing the north-east corner coordinates of the map's extent (with "lat" and "lon" keys)
 *  * limit - how many points to return
 */
var randomPoints = function(queue, sw, ne, limit) {
  for (var i = 0; i < limit; i++) {
    queue.push({
      type: "Feature",
      geometry: {
        coordinates: [
          sw.lon + (ne.lon - sw.lon) * Math.random(),
          sw.lat + (ne.lat - sw.lat) * Math.random()
        ],
        type: "Point"
      }
    })
  }
};

/**
 * render points on a map as they come in - like bugs on a windshield
 *
 * userConfig important keys:
 *  * pointFetchingFn - the function executed to fetch new points - see randomPoints above for example and args explanation
 *  * style - the CloudMade style to use - see http://maps.cloudmade.com/editor defaults to Midnight Commander
 *  * jumpIntervalMs - how frequently the map should center on the next point it sees; 0 to disable re-centering
 *  * maxPoints - the maximum number of points allowed to be rendered on the map before clearing
 *  * pointRenderIntervalMs - how often to render new points on the map (too low = too much movement)
 *  * pointFetchIntervalMs - how often to check the datasource for new data - important based on how the data is buffered
 *  * cloudMadeApiKey - the API key to use for fetching cloudmade tiles (http://cloudmade.com/) PLEASE DONT USE THE EXAMPLE KEY
 */
var windshield = function(mapElement, userConfig) {

  var conf = {
    'pointFetchingFn': randomPoints,
    'style': '999',
    'jumpIntervalMs': 10000,
    'maxPoints': 10000,
    'zoomLevel': 10,
    'pointRenderIntervalMs': 2000,
    'pointFetchIntervalMs': 100,
    'cloudMadeApiKey': '<YOU NEED TO PASS IN cloudMadeApiKey>'
  } 
  $.extend(conf, userConfig);

  var pointFetchingFn = conf.pointFetchingFn;
  
  var pntcnt = 0;
  var queue = []; 
  var po = org.polymaps;
  var map = po.map();
  var hasCentered = false;

  map.container(mapElement.appendChild(po.svg("svg")))
    .zoom(conf.zoomLevel)
    .add(po.hash());

  map.add(po.image()
      .url(po.url("http://{S}tile.cloudmade.com"
      + "/" + conf.cloudMadeApiKey
      + "/" + conf.style + "/256/{Z}/{X}/{Y}.png")
      .hosts(["a.", "b.", "c.", ""])));

      map.add(po.compass().pan("none")).add(po.drag());

  /** Post-process the GeoJSON points and replace them with shiny balls! */
  var load = function(e) {
    var r = 12 * Math.pow(2, e.tile.zoom - 12);
    for (var i = 0; i < e.features.length; i++) {
      var c = $(e.features[i].element),
          g = c.parent().add("svg > g", c);
      g.attr("transform", "translate(" + c.attr("cx") + "," + c.attr("cy") + ")");
      
      g.add("svg > circle")
          .attr("r", r)
          .attr("transform", "scale(1,1)");
    }
  }
  
  // render points that have been queued up
  setInterval(function(){
    if (queue.length > 0) {
      start_len = queue.length;
      for (var i = 0; i < start_len; i++) {
        pntcnt++;
        var ll = queue.pop();
        if (hasCentered == false) {
          map.center({lat: ll.geometry.coordinates[1], lon: ll.geometry.coordinates[0]});
          map.zoom(conf.zoomLevel);
          hasCentered = true;
        }
        map.add(po.geoJson()
            .features([ll])
            .on("load", load)
        );
      }
    }
  }, conf.pointRenderIntervalMs);

  // get our initial point
  pointFetchingFn(queue, {lat: -90, lon: -180}, {lat: 90, lon: 180}, 1)

  // fetch new points
  setInterval(function() {
    pointFetchingFn(queue, map.extent()[0], map.extent()[1], 5);
  }, conf.pointFetchIntervalMs)

  // reset timer
  setInterval(function() {
    // time to reload the page
    // TODO: clear the points incrementally over time without refreshing the page
    if (pntcnt > conf.maxPoints) {
      window.location.reload();
    }
    if (conf.jumpIntervalMs != 0) {
        // time to recenter
        hasCentered = false;
        queue = []
        pointFetchingFn(queue, {lat: -90, lon: -180}, {lat: 90, lon: 180}, 1)
    }
  }, conf.jumpIntervalMs)
};
