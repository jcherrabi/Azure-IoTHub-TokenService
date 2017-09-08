var iothub = require('azure-iothub');
const crypto = require('crypto');

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;

var endpoint ="vjdemosiothub.azure-devices.net/devices/secureDevice1";
var deviceKey ="zIiIAdzvXF/2jBBXvHiOtcFszWvqbqFhLhELUA0NyNw=";

var sas = generateSasToken(endpoint, deviceKey, null, 60);

var client = Client.fromSharedAccessSignature(sas, Protocol);

console.log(sas);



var connectCallback = function (err) {
    if (err) {
      console.error('Could not connect: ' + err);
    } else {
      console.log('Client connected');
      client.on('message', function (msg) {
        console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
        client.complete(msg, printResultFor('completed'));
      });
  
     
      var sendInterval = setInterval(function () {
        var windSpeed = 10 + (Math.random() * 4); // range: [10, 14]
        var temperature = 20 + (Math.random() * 10); // range: [20, 30]
        var humidity = 60 + (Math.random() * 20); // range: [60, 80]
        var data = JSON.stringify({ deviceId: 'myFirstDevice', windSpeed: windSpeed, temperature: temperature, humidity: humidity });
        var message = new Message(data);
        message.properties.add('temperatureAlert', (temperature > 28) ? 'true' : 'false');      
        console.log('Sending message: ' + message.getData());
        client.sendEvent(message, printResultFor('send'));
      }, 2000);
  
      client.on('error', function (err) {
        console.error(err.message);
      });
  
      client.on('disconnect', function () {
        clearInterval(sendInterval);
        client.removeAllListeners();
        client.open(connectCallback);
      });
    }
  };

  client.open(connectCallback);

function generateSasToken(resourceUri, signingKey, policyName, expiresInMins) {
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
    var token = "SharedAccessSignature sr=" + resourceUri + "&sig="
    + base64UriEncoded + "&se=" + expires;
    if (policyName) token += "&skn="+policyName;
    return token;
};

function printResultFor(op) {
    return function printResult(err, res) {
      if (err) console.log(op + ' error: ' + err.toString());
      if (res) console.log(op + ' status: ' + res.constructor.name);
    };
  }

//Id,PrimaryKey,SecondaryKey,PrimaryThumbPrint,SecondaryThumbPrint,ConnectionString,ConnectionState,LastActivityTime,LastConnectionStateUpdatedTime,LastStateUpdatedTime,MessageCount,State,SuspensionReason
//secureDevice1,zIiIAdzvXF/2jBBXvHiOtcFszWvqbqFhLhELUA0NyNw=,A5Wjwlf+0TuievAtj6FNk+e1Xc+H7Mcmq4rhSIqVpM0=,,,HostName=vjdemosiothub.azure-devices.net;DeviceId=secureDevice1;SharedAccessKey=zIiIAdzvXF/2jBBXvHiOtcFszWvqbqFhLhELUA0NyNw=,Disconnected,1/1/0001 12:00:00 AM,1/1/0001 12:00:00 AM,1/1/0001 12:00:00 AM,0,Enabled,