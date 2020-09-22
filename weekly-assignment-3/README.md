## Weekly Assignment 3
This assignment was to connect to the Texas A&M Geocode API to get latitude and longitude coordinates for the addresses parsed in assignment 2. 

First, the appropriate modules and content are downloaded and the variables are declared:

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

The variables include the text file of addresses, which has been split and saved into an array. This also sets the API key using the .env file to protect the value, as well as the API URL and the empty array to push the outputs to.

Next, using the async module and the eachSeries function, the script loops through the array to make individual requests to the API for each address.

Inside the function, the query is built and the full API request is constructed using the URL, the API key, and the specified parameters.

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

Now, the script is prepared to make the request to the API. The request specifically pulls the needed data points and pushes them to the empty meetingsData array that was defined above.

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
    
After each request is made, a timeout function is added to prevent the code from making all the API calls in too quick of a succession.

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);

Lastly, the async eachSeries function prints the final json into a file in the data folder and displays the number of successful requests.

    fs.writeFileSync('data/address_geocodes.json', JSON.stringify(meetingsData));
    console.log('*** *** *** *** ***');
    console.log(`Number of meetings in this zone: ${meetingsData.length}`);