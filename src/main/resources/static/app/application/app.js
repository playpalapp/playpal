// app.js
var app = angular.module('playpalApp', ['firebase', 'ui.bootstrap', 'ngMap']);

app.service('ChatService', [function() {
    var self = this;

    this.getGame = function () {
        return self.game;
    };

    this.setGame = function (game) {
        self.game = game;
    };

    this.getUser = function () {
        return self.user;
    };

    this.setUser = function (user) {
        self.user = user;
    };

    this.ampm = function (date) {
        var hours = new Date(date).getHours();
        return hours >= 12 ? "PM" : "AM";
    };
}]);

angular.module('playpalApp').controller('gamesController', function ($scope, $timeout, $http, $q, ChatService, Message, $uibModal) {
    //declaracao de variaveis


    $scope.isCreateUser = false;

    $scope.setIsCreateUser = function() {
      $scope.isCreateUser = !$scope.isCreateUser;
    };

    $scope.getLoginMessage = function () {
        return $scope.isCreateUser ? "Create Account" : "Sign in";
    };

    $scope.user = {};

    var jsonUser = JSON.parse(window.localStorage.getItem('play-user'));
    if (jsonUser !== null) {
        $scope.user = jsonUser;
        ChatService.setUser($scope.user);
    } else {
    }

    $scope.messageWrongpassord = undefined;


    $scope.saveUser = function () {
        if ($scope.user.email && $scope.user.password) {
            if ($scope.isCreateUser && $scope.hasUser($scope.user.email)) {
                $scope.messageWrongpassord = "This email is already used";
                return;
            }
            var usuario = $scope.getUser($scope.user.email);
            $scope.user = usuario;
            if (!usuario && $scope.isCreateUser) {
                $scope.user = {
                    email: $scope.user.email,
                    password: $scope.user.password,
                    isUsuario: true
                };
                Message.all.$add($scope.user);
                window.localStorage.setItem('play-user', JSON.stringify($scope.user));
                $scope.messageWrongpassord = undefined;
                return;
            }

            if (!usuario && !$scope.isCreateUser) {
                $scope.messageWrongpassord = "There is no account with this email";
                return;
            }


            if (usuario && $scope.user.password !== usuario.password) {
                $scope.messageWrongpassord = "You user or password not exist or is incorrect";
            } else {
                $scope.user = usuario;
                window.localStorage.setItem('play-user', JSON.stringify($scope.user));
            }
        }
    };

    $scope.hasUser = function (email) {
        var usuarios = $scope.getUsers();

        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i].email === email) {
                return true;
            }
        }
        return false;
    };

    $scope.getUser = function(email) {
        var usuarios = $scope.getUsers();
        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i].email === email) {
                return usuarios[i];
            }
        }
    };

    $scope.getUsers = function () {
        var usuarios = [];

        for (var i = 0; i < Message.all.length; i++) {
            if (Message.all[i].isUsuario) {
                usuarios.push(Message.all[i]);
            }
        }

        return usuarios;
    };

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

    $scope.getHours = function(date) {
        var d = new Date(date);

        var result = d.getHours() % 12;

        if (result == 0) {
            result = 12;
        }
        return result;
    };

    $scope.getMin = function(date) {
        var d = new Date(date);

        var result = d.getMinutes();
        if (result == 0) { result = "00";}
        return result;
    };



    $scope.ampm = function (date) {
       return ChatService.ampm(date);
    };
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

    };

    $scope.getUsuariosGame = function (game) {

    };

    $scope.joinTheGame = function () {
      Message.all.$add({
          'game': ChatService.getGame().id,
          'user': $scope.user.email,
          'isX': true
      });
    };

    $scope.teco = false;

    $scope.tecando = function () {
      $scope.teco = !$scope.teco;
    };

    $scope.neverSee = function () {
        return $scope.teco;
    };

    $scope.isInGame = function(game) {
        var xs = [];

        for (var i = 0; i < Message.all.length; i++) {
            if (Message.all[i].isX) {
                var x = Message.all[i];
                xs.push(x);
                if (game.id === x.game && $scope.user.email === x.user) {
                    return true;
                }
            }
        }
    } ;

    $scope.kiModal = function (game) {
        return $scope.isInGame(game) ? "#chat" : "#confirmacao";
    };

    $scope.letschat = function (game) {
        ChatService.setGame(angular.copy(game))
    };

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
            ||$scope.newgame.shirtColor == null
            ||$scope.newgame.zipcode == null
            ||$scope.newgame.date == null
            ||$scope.newgame.numberOfPlayers ==null){

            $scope.form.error = true;
            return
        }

        $scope.order = function(a, b) {
            a = a.split('/').reverse().join('');
            b = b.split('/').reverse().join('');
            return a > b ? 1 : a < b ? -1 : 0;
        };



        senddata = {name:$scope.newgame.name,
            gender:$scope.newgame.gender,
            intensityLevel:$scope.newgame.intensityLevel,
            street:$scope.newgame.street,
            city:$scope.newgame.city,
            state:$scope.newgame.state,
            shirtColor: $scope.newgame.shirtColor,
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
                burn($scope.matchs);
                $scope.gameList = Object.keys(response);
                $scope.gameList.sort($scope.order);
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
                var date = new Date(game.date);
                date = date.toString().split(" ");
                info = {
                    city : game.city,
                        desc : "At " + date[2] + "/" + date[1] + " " + date[4].slice(0, 5) + " Gender: " + game.gender + " Intensity: " + game.intensityLevel,
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
                    burn($scope.matchs);
                    $scope.gameList = Object.keys(response.data);
                    $scope.gameList.sort($scope.order);

                    codeAddress($scope.matchs[$scope.gameList[0]][0])
                // the response object
                default:
                    return response;

            }
        });

    function burn(lista) {
        for (var i = 0; i < Object.keys(lista).length; i++) {
            var el = lista[Object.keys(lista)[i]];
            el.sort(function(a, b) {
                return a.date - b.date;
            });
        }
    }


    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    };

    $scope.fechaModal = function () {
      $scope.modalVar.close();
    };

    $scope.modalVar = undefined;

    $scope.clicou = function (game, flag) {
        if (flag) {
            console.log(flag);
            console.log(window.location.href, game.id);
            console.log(window.location);
            window.location.replace(window.location.origin = window.location.pathname + "?id=" + game.id);
        } else {
            console.log("vai dar certo");
        }

        if (game !== undefined) {
            ChatService.setGame(angular.copy(game));
        }
        if ($scope.user && $scope.user.isUsuario) {
            $scope.modalVar = $uibModal.open({
                templateUrl: 'modal-chat.html',
                scope: $scope,
                size: 'lg',
                windowClass: 'app-modal-chat'
            });
        } else {
            $scope.modalVar = $uibModal.open({
                templateUrl: 'modal-login.html',
                scope: $scope,
                size: 50,
                ariaLabelledBy: ''
            });
        }
    };

    function getgamebyid(id) {
        console.log($scope.matchs);

        var chaves = Object.keys($scope.matchs);

        for (var i = 0; i < chaves.length; i++) {
            var match = $scope.matchs[chaves[i]];
            console.log("match", match);
            for (var j = 0; j < match.length; j++) {
                var game = match[j];
                if (game.id === id) {
                    return game;
                }
            }
        }
    }

    setTimeout(function() {
        var id = window.location.search;

        if (id !== "") {
            id = id.split("=")[1];
            var game = getgamebyid(id);
            // console.log("GAME", game);
            $scope.clicou(game);
        }
    }, 1000);
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

