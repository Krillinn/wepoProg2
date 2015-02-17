ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {

	$scope.roomName = '';
	$scope.errorMessage = '';
	//$scope.rooms = ['room 1', 'room2'];

	$scope.currentUser = $routeParams.user;

	$scope.submitRoomName = function() {
		if($scope.roomName === '') {
			$scope.errorMessage = 'Please choose a lobby-name before continuing!';
		} else {
	//		$scope.rooms.push($scope.roomName);
			socket.emit('joinroom', { room: $scope.roomName, pass: undefined}, function (success, reason) {
				if (!success)
				{
					$scope.errorMessage = reason;
			}); 
		}
	}

	
});
