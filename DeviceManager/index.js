'use strict';

var iothub = require('azure-iothub');
var secrets = require('./secrets.js');

var connectionString = secrets.iotHubConnectionString;

var registry = iothub.Registry.fromConnectionString(connectionString);

var device = {
    deviceId: 'secureDevice1'
  }
  registry.create(device, function(err, deviceInfo, res) {
    if (err) {
      registry.get(device.deviceId, printDeviceInfo);
    }
    if (deviceInfo) {
      printDeviceInfo(err, deviceInfo, res)
    }
  });
  
  function printDeviceInfo(err, deviceInfo, res) {
    if (deviceInfo) {
      console.log('Device ID: ' + deviceInfo.deviceId);
      console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
    }
  }