app.controller('chatController', ['$scope','Message', 'ChatService', function($scope, Message, ChatService){

    $scope.user="Guest";

    $scope.messages= Message.all;

    $scope.getMensagens = function () {
        var game = ChatService.getGame();
        var msgs = [];

        for (var i = 0; i < $scope.messages.length; i++) {
            if (!$scope.messages[i].isUsuario && $scope.messages[i].hash === game.id) {
                msgs.push($scope.messages[i]);
            }
        }

        return msgs;
    };

    $scope.showMap = false;

    $scope.mostraMapa = function () {
        setTimeout(function () {
            $scope.showMap = true;
            $scope.$apply();
        }, 500);
    };

    $scope.getGame = function () {
        return ChatService.getGame();
    };

    var weekday = new Array(7);
    weekday[0] =  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    $scope.getDetailsDate = function() {
        var data = ChatService.getGame().date;
        data = new Date(data);
        return "" + weekday[data.getDay()] + ", " + monthNames[data.getMonth()] + " " + data.getDate() + "th";
    };

    $scope.getDetailsTime = function () {
        var data = ChatService.getGame().date;
        data = new Date(data);
        return "" + data.toTimeString().split(' ')[0].slice(0, 5) + ChatService.ampm(ChatService.getGame().date);
    };
    //
    // Message.all.$add({
    //     'game': ChatService.getGame().id,
    //     'user': $scope.user.email,
    //     'isX': true
    // });

    $scope.contem = function(lista, item) {
        for (var i = 0; i < lista.length; i++) {
            if (lista[i] === item) {
                return true;
            }
        }

        return false;
    };

    $scope.lat = 40.7219354;
    $scope.lng = -73.8904167;

    $scope.getPlayers = function () {
        var game = ChatService.getGame();
        var jogadores = [];

        for (var i = 0; i < $scope.messages.length; i++) {
            var email =$scope.messages[i].user;
            if ($scope.messages[i].isX && $scope.messages[i].game === game.id && !$scope.contem(jogadores, email)) {
                jogadores.push(email);
            }
        }

        return jogadores;
    };



    $scope.numberPlay = function () {
        return $scope.getPlayers().length;
    };

    $scope.getTitle = function() {
        var data = ChatService.getGame().date;
        data = new Date(data);
        var title = "";
        title += weekday[data.getDay()] + ", " + monthNames[data.getMonth()];
        title += " " + data.getDate() + "th - " + data.toTimeString().split(' ')[0].slice(0, 5) + ChatService.ampm(ChatService.getGame().date);
        title += " - " + ChatService.getGame().street;

        return title;
    };

    $scope.inserisci = function(message){
        Message.create(message, ChatService.getUser(), ChatService.getGame().id);
        $scope.texto = undefined;
    };

    $scope.getTime = function (mensagem) {
        var diff = Math.abs(new Date() - new Date(mensagem.data));
        return Math.floor((diff/1000)/60);
    };
}]);

app.factory('Message', ['$firebaseArray', '$firebaseArray',
    function($firebaseArray, $firebaseArray) {
        var ref = firebase.database().ref();
        var messages = $firebaseArray(ref);

        var Message = {
            all: messages,
            create: function (message, autor, hash) {
                return messages.$add({
                    texto: message,
                    autor: autor.email,
                    data: new Date().toString(),
                    hash: hash,
                    isUsuario: false
                });
            },
            get: function (messageId) {
                return messages.child(messageId).$asObject();
            },
            delete: function (message) {
                return messages.$remove(message);
            }
        };

        return Message;

    }
]);
