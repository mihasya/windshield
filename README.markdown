# Windshield

This is a small toy thing for plotting GeoJSON points on a map as they "arrive" over time.

The bulk of this code was written by Jon Rohan as part of a dashboard for SimpleGeo for displaying what locations users were targeting their APIs. It would be displayed on our downstairs lounge TV most of the time.

Since the decommissioning of the original SimpleGeo services, the code had been rotting in a repo somewhere. During a Free Friday at Urban Airship (see [here](http://blogs.atlassian.com/2010/11/shipitday_in_the_wild/) for an explanation), Neil Walker and I decided to bring the dashboard back and display some of the UA-specific geo data on it.

The front-end code turned out to be pretty easy to make generic, so here it is.

## Usage

You'll need to include jQuery, PolyMaps, and `windshield.js`. I've only tested with jQuery 1.8.1 and PolyMaps 2.5.0.

(Note: patches are welcome to remove jQuery dependency. I would, but my javascript skills would make that a multi-hour chore, and this is a toy after all)

Then just define a `div` of the size you desire and pass it to the windshield function along with a config object:

To get you started:

```javascript
    <script type="text/javascript">
      $(document).ready(function() {
        windshield($("#map")[0], {
          'cloudMadeApiKey': '[your api key from http://cloudmade.com]',
        })
      });
    </script>
```

## Providing The Data

The configuration object that gets passed in as the second argument has a property called `pointFetchingFn`. This is the function that will supply the points to be rendered on the map. The default is a random point generator, defined at the very top of `windshield.js`.

## Additional Configuration

The configuration object and the parameters to the data fetching function are all documented in `windshield.js`, so I won't dupliate it here. I think it's all fairly straight forward, though I'll update the docblocks or this README if I turn out to be wrong.

## Hosted example

[http://blog.mihasya.com/windshield/example/](http://blog.mihasya.com/windshield/example/)
