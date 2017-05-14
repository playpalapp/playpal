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

angular.module('playpalApp').controller('gamesController', function ($scope, $timeout, $http, $q, ChatService, DataService, $uibModal) {
    //declaracao de variaveis

    $scope.logout = function () {
        localStorage.clear();
        location.reload();
        window.location.replace(window.location.origin = window.location.pathname);
    };

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


    $scope.estouLogado = function () {
        console.log($scope.user);
        return $scope.user !== undefined && $scope.user.email !== undefined && $scope.user.isUsuario !== undefined;
    };


    $scope.messageWrongpassord = undefined;


    $scope.saveUser = function () {
        if ($scope.getLoginMessage() !== "Sign in") {
            if (!$scope.user.name
                || !$scope.user.lastname
                || !$scope.user.email
                || !$scope.user.password) {
                $scope.messageWrongpassord = "Required fields not filled";
                return;
            }
        }


        if ($scope.user.email && $scope.user.password) {
            if ($scope.isCreateUser && $scope.hasUser($scope.user.email)) {
                $scope.messageWrongpassord = "This email is already used";
                return;
            }
            var usuario = $scope.getUser($scope.user.email);

            if (!usuario && $scope.isCreateUser) {
                $scope.user.isUsuario = true;
                DataService.usuarios.create($scope.user);
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

        if (!usuarios) {
            return false;
        }

        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i].email === email) {
                return true;
            }
        }
        return false;
    };

    $scope.getUser = function(email) {
        var usuarios = $scope.getUsers();
        if (!usuarios) {
            return undefined;
        }

        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i].email === email) {
                return usuarios[i];
            }
        }
    };

    $scope.getUsers = function () {
        return DataService.usuarios.all;
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

    $scope.marked = false;

    function play() {
        if (!$scope.marked) {
            var count = 0;
            $scope.marked = true;

            var chaves = Object.keys($scope.matchs);



            for (var i = 0; i < chaves.length; i++) {
                var match = $scope.matchs[chaves[i]];
                console.log(match);
                for (var j = 0; j < match.length; j++) {
                    var game = match[j];
                    $scope.findGame(game);
                    count++;
                }
            }
            console.log("CONTAGEM", count);
        }
    }

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

    $scope.joinTheGame = function () {
        DataService.matchs.create({
            'game': ChatService.getGame().id,
            'user': $scope.user
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
        if (!DataService.matchs.all) {
            return false;
        }

        for (var i = 0; i < DataService.matchs.all.length; i++) {
            var x = DataService.matchs.all[i];
            if (game.id === x.game && $scope.user.email === x.user) {
                return true;
            }
        }
    } ;

    $scope.kiModal = function (game) {
        return $scope.isInGame(game) ? "#chat" : "#confirmacao";
    };

    $scope.letschat = function (game) {
        ChatService.setGame(angular.copy(game))
    };

    $scope.findGame = function (game, flag) {

        codeAddress(game, flag);
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
            ||$scope.newgame.shirtColorOne == null
            ||$scope.newgame.shirtColorTwo == null
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
            shirtColorOne: $scope.newgame.shirtColorOne,
            shirtColorTwo: $scope.newgame.shirtColorTwo,
            zipcode:$scope.newgame.zipcode,
            numberOfPlayers: $scope.newgame.numberOfPlayers,
            date:(new Date($scope.newgame.date)),
            otherDetails: $scope.newgame.otherDetails,
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
                };
                game.lat = info.lat;
                game.long = info.long;
                createMarker(info);
            } else {
                // alert( 'Geocode was not successful for the following reason: ' + status );
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

                    // codeAddress($scope.matchs[$scope.gameList[0]][0])
                    play();
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
                console.log(">>>>>>>>>");
                console.log(Number(game.id), Number(id), Number(game.id) === Number(id));
                if (Number(game.id) === Number(id)) {
                    console.log("VAI RETORNAR");
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

app.controller('chatController', ['$scope','DataService', 'ChatService', function($scope, DataService, ChatService){

    $scope.user="Guest";

    $scope.messages= DataService.mensagens.all;

    $scope.mensagensJogos = [];

    $scope.getMensagens = function () {
        var game = ChatService.getGame();

        $scope.mensagensJogos.splice(0, $scope.mensagensJogos.length)

        for (var i = 0; i < DataService.mensagens.all.length; i++) {
            if (DataService.mensagens.all[i].gameId === game.id) {
                $scope.mensagensJogos.push(DataService.mensagens.all[i]);
            }
        }

        return $scope.mensagensJogos;
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
        // return "" + data.toTimeString().split(' ')[0].slice(0, 5) + ChatService.ampm(ChatService.getGame().date);
        return "" + data.getHours() + ":" + (data.getMinutes() >= 10 ? data.getMinutes() : "0" + data.getMinutes());
    };

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

        for (var i = 0; i < DataService.matchs.all.length; i++) {
            var match = DataService.matchs.all[i];

            if (game.id === match.game) {
                jogadores.push(match.user.name + " " + match.user.lastname);
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

    $scope.inserisci = function(message) {
        DataService.mensagens.create({
            'text': message,
            'user': ChatService.getUser(),
            'gameId': ChatService.getGame().id,
            'data': (new Date().toString())
        });
        $scope.texto = undefined;
    };

    $scope.getTime = function (mensagem) {
        var diff = Math.abs(new Date() - new Date(mensagem.data));
        return Math.floor((diff/1000)/60);
    };
}]);

function entidade(name, $firebaseArray) {
    return (function($firebaseArray) {
        var ref = firebase.database().ref(name);
        var collection = $firebaseArray(ref);

        return  {
            all: collection,
            create: function (data) {
                return collection.$add(data);
            },
            get: function (id) {
                return collection.child(id).$asObject();
            }
        };
    })($firebaseArray);
}

app.factory('Mensagens', ['$firebaseArray',
    function($firebaseArray) {
        return entidade('mensagens', $firebaseArray);
    }
]);

app.factory('Usuarios', ['$firebaseArray',
    function($firebaseArray) {
        return entidade('usuarios', $firebaseArray);
    }
]);

app.factory('Matchs', ['$firebaseArray',
    function($firebaseArray) {
        return entidade('matchs', $firebaseArray);
    }
]);

app.service("DataService", function(Mensagens, Usuarios, Matchs) {
    var self = this;

    this.mensagens = Mensagens;

    this.usuarios = Usuarios;

    this.matchs = Matchs;

    return this;
});