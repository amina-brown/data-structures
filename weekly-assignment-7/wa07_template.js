//Combining weeks 2, 3, and 4

//Week 2 - scape HTML elements
var fs = require('fs');
var cheerio = require('cheerio');

// load the text file into a variable, `content`
var content = fs.readFileSync('data/m6.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

var addresses = ''; // this variable will hold the lines of text

//work towards targetting the correct element
var remove = ["form","a","b","h1","h4",".detailsBox"]
for (let i= 0; i < remove.length; i++) {
    $(remove[i]).remove()
}

$('center table tbody tr td table tbody tr td table tbody tr td').each(function(i, elem) {
    let address = ($(elem)
                    .text())
                    .trim()
                    .split(",");
    if (address[1] && address[0].search("=") == -1) {
        address = address[0].split(".")
        address = address[0].split("-")
    addresses += address[0] + '\n';}
});

//write data to txt
// fs.writeFileSync('data/addresses.txt', addresses);
// console.log(addresses);




//Week 3 - Pull Geocodes
// dependencies
var //fs = require('fs'), //already declared in week 2 section
      querystring = require('querystring'),
      request = require('request'),
      async = require('async'),
      dotenv = require('dotenv');

// load the text file into a variable, `content`
// var addresses_text = fs.readFileSync('data/addresses.txt');
// console.log(addresses_text);

//fetch from api
"use strict"

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
// console.log(API_KEY);
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx'

// geocode addresses
let meetingsData = [];
let addresses_arr = addresses.toString().split('\n');
addresses_arr.splice(addresses_arr.length-1,1);
// let addresses = ["63 Fifth Ave", "16 E 16th St", "2 W 13th St"];
// console.log(addresses_arr);

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses_arr, function(value, callback) {
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
}
//, function() {
//     fs.writeFileSync('data/address_geocodes.json', JSON.stringify(meetingsData));
//     console.log('*** *** *** *** ***');
//     console.log(`Number of meetings in this zone: ${meetingsData.length}`);
//     console.log(meetingsData);
//  }
 );
 
 
 //Week 4
 //Part 1 - Create table
 const { Client } = require('pg');
// const dotenv = require('dotenv'); //already declared in week 3
// dotenv.config();  

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'amina_brown';
db_credentials.host = 'data-structures.csmsogfdecpu.us-east-1.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWS_DB_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to create a table: 
var thisQuery = "CREATE TABLE aa_address (address_key SERIAL PRIMARY KEY, address varchar(100), lat double precision, long double precision);";
// Sample SQL statement to delete a table: 
// var thisQuery = "DROP TABLE aa_address;"; 

client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});

//Part 2 - Insert rows
// const { Client } = require('pg') //already declared in part 1
// var async = require('async'); //already declared in week 3
// const dotenv = require('dotenv'); //already declared in week 3
// dotenv.config();  

// // AWS RDS POSTGRESQL INSTANCE
// var db_credentials = new Object();
// db_credentials.user = 'amina_brown';
// db_credentials.host = 'data-structures.csmsogfdecpu.us-east-1.rds.amazonaws.com';
// db_credentials.database = 'aa';
// db_credentials.password = process.env.AWS_DB_PW;
// db_credentials.port = 5432;

