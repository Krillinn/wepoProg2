ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	$scope.currentMessages = [];
	$scope.currentUserMessage = '';
	$scope.successMessage = '';
	$scope.isOp = false;

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
		}
		else if($scope.currentUserMessage.length >= 200) {
				$scope.errorMessage = 'Maximum length of message is 200 characters!';
		}
		else {
			socket.emit('sendmsg', { roomName: $routeParams.room, msg: $scope.currentUserMessage });
		}
	}
	//TODO acces the data...
	socket.on('updatechat', function(roomName, messageHistory) {
		$scope.currentMessages = messageHistory;
	});

	$scope.kickUser = function(user){
		socket.emit('kick', { user: user, room: $scope.currentRoom }, function (success, reason) {
			if(!success) {
				$scope.errorMessage = 'Sorry, no user found';
			}
		});
	}

	socket.on('kicked', function (room, kickedUser, kicker) {
		if(kickedUser === $scope.currentUser) {
			$location.path('/rooms/' + $scope.currentUser + '/');
		} 
		else if(kicker === $scope.currentUser) {
			$scope.successMessage = ('Kicked user by the name of ' + kickedUser);
		}
	});

	$scope.leaveRoom = function() {
		socket.emit('partroom', $routeParams.room);
		$location.path('/rooms/' + $routeParams.user);
	}

	socket.on('updateusers', function (roomName, users, ops) {
		if(ops[$scope.currentUser] === $scope.currentUser )
		{
			$scope.isOp = true;
		}
		$scope.currentUsers = users;
	});

});