//npm install request async dotenv
// dependencies
var fs = require('fs'),
      querystring = require('querystring'),
      request = require('request'),
      async = require('async'),
      dotenv = require('dotenv');

// load the text file into a variable, `content`
var addresses_text = fs.readFileSync('data/addresses.txt');

//fetch from api
"use strict"

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
// console.log(API_KEY);
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx'

// geocode addresses
let meetingsData = [];
let addresses = addresses_text.toString().split('\n');
// let addresses = ["63 Fifth Ave", "16 E 16th St", "2 W 13th St"];

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    let query = {
        streetAddress: value,
        city: "New York",
        state: "NY",
        apikey: API_KEY,
        format: "json",
        version: "4.01"
    };

    // construct a querystring from the `query` object's values and append it to the api URL
    let apiRequest = API_URL + '?' + querystring.stringify(query);

    request(apiRequest, function(err, resp, body) {
        if (err){ throw err; }

        let tamuGeo = JSON.parse(body);
        console.log(tamuGeo['FeatureMatchingResultType'], apiRequest);
        meetingsData.push({ address: tamuGeo.InputAddress.StreetAddress,
                            latLong:{   lat: tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude,
                                        long: tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude
                            }
                          });
    });

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);
}, function() {
    fs.writeFileSync('data/address_geocodes.json', JSON.stringify(meetingsData));
    console.log('*** *** *** *** ***');
    console.log(`Number of meetings in this zone: ${meetingsData.length}`);
});