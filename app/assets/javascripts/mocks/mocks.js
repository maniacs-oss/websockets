'use strict';

// Test app
var test = angular.module('test', ['lelylan.components.device', 'ngMockE2E']);

// Socket wrapper
test.factory('socket', function ($rootScope) {
  var socket = io.connect('http://localhost:8003');

  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});


test.run(function($httpBackend, LoggedUser) {
  LoggedUser.set({ id: "1", full_name: 'Alice' })

  $httpBackend.when('GET', /\/templates\//).passThrough();
  $httpBackend.when('PUT', '/update').passThrough();

  $httpBackend.whenGET('http://api.lelylan.com/devices/1').respond(device);
  $httpBackend.whenGET('http://api.lelylan.com/devices/1/privates').respond(privates);

  $httpBackend.whenGET('http://api.lelylan.com/devices/2').respond(device2);
  $httpBackend.whenGET('http://api.lelylan.com/devices/2/privates').respond(privates);

  $httpBackend.whenGET('http://api.lelylan.com/devices/3').respond(device3);
  $httpBackend.whenGET('http://api.lelylan.com/devices/3/privates').respond(privates);

  $httpBackend.whenGET('http://api.lelylan.com/devices/4').respond(device4);
  $httpBackend.whenGET('http://api.lelylan.com/devices/4/privates').respond(privates);

  $httpBackend.whenGET('http://api.lelylan.com/types/1').respond(type);

  $httpBackend.whenPUT(/http:\/\/api.lelylan.com\/devices/)
    .respond(function(method, url, data, headers){ return [200, updateDevice(data), {}]; });

  $httpBackend.whenPUT('http://api.lelylan.com/devices/1/properties')
    .respond(function(method, url, data, headers){ return [200, updateDevice(data), {}]; });
  $httpBackend.whenPUT('http://api.lelylan.com/devices/2/properties')
    .respond(function(method, url, data, headers) { return [200, updateDevice(data), {}]; });

  $httpBackend.whenDELETE('http://api.lelylan.com/devices/1').respond(device);
  $httpBackend.whenDELETE('http://api.lelylan.com/devices/2').respond(device);


  var updateDevice = function(data) {
    data = angular.fromJson(data);
    var resource = (data.id == '1') ? angular.copy(device) : angular.copy(device2);

    if (data.name) resource.name = data.name;
    if (data.physical) resource.physical = data.physical;

    _.each(data.properties, function(property) {
      var result = _.find(resource.properties, function(_property){ return _property.id == property.id; });
      result.expected = result.value = property.expected;
    });

    return resource;
  }
});

