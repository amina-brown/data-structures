## Weekly Assignment 4
This assignment was to plan out and begin to populate a postgreSQL database. 

This required setting up a database using the AWS RDS service. The instructions used to do so can be found [here](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_04_documentation.md)

With regards to planning the database, the [dbdiagram tool](https://dbdiagram.io/d) was used to build the proper database diagram. It includes two tables. One at the address level which was later created using javascript, and one at the meeting level, which is yet to be created.
The general structure is designed to have the address or meeting site information (i.e. address, building name, accessibility) grouped in one table and the meeting level information (i.e. meeting time, day, type) grouped in another. This tables can be joined using the address_key column which exists in both.

Back in the Cloud9 service, node-postgres is used to access the database and execute SQL code, in this case, creating the aa_address table. This process used three separate files:
1. Create the table
2. Use the async module to loop through and insert each value into the table
3. Check the table contents to make sure everything was inserted properly.

All three scripts were initiated the same way, with the exception of wa04b.js, which included an additional line for the async module.

    const { Client } = require('pg')
    var async = require('async'); // wa04b.js only
    const dotenv = require('dotenv');
    dotenv.config();  
    
All three also included the credentials needed to access the database.

    var db_credentials = new Object();
    db_credentials.user = 'amina_brown';
    db_credentials.host = 'data-structures.csmsogfdecpu.us-east-1.rds.amazonaws.com';
    db_credentials.database = 'aa';
    db_credentials.password = process.env.AWS_DB_PW;
    db_credentials.port = 5432; 

For wa04a.js and wa04c.js, the same code was used to communicate with the database. It builds the connection, the sql code, and then passes the code to the database.

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
    
One noteworthy piece from the above code (wa04a.js), is the use of the "SERIAL" data type to initiate an auto incremented primary key.

For wa04b.js, the process uses the async module to loop through the list of addresses that was saved as json during weekly assignment 3. With the exception of the eachSeries loop, the code accessing the database is largely the same.

    async.eachSeries(addressesForDb, function(value, callback) {
        const client = new Client(db_credentials);
        client.connect();
        var thisQuery = "INSERT INTO aa_address VALUES (DEFAULT, E'" + value.address + "', " + value.latLong.lat + ", " + value.latLong.long + ");";
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
        setTimeout(callback, 1000); 
    }); 

Again, one piece to note is the "DEFAULT" term used to reference the primary key column created in the first script. This key will be used to join the address table to the meeting table.