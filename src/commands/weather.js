// START CONFIG
const googleMapsAPIKey = "AIzaSyAF4Mu9YsKe933qVXo5xANq69KNYEVyV7k";
const darkSkyAPIKey = "75746afa2562fbb797fb7a3f2db07f42";
const LANGUAGE = 'en';
// END CONFIG

const Command = require('../command');
const request = require('request');
const tz = require('timezone/loaded');

const DarkSky = require('dark-sky');
const forecast = new DarkSky(darkSkyAPIKey);

module.exports = new Command({
  name: "weather",
  desc: "Gets the weather for Rochester, NY or any given location",
  action: (argv, context) => {
    return new Promise( (fulfill, reject) => {
      let query = argv.location;
      let longLatRequest = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${googleMapsAPIKey}`;

      // Making Google Geocoding API Request to find lat and long for any given query (zipcode, city, address, etc)
      request({ url: longLatRequest, json: true }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          let weatherLocation = body.results[0]; // Take first/best? result for now
          if (weatherLocation.geometry && weatherLocation.geometry.location) { // Make sure lat and long exist in API response
            let lat = weatherLocation.geometry.location.lat;
            let long = weatherLocation.geometry.location.lng;
            //let weatherRequest = `https://api.darksky.net/forecast/${darkSkyAPIKey}/${lat},${long}?`;

            // Making Dark Sky Weather API Request
            forecast
              .latitude(lat)
              .longitude(long)
              .units('auto')
              .exclude('minutely,daily')
              .language(LANGUAGE)
              .get()
              .then(weather => {
                if (!error && response.statusCode == 200) {
                  // Get current date and date of last weather update to determine time print-type
                  let lastUpdatedText = "";
                  let curTimestamp = new Date();
                  let lastUpdatedTimestamp = new Date(weather.currently.time * 1000);

                  // Check if last updated was today
                  let lastUpdatedTZ = tz(weather.currently.time * 1000);
                  if (curTimestamp.setHours(0,0,0,0) == lastUpdatedTimestamp.setHours(0,0,0,0)) { // If last updated was today
                    lastUpdatedText = `${ tz(lastUpdatedTZ, "%I:%M %p %Z", LANGUAGE, weather.timezone) } today`;
                  } else { // If last updated was not today for some reason, then state the entire timestamp
                    lastUpdatedText = tz(lastUpdatedTZ, "%c", LANGUAGE, weather.timezone);
                  }

                  // Determine temperature with correct units
                  let tempUnits = weather.flags.units == "us" ? "°F" : "°C";
                  let temp = `${Math.floor(weather.currently.temperature)}${tempUnits}`;
                  return fulfill(`Current temperature in ${weatherLocation.formatted_address} is ${temp} as of ${lastUpdatedText}`);
                } else {
                  return reject("¯\\_(ツ)_/¯");
                }
              }).catch(err => {
                reject(err);
              });
          } else {
            return reject("¯\\_(ツ)_/¯");
          }
        } else {
          return reject("¯\\_(ツ)_/¯");
        }
      });
    });
  },
  args: [
    {
      name: 'location',
      desc: 'Where should we get weather for? (Address, Zipcode, City)',
      alias: 'l',
      type: String,
      default: '14623'
    }
  ]
});
