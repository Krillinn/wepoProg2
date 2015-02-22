ChatClient.controller('RoomsController', function($scope, $location, $rootScope, $routeParams, socket) {

    $scope.roomName = '';
    $scope.errorMessage = '';
    $scope.typoError = '';
    $scope.rooms = [];
    $scope.currentUser = $routeParams.user;
    $scope.currentUsers = [];
    $scope.roomInfo = undefined;
    $scope.roomPass = '';
    $scope.userEntered = {
        pass: ''
    };
    $scope.passRequired = false;
    $scope.privateSender = '';
    $scope.privateReceiver = '';
    $scope.currentPrivateUserMessage = '';
    $scope.incomingPrivateMessage = false;
    $scope.currentPrivateUserMessages = [];


    socket.emit('rooms');
    socket.emit('users');

    socket.on('roomlist', function(roomList) {
        $scope.rooms = Object.keys(roomList);
    });


    socket.on('roominfo', function(room, locked) {
        console.log("this is the room");
        console.log(room);
        console.log("is it locked?");
        console.log(locked);
    });


    socket.on('userlist', function(userList) {
        $scope.currentUsers = userList;
    });

    socket.on('globalRoomsErrorMessage', function(kickedUser, errorMessage) {
        if ($scope.currentUser === kickedUser) {
            $scope.errorMessage = errorMessage;
        }
    });

    socket.on('recv_privatemsg', function(messageSender, message) {
        $scope.privateSender = $scope.currentUser;
        $scope.privateReceiver = messageSender;
        $scope.sendPrivateSignal(messageSender);
        $scope.incomingPrivateMessage = true;
    });

    $scope.sendPrivateSignal = function(privateMessageReceiver) {
        $scope.incomingPrivateMessage = false;
        $scope.privateSender = $scope.currentUser; //sa sem sendir
        $scope.privateReceiver = privateMessageReceiver; //hver eg sendi á
        $scope.currentPrivateUserMessages = [];
        console.log("helleeeleelelel");
        var roomName = getPrivateRoomName($scope.privateReceiver, $scope.privateSender);
        socket.emit('getUpdatePrivateChat', {
            room: roomName
        });
    }

    getPrivateRoomName = function(privateReceiver, privateSender) {
        var roomName = [];
        roomName.push(privateReceiver);
        roomName.push(privateSender);
        roomName.sort();
        roomName.toString();
        return roomName;
    }

    $scope.sendPrivateMessage = function() {
        var roomName = getPrivateRoomName($scope.privateReceiver, $scope.privateSender);
        socket.emit('privatemsg', {
                room: roomName,
                nick: $scope.privateReceiver,
                message: $scope.currentPrivateUserMessage
            },
            function(success) {
                if (!success) {

                } else {
                    $scope.currentPrivateUserMessage = '';
                }
            });
    }

    socket.on('updateprivatechat', function(roomName, messageHistory) {
        console.log(messageHistory);
        $scope.currentPrivateUserMessages = messageHistory;
    });

    $scope.getPrivEnter = function(event) {
        if (event.which === 13) {
            $scope.sendPrivateMessage();
        }
    }

    $scope.getEnter = function(event) {
        if (event.which === 13) {
            $scope.submitRoomName();
        }
    }

    $scope.goToRoom = function(room) {
        var pass = $scope.userEntered.pass;
        socket.emit('joinroom', {
            room: room,
            pass: $scope.userEntered.pass
        }, function(success, reason) {
            if (!success) {
                $scope.errorMessage = reason;
            } else {
                $location.path('/room/' + $scope.currentUser + "/" + room);
            }
        });
    }

    $scope.submitRoomName = function() {
        var password = undefined;
        if ($scope.roomName === '') {
            $scope.typoError = 'Please choose a chat-name before continuing!';
        } else {

            if ($scope.roomPass != "") {
                password = $scope.roomPass;
            }
            socket.emit('joinroom', {
                room: $scope.roomName,
                pass: password
            }, function(success, reason) {
                if (!success) {
                    $scope.errorMessage = reason;
                } else {
                    $location.path('/room/' + $scope.currentUser + "/" + $scope.roomName);
                }
            });
        }
    }

});