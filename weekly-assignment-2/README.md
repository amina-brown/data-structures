## Weekly Assignment 2
This assignment was to parse out the addresses from one of the files produced by last weeks assignment. The file chosen was dependent on the last digit of your N number.

First, the appropriate modules and content are downloaded and the variables are declared:

    var fs = require('fs');
    var cheerio = require('cheerio');

    // load the text file into a variable, `content`
    var content = fs.readFileSync('data/m6.txt');

    // load `content` into a cheerio object
    var $ = cheerio.load(content);

    var addresses = ''; // this variable will hold the lines of text
    
The variables include the text file of interest and the empty string that will eventually house the output. The standard cheerio variable "$" is also declared, which allows the cheerio commands to interact with the text file.

Next, another varible is created with undesirable html elements and classes that have been flagged for removal. This array is then used to loop through the file and remove any items that are distinguishable via the listed characteristics.

    var remove = ["form","a","b","h1","h4",".detailsBox"]
    for (let i= 0; i < remove.length; i++) {
        $(remove[i]).remove()
    }

Next, using the selection operator from the proper html element is specified. Then the each function is applied to loop through all the proper elements. The loop uses the specified element and the text function to pull the text values from the html. From there, the split function operator is used to pull on the street address of each location. The if statement then comes into play to parse out any unwanted pieces that were either formatted differently or could not be identified using the remove loop or the cheerio selector.

    $('center table tbody tr td table tbody tr td table tbody tr td').each(function(i, elem) {
        let address = ($(elem)
                        .text())
                        .trim()
                        .split(",");
        if (address[1] && address[0].search("=") == -1) {
            address = address[0].split(".")
            address = address[0].split("-")
        addresses += address[0] + '\n';}
    });
    
Finally, the addresses text variable is saved to a text file.

    fs.writeFileSync('data/addresses.txt', addresses);