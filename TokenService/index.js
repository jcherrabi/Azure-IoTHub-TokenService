var restify = require('restify');
var fs = require('fs');
var iothub = require('azure-iothub');
var secrets = require('./secrets.js');
var connectionString = secrets.iotHubDeviceConnectionString;

var registry = iothub.Registry.fromConnectionString(connectionString);

function respond(req, res, next) {
    var endpoint = "vjdemosiothub.azure-devices.net/devices/" + req.params.deviceid;
    var deviceKey = getDeviceKey(deviceid);

    var token = generateSasToken(endpoint, deviceKey, null, 60);

    res.send('hello ' + req.params.name);
    next();
}

// var https_options = {
//     key: fs.readFileSync('./vjdemospublic.key'),
//     certificate: fs.readFileSync('./vjdemos.pem')
// };

//var server = restify.createServer(https_options);
var server = restify.createServer();
server.get('/token/:deviceid', respond);

server.listen(80, function () {
    console.log('%s listening at %s', server.name, server.url);
});

var generateSasToken = function (resourceUri, signingKey, policyName, expiresInMins) {
    resourceUri = encodeURIComponent(resourceUri);

    // Set expiration in seconds
    var expires = (Date.now() / 1000) + expiresInMins * 60;
    expires = Math.ceil(expires);
    var toSign = resourceUri + '\n' + expires;

    // Use crypto
    var hmac = crypto.createHmac('sha256', new Buffer(signingKey, 'base64'));
    hmac.update(toSign);
    var base64UriEncoded = encodeURIComponent(hmac.digest('base64'));

    // Construct autorization string
    var token = "SharedAccessSignature sr=" + resourceUri + "&sig=" +
        base64UriEncoded + "&se=" + expires;
    if (policyName) token += "&skn=" + policyName;
    return token;
};

var getDeviceKey = function (deviceid) {
    registry.get(deviceid, function next() {
        var key = device.authentication ? device.authentication.symmetricKey.primaryKey : '<no primary key>';
        console.log(device.deviceId);
        return key;
    });
}