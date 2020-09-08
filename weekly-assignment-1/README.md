##Weekly Assignment 1
This assignment was to request and save the body of 10 different pages. This could be done individually or by using a loop.

First, the appropriate modules are downloaded and the variables are declared:
    var request = require('request');
    var fs = require('fs');
    var async = require('async');


    var pages = ['https://parsons.nyc/aa/m01.html','https://parsons.nyc/aa/m02.html','https://parsons.nyc/aa/m03.html', 
                 'https://parsons.nyc/aa/m04.html','https://parsons.nyc/aa/m05.html','https://parsons.nyc/aa/m06.html', 
                 'https://parsons.nyc/aa/m07.html','https://parsons.nyc/aa/m08.html','https://parsons.nyc/aa/m09.html',  
                 'https://parsons.nyc/aa/m10.html'];
    
    var fname = '/home/ec2-user/environment/weekly-assignment-1/data/m';
The variables include the list of pages and the base file path for the file name declaration.

Next, a loop was used to iterate through the different pages and call the appropriate requests. This proved more complicated than it initially seemed due to the asynchronous nature of the request function.

To solve the asynchronous issue, the async.forEachOf function was used to force the requests to file one at a time, and line up with the file name.
    async.forEachOf(pages, (value, key, callback) => {
        request(pages[key], function(error, response, body){
            if (!error && response.statusCode == 200) {
                fs.writeFileSync(fname.concat(key+1,'.txt'), body);
            } else {
                console.log("Request failed!");
            }
        });
    })