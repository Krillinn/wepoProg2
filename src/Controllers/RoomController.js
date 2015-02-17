ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';

	$scope.leaveRoom = function() {
		console.log("in delete");
		socket.emit('partroom', $routeParams.room);
		$location.path('/rooms/' + $routeParams.user);
	}

	for(i = 0; i < 2; i++) {
		socket.emit('joinroom', { room: $routeParams.room, pass: undefined }, function (success, reason) {
			if (!success)
			{
				$scope.errorMessage = reason;
			}
			else 
			{
				socket.emit('rooms');
			}
		}); 
	}

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		$scope.currentUsers = users;
	});

});