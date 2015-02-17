ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = ''

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		$scope.currentUsers = users;
	});		

	socket.emit('joinroom', $scope.currentRoom, function (success, reason) {
		if (!success)
		{
			$scope.errorMessage = reason;
		}
	});
});