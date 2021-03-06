myApp.controller('MapCtrl', function($http, NgMap, $interval, $uibModal) {

  var vm = this;

  vm.showDining = true;
  vm.showLodging = true;
  vm.showNature = true;
  vm.showShopping = true;
  vm.showTrip = false;

  vm.diningPins = [];
  vm.lodgingPins = [];
  vm.naturePins = [];
  vm.shoppingPins = [];
  vm.selectedTripPins = [];

  vm.diningClass = 'navButton';
  vm.shoppingClass = 'navButton';
  vm.natureClass = 'navButton';
  vm.lodgingClass = 'navButton';
  vm.tripsClass = 'off';

  NgMap.getMap().then(function(map) {
    vm.map = map;
  });

  vm.options = {
    clickableIcons: "false"
  };

// detailed place info modal
  vm.clicked = function(place, size, parentSelector) {
    var parentElem = parentSelector;
    console.log('link clicked to see more info on: ', place);
    var modalInstance = $uibModal.open({
      animation: self.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'detailedPlaceInfo.html', // HTML in the modal.html template???
      controller: 'detailedPlaceInfoCtrl',
      controllerAs: 'dpic',
      size: size,
      appendTo: parentElem,
      resolve: {
        place: function() {
          return place;
        }
      }
    }); // end modalInstance
  };//end clicked


  vm.showDetail = function(e, place) {
    console.log('place: ', place);
    console.log('place.id: ', place.id);
    vm.place = place;
    vm.map.showInfoWindow('mapwindow', 'x' + place.id);
  };

  vm.hideDetail = function() {
    vm.map.hideInfoWindow('mapwindow');
  };

  vm.getAllPins = function() {
    console.log('dining button clicked');
    $http({
      method: 'GET',
      url: '/locations/getAllPins'
    }).then(function success(response) {
      console.log('getting all pins', response);
      vm.allPins = response.data;
      console.log('vm.allPins: ', vm.allPins);
      allPins = vm.allPins;

      for (var i = 0; i < allPins.length; i++) {
        switch (allPins[i].types_id) {
          case 1:
            vm.diningPins.push(allPins[i]);
            break;
          case 2:
            vm.shoppingPins.push(allPins[i]);
            break;
          case 3:
            vm.naturePins.push(allPins[i]);
            break;
          case 4:
            vm.lodgingPins.push(allPins[i]);
            break;
        }
      }
    }); //ending success
  }; //ending get allPins function
  vm.getAllPins();

  vm.toggleDining = function() {
    vm.showDining = !vm.showDining;
    console.log(vm.showDining);
    if (vm.diningClass === 'navButton') {
      vm.diningClass = 'off';
    } else {
      vm.diningClass = 'navButton';
    }
  };


  vm.toggleLodging = function() {
    vm.showLodging = !vm.showLodging;
    console.log(vm.showLodging);
    if (vm.lodgingClass === 'navButton') {
      vm.lodgingClass = 'off';
    } else {
      vm.lodgingClass = 'navButton';
    }
  };


  vm.toggleNature = function() {
    vm.showNature = !vm.showNature;
    console.log(vm.showNature);
    if (vm.natureClass === 'navButton') {
      vm.natureClass = 'off';
    } else {
      vm.natureClass = 'navButton';
    }
  };

  vm.toggleShopping = function() {
    vm.showShopping = !vm.showShopping;
    console.log(vm.showShopping);
    if (vm.shoppingClass === 'navButton') {
      vm.shoppingClass = 'off';
    } else {
      vm.shoppingClass = 'navButton';
    }
  };

  vm.resetMap = function() {
    location.reload();
  };

  // use this code if you want to slide on top of content
  vm.openNav = function() {
    //set directions to false before getting the trip
    vm.directions=false;
    console.log('toggle hamburger menu');
    if (document.getElementById('mySidenav').style.width === '25%') {
      document.getElementById('mySidenav').style.width = '0%';
    } else {
      document.getElementById('mySidenav').style.width = '25%';
    }
    if (vm.tripsClass === 'navButton') {
      vm.tripsClass = 'off';
    } else {
      vm.tripsClass = 'navButton';
    }

    $http({
      method: 'GET',
      url: '/pool/getTrips/'
    }).then(function success(response) {
      console.log('getting all trips', response);
      vm.allTrips = response.data;
      console.log('vm.allTrips: ', vm.allTrips);
      allTrips = vm.allTrips;
    });
  };


  /* Set the width of the side navigation to 0 */
  vm.closeNav = function() {
    if (document.getElementById('mySidenav').style.width === '25%') {
      document.getElementById('mySidenav').style.width = '0%';
    } else {
      document.getElementById('mySidenav').style.width = '25%';
    }
    if (vm.tripsClass === 'navButton') {
      vm.tripsClass = 'off';
    } else {
      vm.tripsClass = 'navButton';
    }
  };


  vm.suggested = function(trip) {
    console.log('suggested clicked for trip:', trip);
    //for road trip on map
    vm.trip = trip;
    vm.wayPoints = [];
    vm.lastStop = [];
    console.log("STOPS ON TRIP:",vm.wayPoints);
    console.log("LAST STOP ON TRIP",vm.lastStop);
    $http({
      method: 'GET',
      url: '/pool/getLocationByTripId/' + trip.id
    }).then(function success(response) {
      // console.log('back from server with trip selection response: ', response);

      vm.selectedTripPins = response.data;
      // console.log('vm.selectedTripPins: ', vm.selectedTripPins);
      vm.showTrip = true;
      vm.showDining = false;
      vm.showLodging = false;
      vm.showNature = false;
      vm.showShopping = false;
      vm.shoppingClass = 'off';
      vm.diningClass = 'off';
      vm.natureClass = 'off';
      vm.lodgingClass = 'off';
      vm.hideDetail();
      vm.closeNav();


      //find coordinates for each place and convert to number
      vm.locationsInTrip = [];

      vm.selectedTripPins.forEach(function(i){
        vm.locationsInTrip.push(i.name);

        var stopLat = Number.parseFloat(i.latitude,10 );
        var stopLng = Number.parseFloat(i.longitude,10 );

        //put coordinates in the stopToSend Object!
        var stopToSend = {location: {lat:stopLat, lng: stopLng}, stopover: true};
        vm.wayPoints.push(stopToSend);
      });
       vm.locationsInTripString = vm.locationsInTrip.join(", ");
      //make last place in trip the final stop on route in map
      var finalStopLat=vm.wayPoints[vm.wayPoints.length - 1].location.lat;
      var finalStopLng=vm.wayPoints[vm.wayPoints.length - 1].location.lng;

      //chop final location from wayPoints
      vm.wayPoints.splice(vm.wayPoints.length-1,1);

      //push coordinates of final stop into last stop array!!
      vm.lastStop.push(finalStopLat,finalStopLng);
      console.log(vm.wayPoints);
      console.log(vm.lastStop);

      vm.directions=true;
    });
  };
});

// modal controller
myApp.controller( 'detailedPlaceInfoCtrl', [ '$uibModalInstance', '$uibModal', '$http', 'place', function ( $uibModalInstance, $uibModal, $http, place ) {
  var vm = this;

  console.log('in detailed place info controller for place: ', place);

  vm.name = place.name;
  vm.phone = place.phone;
  vm.street = place.street;
  vm.city = place.city;
  vm.state = place.state;
  vm.zipcode = place.zipcode;
  vm.website = place.website;
  vm.description = place.description;
  vm.imageurl = place.imageurl;


  // when OK button is clicked on modal
  vm.okay = function() {
    console.log('okay button clicked--modal closing');
    $uibModalInstance.close();
  }; // end ok

}]); // end detailedPlaceInfoCtrl
