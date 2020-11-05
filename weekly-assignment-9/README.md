## Weekly Assignment 9
This assignment was to take the sensor constructed in assignment 8 and feed the temperature readings to the RDS database. This happened in 3 parts. The first was to create the table in the existing database using the query below.

    var thisQuery = "CREATE TABLE sensorData (sensorValue double precision, sensorTime timestamp DEFAULT current_timestamp);";
    
All other code was the same as previous assignments (week 4) that accessed the database.

Part three used the same structure, but had it's own query to check the contents of the database.

    var thisQuery = "SELECT * FROM sensorData;";
    var secondQuery = "SELECT COUNT (*) FROM sensorData;";
    var thirdQuery = "SELECT sensorValue, COUNT (*) FROM sensorData GROUP BY sensorValue;";
    
The majority of the work was done on the second part, which involved installing pm2 to run to continuous connection, setting the appropriate credentials using the ecosystem.config.js file 
and feeding the proper API call and SQL query to populate the table.

Upon installation of pm2, the ecosystem file is automatically created. Then the relevant environment variables (normally stored in a .env file) were added so that pm2 could always access them.
Additionally, the file name in the ecosystem file was changed.

In the script itself, the proper API url is built, and then the data parsed and loaded into the database using a SQL query.

    var device_url = 'https://api.particle.io/v1/devices/' + device_id + '/' + particle_variable + '?access_token=' + access_token;
    
The request itself was wrapped in a function so that it could be passed into a setInterval() function, allowing us to control how often the temperature is recorded.

    var getAndWriteData = function() {
        request(device_url, function(error, response, body) {
            
            // Store sensor value(s) in a variable
            var sv = JSON.parse(body).result;
            
            // Connect to the AWS RDS Postgres database
            const client = new Client(db_credentials);
            client.connect();
            var thisQuery = "INSERT INTO sensorData VALUES (" + sv + ", DEFAULT);";
            console.log(thisQuery); // for debugging
            client.query(thisQuery, (err, res) => {
                console.log(err, res);
                client.end();
            });
        });
    };
    
```setInterval(getAndWriteData, 300000);```

From there, the list command was used to check the status of the job and the earlier mentioned sql query was used to check the database contents.
