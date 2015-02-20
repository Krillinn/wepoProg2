ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {

	$scope.roomName = '';
	$scope.errorMessage = '';
	$scope.typoError = '';
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;

	socket.emit('rooms');

	socket.on('roomlist', function(roomList) {
		$scope.rooms = Object.keys(roomList);
	});

	socket.on('globalRoomsErrorMessage', function (kickedUser, errorMessage) {
		if($scope.currentUser === kickedUser) {
			$scope.errorMessage = errorMessage;
		}
	});

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
