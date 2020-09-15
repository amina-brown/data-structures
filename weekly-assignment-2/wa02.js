// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the text file into a variable, `content`
var content = fs.readFileSync('data/m6.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

var addresses = ''; // this variable will hold the lines of text

var remove = ["form","a","b","h1","h4",".detailsBox"]
for (let i= 0; i < remove.length; i++) {
    $(remove[i]).remove()
}

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

fs.writeFileSync('data/addresses.txt', addresses);