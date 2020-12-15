# Final Assignments

## Assignment 1 - AA Meetings

This assignment consisted of connecting the established SQL database to an interface. Since this data is location based, leaflet.js was used to create a map and plot the various meeting locations.

First, the appropriate variables, packages and connections are declared:

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
    
Next, the templates for the html, css, and javascript are loaded. This contains all style, html elements, and the javascript code to connect the data to the interface elements. Using leaflet, the 
map is added and the pin markers are plotted according to the lat and long values from the data set. Additionally, the details of each meeting are programmed to popup on the left of the screen when a 
marker is selected. This is done by accessing the e property of the marker content.

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
        
Next, an app.get() function is established to handle requests for the app. This is where the queries are stored and the above templates are passed to a function to create the final interface.
The query pulls all meetings for the current day, meaning the interface only displays meetings on the same day of the week that the user is visiting the page.

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

This creates the final interface:
![aa_meeting](https://github.com/amina-brown/data-structures/blob/master/final-assignments/aa_meetings.PNG)

## Assignment 2 - Temperature Sensor

This project was to connect a particle temperature sensor to a SQL database and present the information on a graph.

The template for this app is saved in a separate file that contains the d3 code to create the graph, and add the current temperature values. The query part is located in the same app.js file as the aa code. 
This query is designed to pull the data for the last week by averaging each day and looking at the past 7 days. It also pulls the latest temperature entry to fill the current temp element.

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
             
 This yields a bar graph with 7 bars (one per day), a hover over function with the avg temp for the day, and the current temp value.
 ![temp](https://github.com/amina-brown/data-structures/blob/master/final-assignments/process_blog.PNG)
 
 ## Assignment 3 - Process Blog
 
 This assignment was to create a process blog with the entries stored in a NoSQL database. The chosen content for this application was sailing journal entries that contain date, location, wind, boat,
 notes, and results. 
 
 Similar to assignment 2, the template is stored in a separate file. The app.get() function contains the NoSQL query and allows the functionality of being able to add a query to the url.
 The query is designed to pull all entries with a process key of 0.
 
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
    
 The final interface is a simple table that contains all the info. The results column is programmed to say "Practice" for days that do not have results. In order to add the pk query to 
 the url, the user can add one of the following to the end of the existing url:
 
    ?pk=0
    ?pk=1
    ?pk=2
    
The final interface looks like this:
![process](https://github.com/amina-brown/data-structures/blob/master/final-assignments/temp_sensor.PNG)
