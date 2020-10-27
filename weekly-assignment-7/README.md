## Weekly Assignment 7
This assignment was to finish extracting all the AA meeting attributes from every zone and load them into the RDS Database. It required using work that was done in weeks 1 through 4.
Using all 10 text files extracted in week 1, the task was to use cheerio to extract all the different pieces in addition to the address that was already pulled. Then, save them in an array that was then used for uploading to the db.
Each zone required individual exceptions and, in turn, ended up with it's own extraction script.

Each script used the same basic structure. First, the variables and modules were declared:

    var fs = require('fs');
    var cheerio = require('cheerio');
    var content = fs.readFileSync('../wa01/m1.txt');
    var $ = cheerio.load(content);
    var address = [];
    var floorInfo =[];
    var groupName =[];
    var zip = [];
    var dayTime= [];
    var meetingType = [];
    var building = [];
    var wcAccess = [];
    var details = [];

Next, the cheerio selection was done for each part - this is an example from zone 1:

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
    
Meeting level attributes were loaded into a nested array to account for there being multiple for some addresses. 

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
    
After that, the separate variables were combined into a final array that was saved as a json. This was done as part of the Geocoding process that pulled the Lat and Long from TAMU's API.

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
        fs.writeFileSync('../wa07/address_geocodes01.json', JSON.stringify(meetingsData));
        console.log('*** *** *** *** ***');
        console.log(`Number of meetings in this zone: ${meetingsData.length}`);
        console.log(meetingsData);
     }
     );

Once all 10 scripts were completed and outputs were saved as jsons, it was time to upload them to the database. This step used the same script for each and was run 10 times, once for each file. 
This step used the same basic code from week 4, but employed a new query that accomodated the new columns and certain replace and escape processes that were necessary for cleaning.
Due to the structure of the jsons and the size of the total data set, the choice was made to switch from two tables (address and meeting level) to one table that had 1208 rows.

    var thisQuery = "INSERT INTO aa_meeting VALUES (E'" + value.address + "', " + value.latLong.lat + ", " + value.latLong.long + ", E'" 
                                                        + value.zip + "', E'" + value.building[0].replace(/'/g,"") + "', E'" + value.floorInfo.replace(/,/g,"").replace(/'/g,"") + "', E'" + value.groupName.replace(/'/g,"").replace(/,/g,"") + "', " 
                                                        + value.wcAccess + ", E'" + entry.day  + "', E'" + entry.startTime  + "', E'" + entry.endTime  + "', E'" 
                                                        + entry.meetingType.replace(/'/g,"")  + "', E'" + entry.specialInterest.replace(/,/g,"").replace(/'/g,"")  + "', E'" + value.details.replace(/,/g,"").replace(/'/g,"").replace(/<br>/g,"") + "');";
    