ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	$scope.currentMessages = [];
	$scope.currentUserMessage = '';
	$scope.successMessage = '';
	$scope.isOp = false;
	$scope.opArray = [];

		//adds a new room and pends current user information

	socket.emit('joinroom', { room: $routeParams.room, pass: undefined }, function (success, reason) {
		if (!success) {
			$scope.errorMessage = reason;
		} 
		else {
			socket.emit('rooms');
		}
	}); 

	socket.on('updateusers', function (roomName, users, ops) {
		if(ops[$scope.currentUser] === $scope.currentUser )
		{
			$scope.isOp = true;
		}
		$scope.opArray = ops;
		$scope.currentUsers = users;
		console.log("these are the operators ")
		console.log(ops);
		console.log("these are the users ")
		console.log(users);
	});

	$scope.submitMessage = function() {
		if($scope.currentUserMessage === '') {
			$scope.errorMessage = 'Please choose a message to send!';
		}
		else if($scope.currentUserMessage.length >= 200) {
				$scope.errorMessage = 'Maximum length of message is 200 characters!';
		}
		else {
			socket.emit('sendmsg', { roomName: $routeParams.room, msg: $scope.currentUserMessage });
			$scope.currentUserMessage = '';
		}
	}

// Kick User
	//TODO need to fix the leave op problem
	$scope.kickUser = function(user){
		socket.emit('kick', { user: user, room: $scope.currentRoom }, function (success, reason) {
			if(!success) {
				$scope.errorMessage = 'Sorry, no user found';
			}
		});
	};

	$scope.leaveRoom = function() {
		socket.emit('partroom', $routeParams.room);
		$location.path('/rooms/' + $routeParams.user);
	}


	socket.on('kicked', function (room, kickedUser, kicker) {
		if(kickedUser === $scope.currentUser) {
			$location.path('/rooms/' + $scope.currentUser + '/');
		} 
		else if(kicker === $scope.currentUser) {
			$scope.successMessage = ('Kicked user by the name of ' + kickedUser);
		}
	});

	//TODO acces the data...
	socket.on('updatechat', function(roomName, messageHistory) {
		$scope.currentMessages = messageHistory;
	});
// Ban user
	$scope.banUser = function(user){
		socket.emit('ban', { user: user, room: $scope.currentRoom }, function (success, reason) {
			if(!success) {
				$scope.errorMessage = 'Sorry, no user found';
			}
		});
	};

	socket.on('banned', function (room, bannedUser, banOp) {
		if(bannedUser === $scope.currentUser) {
			$location.path('/rooms/' + $scope.currentUser + '/');
		}
		else if(banOp === $scope.currentUser) {
			$scope.successMessage = ('Banned user by the name of ' + bannedUser);
		}
	});


// Op user
	 $scope.opUser = function(user){
	 	socket.emit('op', {user: user, room: $scope.currentRoom}, function (success, reason){
	 		if(!success){
	 			$scope.errorMessage = 'Sorry, no user found';
	 		}
	 		console.log($scope.currentUsers);
	 	})

	 };

 	socket.on('opped',function (room,oppedUser,opOp){
 		if(oppedUser === $scope.currentUser){
 			$scope.successMessage = ('You were opped by ' + opOp);
 		}
 		else if (opOp === $scope.currentUser){
 			$scope.successMessage = ('You successfully opped ' + oppedUser);
 		}
 	})

	socket.emit('refreshusers', {room: $routeParams.room, pass: undefined}, function (success, reason){
 				if(!success){
 					$scope.errorMessage = 'Sorry, no room found';
 				}
 			});
// DeOp user

	 $scope.deOpUser = function(user){
	 	socket.emit('deop', {user: user, room: $scope.currentRoom}, function (success, reason){
	 		if(!success){
	 			$scope.errorMessage = 'Sorry, no user found';
	 		}

	 		console.log($scope.currentUsers);
	 	})

	 };

 	socket.on('deopped',function (room,deOppedUser,deOpOp){
 		if(deOppedUser === $scope.currentUser){
 			$scope.successMessage = ('You were de-opped by ' + deOpOp);
 			$scope.isOp = false;
 		}
 		else if (deOpOp === $scope.currentUser){
 			$scope.successMessage = ('You successfully de-opped' + deOppedUser);
 		}


 	})
});














