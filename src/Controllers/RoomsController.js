ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {

	$scope.roomName = '';
	$scope.errorMessage = '';
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;

	socket.emit('rooms');

	socket.on('roomlist', function(roomList) {
		$scope.rooms = Object.keys(roomList);
	});

	$scope.submitRoomName = function() {
		if($scope.roomName === '') {
			$scope.errorMessage = 'Please choose a chat-name before continuing!';
		} else {
			$location.path('/room/' + $scope.currentUser + "/" + $scope.roomName);
		}
	}

});