// var addressesForDb = [{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"120 W 69TH ST New York NY ","latLong":{"lat":"40.7756982","long":"-73.9810333"}},{"address":"422 W 57TH ST New York NY ","latLong":{"lat":"40.7682311","long":"-73.9868768"}},{"address":"164 W 74TH ST New York NY ","latLong":{"lat":"40.7796117","long":"-73.9801807"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"144 W 90TH ST New York NY ","latLong":{"lat":"40.7898068","long":"-73.9723737"}},{"address":"141 W 73RD ST New York NY ","latLong":{"lat":"40.7789036","long":"-73.9799533"}},{"address":"4 W 76TH ST New York NY ","latLong":{"lat":"40.7788736","long":"-73.9745891"}},{"address":"221 W 107TH ST New York NY ","latLong":{"lat":"40.8017795","long":"-73.9665393"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"215 W 82ND ST New York NY ","latLong":{"lat":"40.7852818734432","long":"-73.9771060064311"}},{"address":"601 W 114TH ST New York NY ","latLong":{"lat":"40.8069051","long":"-73.965058"}},{"address":"CENTRAL PARK WEST 76TH ST New York NY ","latLong":{"lat":"40.6639307188879","long":"-73.9382749875207"}},{"address":"5 W 63RD ST New York NY ","latLong":{"lat":"40.7708644","long":"-73.9806413"}},{"address":"4 W 76TH ST New York NY ","latLong":{"lat":"40.7788736","long":"-73.9745891"}},{"address":"160 CENTRAL PARK W New York NY ","latLong":{"lat":"40.7787712","long":"-73.9743066"}},{"address":"152 W 66TH ST New York NY ","latLong":{"lat":"40.7744405","long":"-73.9838262"}},{"address":"3 W 95TH ST New York NY ","latLong":{"lat":"40.7912379","long":"-73.9655109"}},{"address":"251 W 80TH ST New York NY ","latLong":{"lat":"40.7848713","long":"-73.9800524"}},{"address":"111 W 71ST ST New York NY ","latLong":{"lat":"40.7769516","long":"-73.9795507"}},{"address":"5 W 63RD ST New York NY ","latLong":{"lat":"40.7708644","long":"-73.9806413"}},{"address":"5 W 63RD ST New York NY ","latLong":{"lat":"40.7708644","long":"-73.9806413"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"26 W 84TH ST New York NY ","latLong":{"lat":"40.7844228","long":"-73.9716168"}},{"address":"200 W 97TH ST New York NY ","latLong":{"lat":"40.7946604892952","long":"-73.9699229082063"}},{"address":"218 W 108TH ST New York NY ","latLong":{"lat":"40.8021037","long":"-73.9658778"}},{"address":"125 W 104TH ST New York NY ","latLong":{"lat":"40.7985878","long":"-73.9649967"}},{"address":"141 W 73RD ST New York NY ","latLong":{"lat":"40.7789036","long":"-73.9799533"}},{"address":"236 W 73RD ST New York NY ","latLong":{"lat":"40.7796494","long":"-73.982239"}},{"address":"165 W 105TH ST New York NY ","latLong":{"lat":"40.7996866","long":"-73.9657282"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"2504 BROADWAY New York NY ","latLong":{"lat":"40.7927534","long":"-73.972842"}},{"address":"405 W 114TH ST New York NY ","latLong":{"lat":"40.7946083","long":"-73.9358608"}},{"address":"368 W END AVE New York NY ","latLong":{"lat":"40.783225","long":"-73.9817572"}},{"address":"225 W 99TH ST New York NY ","latLong":{"lat":"40.7964452","long":"-73.9694226"}},{"address":"251 W 100TH ST New York NY ","latLong":{"lat":"40.7977791","long":"-73.9709911"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"26 W 84TH ST New York NY ","latLong":{"lat":"40.7844228","long":"-73.9716168"}},{"address":"5 W 63RD ST New York NY ","latLong":{"lat":"40.7708644","long":"-73.9806413"}},{"address":"552 W END AVE New York NY ","latLong":{"lat":"40.78931","long":"-73.9773114"}},{"address":"164 W 74 ST New York NY ","latLong":{"lat":"40.7796117","long":"-73.9801807"}},{"address":"340 W 85TH ST New York NY ","latLong":{"lat":"40.7887343","long":"-73.9798639"}},{"address":"368 W END AVE New York NY ","latLong":{"lat":"40.783225","long":"-73.9817572"}},{"address":"152 W 71ST ST New York NY ","latLong":{"lat":"40.7774259","long":"-73.9812051"}},{"address":"5 W 63RD ST New York NY ","latLong":{"lat":"40.7708644","long":"-73.9806413"}},{"address":"131 W 72ND ST New York NY ","latLong":{"lat":"40.7780247","long":"-73.9798344"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"152 W 71ST ST New York NY ","latLong":{"lat":"40.7774259","long":"-73.9812051"}},{"address":"30 W 68TH ST New York NY ","latLong":{"lat":"40.7740859","long":"-73.979107"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}},{"address":"263 W 86TH ST New York NY ","latLong":{"lat":"40.7887918","long":"-73.9772649"}},{"address":"306 W 102ND ST New York NY ","latLong":{"lat":"40.7992334","long":"-73.9710638"}},{"address":"152 W 71ST ST New York NY ","latLong":{"lat":"40.7774259","long":"-73.9812051"}},{"address":"26 W 84TH ST New York NY ","latLong":{"lat":"40.7844228","long":"-73.9716168"}},{"address":"595 COLUMBUS AVE New York NY ","latLong":{"lat":"40.7879892","long":"-73.9707609"}},{"address":"306 W 102ND ST New York NY ","latLong":{"lat":"40.7992334","long":"-73.9710638"}},{"address":"213 W 82ND ST New York NY ","latLong":{"lat":"40.7760114","long":"-73.9550312"}},{"address":"152 W 71ST ST New York NY ","latLong":{"lat":"40.7774259","long":"-73.9812051"}},{"address":"152 W 71ST ST New York NY ","latLong":{"lat":"40.7774259","long":"-73.9812051"}},{"address":"152 W 71ST ST New York NY ","latLong":{"lat":"40.7774259","long":"-73.9812051"}},{"address":"160 CENTRAL PARK W New York NY ","latLong":{"lat":"40.7787712","long":"-73.9743066"}},{"address":"207 W 96TH ST New York NY ","latLong":{"lat":"40.7945161","long":"-73.9710419"}}];


async.eachSeries(meetingsData, function(value, callback) {
    const client = new Client(db_credentials);
    client.connect();
    var thisQuery = "INSERT INTO aa_address VALUES (DEFAULT, E'" + value.address + "', " + value.latLong.lat + ", " + value.latLong.long + ");";
    client.query(thisQuery, (err, res) => {
        console.log(err, res);
        client.end();
    });
    setTimeout(callback, 1000); 
}); 

//Part 3 - Check contents
// const { Client } = require('pg');  
// const dotenv = require('dotenv');
// dotenv.config();  

// // AWS RDS POSTGRESQL INSTANCE
// var db_credentials = new Object();
// db_credentials.user = 'amina_brown';
// db_credentials.host = 'data-structures.csmsogfdecpu.us-east-1.rds.amazonaws.com';
// db_credentials.database = 'aa';
// db_credentials.password = process.env.AWS_DB_PW;
// db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
// const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query the entire contents of a table: 
var thisQuery = "SELECT * FROM aa_address;";
// var thisQuery = "SELECT count(*) FROM aa_address;";

client.query(thisQuery, (err, res) => {
    console.log(err, res.rows);
    client.end();
});