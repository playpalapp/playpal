// app.js
var app = angular.module('playpalApp', []);

angular.module('playpalApp').controller('gamesController', function ($scope, $timeout, $http, $q) {

    //declaracao de variaveis

    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(25,80),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.markers = [];
    $scope.gameList =[];

    var infoWindow = new google.maps.InfoWindow();



    $scope.form = {}
    $scope.form.error = false;
    $scope.newgame = {};
    $scope.newgame.name;
    $scope.newgame.intensityLevel;
    $scope.newgame.numberOfPlayers = 1;
    $scope.newgame.gender;
    $scope.newgame.street;
    $scope.newgame.city;
    $scope.newgame.state;
    $scope.newgame.zipcode;
    $scope.newgame.date;
    $scope.newgame.players=[];

    $scope.matchs ={};

    $scope.ampm = function (date) {
        console.log(date);
        var hours = new Date(date).getHours();
        return hours >= 12 ? "PM" : "AM";
    }
    //Declarações de funçōes

    //Cria um novo ponto no mapa
    var createMarker = function (info){

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.city,
            icon: 'img/icon/' + "Sport" + '.png'
        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });

        $scope.markers.push(marker);

    }

    $scope.findGame = function (game) {

        codeAddress(game);
    }
    
    //cria um novo jogo
    $scope.createGame = function() {
        var time = $('#inputdate').val();
        $scope.newgame.date = new Date(time);
        if($scope.newgame.name == null
            ||$scope.newgame.intensityLevel == null
            ||$scope.newgame.gender == null
            ||$scope.newgame.street == null
            ||$scope.newgame.city == null
            ||$scope.newgame.state == null
            ||$scope.newgame.zipcode == null
            ||$scope.newgame.date == null
            ||$scope.newgame.numberOfPlayers ==null){

            $scope.form.error = true;
            return
        }





        senddata = {name:$scope.newgame.name,
            gender:$scope.newgame.gender,
            intensityLevel:$scope.newgame.intensityLevel,
            street:$scope.newgame.street,
            city:$scope.newgame.city,
            state:$scope.newgame.state,
            zipcode:$scope.newgame.zipcode,
            numberOfPlayers: $scope.newgame.numberOfPlayers,
            date:(new Date($scope.newgame.date)),
            players:[]}

        $http({
            method: 'POST',
            url: Properties.webserviceAddress+"/match",
            data: senddata
        }).
        success(function(response) {
            if(Object.keys(response).length  > 0){

                $scope.matchs = response;
                $scope.gameList = Object.keys(response);
                $scope.gameList.sort(function(a,b) {
                    a = a.split('/').reverse().join('');
                    b = b.split('/').reverse().join('');
                    return a > b ? 1 : a < b ? -1 : 0;
                });
                $('#myModal').modal('toggle');


                codeAddress($scope.newgame);

                $scope.newgame = {};
                $scope.newgame.name;
                $scope.newgame.intensityLevel;
                $scope.newgame.numberOfPlayers = 1;
                $scope.newgame.gender;
                $scope.newgame.street;
                $scope.newgame.city;
                $scope.newgame.state;
                $scope.newgame.zipcode;
                $scope.newgame.date;
                $scope.newgame.players=[];



            }
        }).
        error(function(status) {
            console.log("error");
        });


    };

    var geocoder = new google.maps.Geocoder();

    function codeAddress(game) {
        var address = game.street
            +", "+ game.city
            +", "+game.state
            +" "+game.zipcode
            //+", EUA";

        geocoder.geocode( { 'address' : address }, function( results, status ) {
            if( status == google.maps.GeocoderStatus.OK ) {

                //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
                $scope.map.setCenter( results[0].geometry.location );
                var marker = new google.maps.Marker( {
                    map     : map,
                    position: results[0].geometry.location
                } );
                info = {
                    city : game.city,
                        desc : game.name,
                    lat :
                        results[0].geometry.location.lat(),
                    long : results[0].geometry.location.lng()
                }
                createMarker(info);
            } else {
                alert( 'Geocode was not successful for the following reason: ' + status );
            }
        } );
    }


    //Chamada de funcões

    $http({
        method: 'GET',
        url: Properties.webserviceAddress+"/match/matchbydate"
    })
        .then(function(response) {
            // and then decide if we return
            switch (response.status) {
                // the estimated date timestamp
                case 200:
                    $scope.matchs = response.data;
                    for (var i = 0; i < $scope.matchs.length; i++) {
                        $scope.matchs[i].date = new Date($scope.matchs[i].date);
                    }
                    $scope.gameList = Object.keys(response.data);
                    console.log("ANTES", $scope.gameList, response.data);
                    $scope.gameList.sort(function(a,b) {
                        a = a.split('/').reverse().join('');
                        b = b.split('/').reverse().join('');
                        return a > b ? 1 : a < b ? -1 : 0;
                    });

                    console.log("depois", $scope.gameList, response.data);

                    codeAddress($scope.matchs[$scope.gameList[0]][0])
                // the response object
                default:
                    return response;

            }
        });



    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }

});

angular.module('playpalApp').factory('playpalSrvc', function($http, $q) {

    var geocoder;

    function geocodeCityName(latlng) {
        // Using AngularJS's 'defer' to return a promise
        var defer = $q.defer();
        // and the Geocoder from Google Maps API
        if (!geocoder) { geocoder = new google.maps.Geocoder();}
        // we ask google to geocode the data for our location
        geocoder.geocode(
            // we pass a GeocoderRequest object as parameter
            {
                location: latlng
            },
            // and expect some results
            function (results, status) {
                switch (status) {
                    // in case we get the data
                    case google.maps.GeocoderStatus.OK:
                        // we filter it for the 'locality' attribute
                        locality = results[0].address_components.filter(addressComponentsLocalityFilter)[0];
                        // and return it
                        defer.resolve(locality.long_name);
                        break;

                    // otherwise
                    case google.maps.GeocoderStatus.ZERO_RESULTS:
                    default:
                        // we log and throw back the error
                        console.log("Geocode was not successful for the following reason: " + status);
                        defer.reject(status);
                        break;
                }

                // that's a messy filter because reasons
                function addressComponentsLocalityFilter(address_component) {
                    return address_component.types.indexOf('locality') > -1 || address_component.types.indexOf('administrative_area_level_2') > -1;
                }
            }
        );

        // I promise I will return something to you =)
        return defer.promise;
    }



    function getGames() {
        return $http({
            method: 'GET',
            url: Properties.webserviceAddress+"/match"
        })
            .then(function(response) {
                // and then decide if we return
                switch (response.status) {
                    // the estimated date timestamp
                    case 200:
                        return response.data;
                    // the response object
                    default:
                        return response;

                }
            });
    }
    return {
        geocodeCityName:        geocodeCityName,
        geocodeLatLng:          geocodeLatLng,
        getGames:               getGames

    };
});