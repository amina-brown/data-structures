var blogEntries = [];

class BlogEntry {
  constructor(primaryKey, sortKey, date, notes, venue, boat, weather, regatta, results) {
    this.pk = {};
    this.pk.N = primaryKey.toString();
    this.sk = {};
    this.sk.N = sortKey.toString();
    this.date = {}; 
    this.date.S = new Date(date).toDateString();
    this.notes = {};
    this.notes.S = notes;
    this.venue = {};
    this.venue.S = venue;
    this.boat = {};
    this.boat.S = boat;
    this.weather = {};
    this.weather.S = weather;
    this.regatta = {};
    this.regatta.BOOL = regatta; 
    if (results != null) {
      this.results = {};
      this.results.SS = results; 
    }
  }
}

blogEntries.push(new BlogEntry(0, 1, 'August 15, 2020', "Broached once, sailed with the symmetrical, probably needed the asym.","ILYC","Farr 30", "Very windy from the North",true,["8"]));
blogEntries.push(new BlogEntry(0, 2, 'September 6, 2020', "Clockwise ATI","CYC","Farr 30", "Seabreeze",true,["6"]));
blogEntries.push(new BlogEntry(0, 3, 'September 12, 2020', "Sail for Hope. Clockwise ATI. Trouble with the fro furling.","SN","Farr 30", "Easterly - light and unpredictable, Windy at the finish",true,["2"]));
blogEntries.push(new BlogEntry(0, 4, 'October 1, 2020', "Practice before Annual. Worked with symmetrical kite. Had trouble with the pole.","CYC","Farr 30","Strong seabreeze",false));

// console.log(blogEntries);

var AWS = require('aws-sdk'),
async = require('async');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

async.eachSeries(blogEntries, function(value, callback) {
    var params = {};
    params.Item = value; 
    params.TableName = "processblog";
    // console.log(params);
    dynamodb.putItem(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
    setTimeout(callback, 1000); 
}); 