//Combining weeks 2, 3, and 4
//Week 2 - scape HTML elements
var fs = require('fs');
var cheerio = require('cheerio');
// load the text file into a variable, `content`
var content = fs.readFileSync('../wa01/m4.txt');
// load `content` into a cheerio object
var $ = cheerio.load(content);
var address = [];
var floorInfo =[];
var groupName =[];
var zip = [];
var dayTime= [];
//var time = [];
//var meetingType = [];
var meetingType = [];
var building = [];
var wcAccess = [];
var details = [];
//var meetings = {
    //zone9:{
//         address: address,
//         floorInfo: floorInfo,
//         group: groupName,
//         zip : zip,
//         daytime: daytime
//         //meetingType: meetingType
//     }
// };
    // meetingType.push($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0].split('-')[0]);
//work towards targetting the correct element
$("td[style='border-bottom:1px solid #e3e3e3; width:260px']").each(function(i, elem) {
    if ($(elem).html().search(" NY") != -1){
        floorInfo.push($(elem).html().split(',').splice(1,$(elem).html().split(',').length).join(',').split('NY')[0].replace('\n\t\t\t\t\t\t<br>','').replace('<br>','').replace("&apos;","'").replace("&amp;","&").trim());
    } else {
        floorInfo.push($(elem).html().split(',').splice(1,$(elem).html().split(',').length).join(',').split('100')[0].replace('\n\t\t\t\t\t\t<br>','').replace('<br>','').replace("&apos;","'").replace("&amp;","&").trim());
    }
    zip.push($(elem).html().split('<br>')[3].trim().slice(- 5));
    address.push($(elem).html().split('<br>')[2].trim().split(',')[0].trim());
    if ($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0] == "125 - TWO FOR ONE - </b>"){
        groupName.push("125 - TWO FOR ONE");
    } else if ($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0].split('-')[0].replace("&apos;","'").replace("\'","'").trim() == "ANNEX                               (:I)"){
        groupName.push("ANNEX (:I)");
    } else if ($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0].split('-')[0].replace("&apos;","'").replace("\'","'").trim() == "ANNEX    (:II)"){
        groupName.push("ANNEX (:II)");
    } else if ($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0].split('-')[0].replace("&apos;","'").replace("\'","'").trim() == "PARK BENCH   (:I)"){
        groupName.push("PARK BENCH (:I)");
    } else if ($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0].split('-')[0].replace("&apos;","'").replace("\'","'").trim() == "NINTH AVENUE           (:I)"){
        groupName.push("NINTH AVENUE (:I)");
    } else if ($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0].split('-')[0].replace("&apos;","'").replace("\'","'").trim() == "FIRESIDE  (:I)  WEEKDAY MEETINGS ONLY"){
        groupName.push("FIRESIDE (:I) WEEKDAY MEETINGS ONLY");
    } else {
        groupName.push($(elem).html().split('<b>')[1].trim().split('<br>')[0].trim().split(',')[0].split('-')[0].replace("&apos;","'").replace("\'","'").trim());
    }
    if ($(elem).html().search("detailsBox") != -1){
        details.push($(elem).html().split('div')[1].split('\t')[1].split('\n')[0].replace("&apos;","'").replace("&amp;","&").replace("<br>","").replace("\'","'").trim());
    } else {
        details.push('');
    }
    if ($(elem).html().split('img').length == 2){
        wcAccess.push(1)
    } else {
        wcAccess.push(0)
    }
});
    var seperate = []
$("td[style='border-bottom:1px solid #e3e3e3;width:350px;']").each(function(i, elem) {
    seperate = $(elem).html().split('<br>\n                    \t<br>');
    var daytimes = [];
    for (let i = 0; i < seperate.length-1; i++){
        var daytimeobject = {
            day: "",
            startTime: "",
            endTime: "",
            meetingType: "",
            specialInterest: ""
        }
        daytimeobject.day = seperate[i].trim().split('From')[0].trim().split('<b>')[1];
        daytimeobject.startTime = seperate[i].trim().split('</b>')[1].trim().split('to')[0].split('<b>')[0].trim();
        daytimeobject.endTime = seperate[i].trim().split('<br>')[0].trim().split('</b>' + ' ')[2];
        if (seperate[i].trim().split('</b>').length == 5){
            daytimeobject.specialInterest = seperate[i].trim().split('</b>')[4].trim().split(' \n')[0];
            daytimeobject.meetingType = seperate[i].trim().split('</b>')[3].trim().split('<br>')[0];
        } else if (seperate[i].trim().split('</b>').length == 4){
            daytimeobject.meetingType = seperate[i].trim().split('</b>')[3].trim().split(' \n')[0];
        };
        daytimes.push(daytimeobject);
    }
    dayTime.push(daytimes);
    console.log(daytimes);
});
// $("td[style='border-bottom:1px solid #e3e3e3;width:350px;']").each(function(i, elem) {
//     day.push($(elem).html().split('From')[0].trim().split('<b>')[1]);
//     startTime.push($(elem).html().split('</b>')[1].trim().split('to')[0].split('<b>')[0].trim());
//     endTime.push($(elem).html().split('<br>')[0].trim().split('</b>' + ' ')[2]);
//     meetingType.push($(elem).html().split('<b>')[3].trim().split('<br>')[0].trim().split(',')[0].split('-')[0].split('</b>')[1].trim());
// });
$('h4[style="margin:0;padding:0;"]').each(function(i, elem) {
    building.push(($(elem).text()).replace("\'","'").trim().split("\n"));
});
    
var //fs = require('fs'), //already declared in week 2 section
      querystring = require('querystring'),
      request = require('request'),
      async = require('async'),
      dotenv = require('dotenv');
      dotenv.config({path: '/home/ec2-user/environment/data-structures/.env'});
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
// let addresses_arr = address.toString().split('\n');
// addresses_arr.splice(addresses_arr.length-1,1);
// let building_arr = building.toString().split('\n');
// building_arr.splice(building_arr.length-1,1);
// let addresses = ["63 Fifth Ave", "16 E 16th St", "2 W 13th St"];
// console.log(addresses_arr);
var i = 0;
// eachSeries in the async module iterates over an array and operates on each item in the array in series
//console.log(address);
async.eachSeries(address, function(value, callback) {
    let query = {
        streetAddress: value,
        city: "New York",
        state: "NY",
        apikey: API_KEY,
        format: "json",
        version: "4.01"
    };
    //console.log(query);
    // construct a querystring from the `query` object's values and append it to the api URL
    let apiRequest = API_URL + '?' + querystring.stringify(query);
    request(apiRequest, function(err, resp, body) {
        if (err){ throw err; }
        let tamuGeo = JSON.parse(body);
        console.log(tamuGeo['FeatureMatchingResultType'], apiRequest);
        meetingsData.push({ address: tamuGeo.InputAddress.StreetAddress,
                            latLong:{   lat: tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude,
                                        long: tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude
                            },
                            building: building[i-1],
                            floorInfo: floorInfo[i-1],
                            groupName: groupName[i-1],
                            zip: zip[i-1],
                            dayTime: dayTime[i-1],
                            wcAccess: wcAccess[i-1],
                            details: details[i-1]
                          });
    });
    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);
    i++;
}
, function() {
    fs.writeFileSync('../wa07/address_geocodes04.json', JSON.stringify(meetingsData));
    console.log('*** *** *** *** ***');
    console.log(`Number of meetings in this zone: ${meetingsData.length}`);
    console.log(meetingsData);
 }
 );