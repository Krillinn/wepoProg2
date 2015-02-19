ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	$scope.currentMessages = [];
	$scope.currentUserMessage = '';

		//adds a new room and pends current user information
	for(i = 0; i < 2; i++) {
		socket.emit('joinroom', { room: $routeParams.room, pass: undefined }, function (success, reason) {
			if (!success) {
				$scope.errorMessage = reason;
			} else {
				socket.emit('rooms');
			}
		}); 
	}

	//TODO 200 chars error handler asap
	$scope.submitMessage = function() {
		if($scope.currentUserMessage === '') {
			$scope.errorMessage = 'Please choose a message to send!';
		} else {
			socket.emit('sendmsg', { roomName: $routeParams.room, msg: $scope.currentUserMessage });
		}
	}
	//TODO acces the data...
	socket.on('updatechat', function(roomName, messageHistory) {
		var obj = messageHistory;
		var allMessages = [];
		for(var i = 0; i < obj.length; i++) {
			allMessages.push(obj[i].message);
		}
		$scope.currentMessages = allMessages;
	});

	$scope.leaveRoom = function() {
		console.log("in delete");
		socket.emit('partroom', $routeParams.room);
		$location.path('/rooms/' + $routeParams.user);
	}

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		$scope.currentUsers = users;
	});

});