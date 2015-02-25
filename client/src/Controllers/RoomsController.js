angular.module('ChatClient').controller('RoomsController', ["$scope","$location","$rootScope","$routeParams","socket",
	function($scope, $location, $rootScope, $routeParams, socket) {
	$scope.roomName = '';
	$scope.errorMessage = '';
	$scope.typoError = '';
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.rooms = undefined;
	$scope.roomsObj = undefined;
	$scope.roomPass = undefined;
	$scope.passRequired = false;

	$scope.privateSender = '';
	$scope.privateReceiver = '';
	$scope.currentPrivateUserMessage = '';
	$scope.incomingPrivateMessage = false;
	$scope.currentPrivateUserMessages = [];

	socket.emit('rooms');
	socket.emit('users');

	$scope.logOut = function () {
		socket.emit('disconect');
		$location.path('/login/');
	};

    socket.on('updateusersInRooms', function(users) {
    	console.log("HERE");
    	console.log(users);
        socket.emit('users');
    });

	socket.on('roomlist', function(roomList) {
		$scope.rooms = Object.keys(roomList);
		// whatsup dawg
		$scope.roomsObj = Object(roomList);
		//console.log($scope.roomsObj);
		//var name = Object.getOwnPropertyNames(roomList)[0];
		//console.log(name);
		//console.log($scope.roomsObj[name].locked);
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

	$scope.getPrivateRoomName = function(privateReceiver, privateSender) {
		var roomName = [];
		roomName.push(privateReceiver);
		roomName.push(privateSender);
		roomName.sort();
		roomName.toString();
		return roomName;
	};	

	$scope.sendPrivateSignal = function(privateMessageReceiver) {
		$scope.incomingPrivateMessage = false;
		$scope.privateSender = $scope.currentUser; //sa sem sendir
		$scope.privateReceiver = privateMessageReceiver; //hver eg sendi á
		$scope.currentPrivateUserMessages = [];
		console.log("helleeeleelelel");
		var roomName = $scope.getPrivateRoomName($scope.privateReceiver, $scope.privateSender);
		socket.emit('getUpdatePrivateChat', {
			room: roomName
		});
	};

	$scope.sendPrivateMessage = function() {
		var roomName = $scope.getPrivateRoomName($scope.privateReceiver, $scope.privateSender);
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
	};

	socket.on('updateprivatechat', function(roomName, messageHistory) {
		//console.log(messageHistory);
		$scope.currentPrivateUserMessages = messageHistory;
	});

	$scope.getPrivEnter = function(event) {
		if (event.which === 13) {
			$scope.sendPrivateMessage();
		}
	};

	$scope.getEnter = function(event) {
		if (event.which === 13) {
			$scope.submitRoomName();
		}
	};

	$scope.goToRoom = function(room) {
		socket.emit('joinroom', {
			room: room,
			pass: $scope.roomsObj[room].passkey
		}, function(success, reason) {
			if (!success) {
				$scope.errorMessage = reason;
			} else {
				$location.path('/room/' + $scope.currentUser + "/" + room);
			}
		});
	};

	$scope.submitRoomName = function() {
		if ($scope.roomName === '') {
			$scope.typoError = 'Please choose a chat-name before continuing!';
		} else {

			// if ($scope.roomPass !== "") {
			// 	password = $scope.roomPass;
			// }
			socket.emit('joinroom', {
				room: $scope.roomName,
				pass:  $scope.roomPass
			}, function(success, reason) {
				if (!success) {
					$scope.errorMessage = reason;
				} else {
					$location.path('/room/' + $scope.currentUser + "/" + $scope.roomName);
				}
			});
		}
	};

}]);