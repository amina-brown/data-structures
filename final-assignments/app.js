var express = require('express'), 
    app = express();
const { Pool } = require('pg');
var AWS = require('aws-sdk');
const moment = require('moment-timezone');
const handlebars = require('handlebars');
var fs = require('fs');

const indexSource = fs.readFileSync("sensor.txt").toString();
var template = handlebars.compile(indexSource, { strict: true });

const pbSource = fs.readFileSync("pb.txt").toString();
var pbtemplate = handlebars.compile(pbSource, { strict: true });

const dotenv = require('dotenv'); //already declared in week 3
 dotenv.config();

// AWS RDS credentials
var db_credentials = new Object();
db_credentials.user = 'amina_brown';
db_credentials.host = 'data-structures.csmsogfdecpu.us-east-1.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWS_DB_PW;
db_credentials.port = 5432;

// create templates
var hx = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AA Meetings</title>
  <meta name="description" content="Meetings of AA in Manhattan">
  <meta name="author" content="AA">
  <style>
        .float-child {
            width: 50%;
            float: left;
        }  
        
        #info { height: 100%;
                 width: 100%;
                 
        }
        
        #mapid { height: 690px;
                 width: 750px;
        }
        
        table {
          border-collapse: collapse;
          font-family: sans-serif;
        }
        
        table, th, td {
          border: 1px solid black;
        }
        
        h3, p {
            font-family: sans-serif;
        }
        
        td {
          border-top:0pt none;
          margin-top:0pt;
          padding-bottom:5px;
          padding-left:12px;
          padding-right:12px;
          padding-top:5px;
        }
        
        span {
            display: none;
        }
  </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
       integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
       crossorigin=""/>
</head>
<body>
<div class="float-container">

  <div class="float-child">
    <div id="info">
        <h1>AA Meetings Manhattan</h1>
        <p>Select the markers to see the available meetings at that location for the current day</p>
        <p>For further information and details for connecting to the NYC hotline, <a href="https://www.nyintergroup.org/">click here</a></p>
        <hr>
        <p id="building"></p>
        <div id="meetings"></div>
    </div>
  </div>
  
  <div class="float-child">
    <div id="mapid"></div>
  </div>
  
</div>
<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
   integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
   crossorigin=""></script>
  <script>
  var data = 
  `;
  
var jx = `;
    var mymap = L.map('mapid').setView([40.734636,-73.994997], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1Ijoidm9ucmFtc3kiLCJhIjoiY2pveGF1MmxoMjZnazNwbW8ya2dsZTRtNyJ9.mJ1kRVrVnwTFNdoKlQu_Cw'
    }).addTo(mymap);
    
    var myIcon = L.icon({
        iconUrl: 'https://github.com/amina-brown/data-structures/blob/master/final-assignment-1/pin.png?raw=true',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
    
    
    for (var i=0; i<data.length; i++) {
        var popup = JSON.stringify(data[i].meetings)
        
                
        L.marker( [data[i].lat, data[i].long], {icon: myIcon}).bindPopup('<span>'+popup+'</span>'+popup.split('"')[3]).addTo(mymap).on('click', function(e) {
                    console.log(e);
                    document.getElementById("building").innerHTML = e.target._popup._content.split('"')[3]+"<br>"+e.target._popup._content.split('"')[7];
                    var myTable = '<table><thead><tr><th>Name</th><th>Day</th><th>Time</th><th>Type</th></tr></thead><tbody>';
                    e.target._popup._content.split("},{").forEach(element => {
                        myTable += '<tr>';
                    	myTable += '<td>' + element.split('"')[15] + '</td>';
                    	myTable += '<td>' + element.split('"')[19] + '</td>';
                    	myTable += '<td>' + element.split('"')[11] + '</td>';
                    	myTable += '<td>' + element.split('"')[23].split("=")[1] + '</td>';
                    	myTable += '</tr>';
                    })
                	myTable += '</body></table>'

                    document.getElementById("meetings").innerHTML = myTable;
                });
                
    }
    </script>
    </body>
    </html>`;


app.get('/', function(req, res) {
    res.send('<h3>Code demo site</h3><ul><li><a href="/aa">aa meetings</a></li><li><a href="/temperature">temp sensor</a></li><li><a href="/processblog">process blog</a></li></ul>');
}); 

// respond to requests for /aa
app.get('/aa', function(req, res) {

    var now = moment.tz(Date.now(), "America/New_York"); 
    // var dayy = now.day().toString(); 
    // var hourr = now.hour().toString(); 
    
    
    var days = ['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'];

    var dayy = days[now.day()];
    // console.log(dayy);

    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);
    
    // SQL query 
    var thisQuery = `SELECT lat, long, json_agg(json_build_object('loc', building, 'address', address, 'time', startTime, 'name', groupName, 'day', day, 'types', meetingType)) as meetings
                 FROM aa_meeting
                 WHERE day = '` + dayy + //'and shour >= ' + hourr + 
                 `' GROUP BY lat, long, day, startTime
                 ORDER BY day, startTime;`;
    // console.log(thisQuery);

    client.query(thisQuery, (qerr, qres) => {
        if (qerr) { throw qerr }
        
        else {
            var resp = hx + JSON.stringify(qres.rows) + jx;
            res.send(resp);
            client.end();
            console.log('2) responded to request for aa meeting data');
        }
    });
});

app.get('/temperature', function(req, res) {

    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query 
    var q = `SELECT 
                EXTRACT(DOY FROM sensorTime) as sensorday,
                to_char(sensorTime, 'Day') as weekday,
                AVG(s.sensorValue) as num_obs,
                c.sensorValue as currenttemp
            FROM sensorData s
                inner join (select sensorValue from sensorData order by sensorTime desc limit 1) c 
                on 1=1
             where s.sensorValue between 0 and 100 
             group by EXTRACT(DOY FROM sensorTime), to_char(sensorTime, 'Day'), c.sensorValue
             ORDER BY sensorday desc LIMIT 7;`;

    client.connect();
    client.query(q, (qerr, qres) => {
        if (qerr) { throw qerr }
        else {
            res.end(template({ sensordata: JSON.stringify(qres.rows)}));
            client.end();
            console.log('1) responded to request for sensor graph');
        }
    });
}); 

app.get('/processblog', function(req, res) {
    // AWS DynamoDB credentials
    AWS.config = new AWS.Config();
    AWS.config.region = "us-east-1";
    var pk = "0";
    if (["0", "1", "2"].includes(req.query.pk)) {
        pk = req.query.pk;
    }

    // Connect to the AWS DynamoDB database
    var dynamodb = new AWS.DynamoDB();

    // DynamoDB (NoSQL) query
    var params = {
        TableName : "processblog",
        KeyConditionExpression: "pk = :pk", // the query expression
        ExpressionAttributeValues: { // the query values
            ":pk": {N: pk}
        }
    };

    dynamodb.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            throw (err);
        }
        else {
            console.log(data.Items)
            res.end(pbtemplate({ pbdata: JSON.stringify(data.Items)}));
            console.log('3) responded to request for process blog data');
        }
    });
});

// serve static files in /public
app.use(express.static('public'));

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

// listen on port 8080
var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Server listening...');
});