const https = require('https');
var parseString = require('xml2js').parseString;

exports.getRequest = function(req, callback) {
    https.get(req, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
            parseString(data, function (err, result) {
            callback(result);
        });
    });

    }).on("error", (err) => {
    console.log("Error: " + err.message);
    });
}
