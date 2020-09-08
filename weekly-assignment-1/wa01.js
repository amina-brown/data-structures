// npm install async
// mkdir data

var request = require('request');
var fs = require('fs');
var async = require('async');


var pages = ['https://parsons.nyc/aa/m01.html','https://parsons.nyc/aa/m02.html','https://parsons.nyc/aa/m03.html', 
             'https://parsons.nyc/aa/m04.html','https://parsons.nyc/aa/m05.html','https://parsons.nyc/aa/m06.html', 
             'https://parsons.nyc/aa/m07.html','https://parsons.nyc/aa/m08.html','https://parsons.nyc/aa/m09.html',  
             'https://parsons.nyc/aa/m10.html'];

var fname = '/home/ec2-user/environment/weekly-assignment-1/data/m';

async.forEachOf(pages, (value, key, callback) => {
    request(pages[key], function(error, response, body){
        if (!error && response.statusCode == 200) {
            fs.writeFileSync(fname.concat(key+1,'.txt'), body);
        } else {
            console.log("Request failed!");
        }
    });
})