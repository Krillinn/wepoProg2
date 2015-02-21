ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {

	$scope.roomName = '';
	$scope.errorMessage = '';
	$scope.typoError = '';
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];

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

	socket.on('userlist', function(userList) {
		$scope.currentUsers = userList;
	});

	socket.on('globalRoomsErrorMessage', function (kickedUser, errorMessage) {
		if($scope.currentUser === kickedUser) {
			$scope.errorMessage = errorMessage;
		}
	});

	socket.on('recv_privatemsg', function (messageSender, message) {
		$scope.privateSender = $scope.currentUser;
		$scope.privateReceiver = messageSender;
		$scope.sendPrivateSignal(messageSender);
		$scope.incomingPrivateMessage = true;
	});

	$scope.sendPrivateSignal = function (privateMessageReceiver) {
		$scope.privateSender = $scope.currentUser;		//sa sem sendir
		$scope.privateReceiver = privateMessageReceiver; //hver eg sendi á
		var roomName = getPrivateRoomName($scope.privateReceiver, $scope.privateSender);
		socket.emit('getUpdatePrivateChat', { room: roomName });
	}

	getPrivateRoomName = function (privateReceiver, privateSender) {
		var roomName = [];
		roomName.push(privateReceiver);
		roomName.push(privateSender);
		roomName.sort();
		roomName.toString();
		return roomName;
	}

	$scope.sendPrivateMessage = function () {
		var roomName = getPrivateRoomName($scope.privateReceiver, $scope.privateSender);
		socket.emit('privatemsg', { room: roomName,  nick:  $scope.privateReceiver, message: $scope.currentPrivateUserMessage }, 
		function (success) {
			if(!success) {
				
			}
			else {
				$scope.currentPrivateUserMessage = '';
			}
		});
	}

	socket.on('updateprivatechat', function (roomName, messageHistory) {
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
		socket.emit('joinroom', { room: room, pass: undefined }, function (success, reason) {
			if (!success) {
				$scope.errorMessage = reason;
			}
			else {
				$location.path('/room/' + $scope.currentUser + "/" + room);
			}
		}); 
	}

	$scope.submitRoomName = function() {
		if($scope.roomName === '') {
			$scope.typoError = 'Please choose a chat-name before continuing!';
		}
		else {
			socket.emit('joinroom', { room: $scope.roomName, pass: undefined }, function (success, reason) {
				if (!success) {
					$scope.errorMessage = reason;
				}
				else {
					$location.path('/room/' + $scope.currentUser + "/" + $scope.roomName);
				}
			}); 
		}
	}
});








