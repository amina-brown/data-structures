## Weekly Assignment 6
This assignment was to write queries to pull data from both the RDS (SQL) database created in assignment 4 and the DynamoDB (NoSQL) database created in assignment 5.

This was done in two parts.

In the first SQL part, the query was designed to establish that the select statement could properly connect and query the database. Currently, the query filters on a string search looking for addresses that have '96TH' somewhere in the string.
This code uses the same structure as that used for assignment 4. This means, declaring the variables, connecting to the db with the proper credentials, and passing and executing a sql query.

        const { Client } = require('pg');
        const cTable = require('console.table');
        const dotenv = require('dotenv');
        dotenv.config(); 
        
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
        
        // Sample SQL statement to query meetings on Monday that start on or after 7:00pm: 
        var thisQuery = "SELECT address, lat, long FROM aa_address WHERE address like '%96TH%' GROUP BY address, lat, long;";
        
        client.query(thisQuery, (err, res) => {
            if (err) {throw err}
            else {
                console.table(res.rows);
                client.end();
            }
        });
    
For the second part, a parameter variable was set to query items from the DynamoDB. This required connecting to the db in the same way as assignment 5, but included the new operation of setting the parameters using the following code.

      var params = {
    TableName : "processblog",
    KeyConditionExpression: "pk = :pk and sk = :sk", // the query expression
    ExpressionAttributeValues: { // the query values
        ":pk": {N: "0"},
        ":sk": {N: "2"}
      }
    };
    
Lastly, the params variable was passed to the dynamodb.query function to execute the filters and pull the appropriate items.

    dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
    });