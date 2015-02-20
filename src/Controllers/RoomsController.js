ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {

	$scope.roomName = '';
	$scope.errorMessage = '';
	$scope.typoError = '';
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.searchString = '';

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


ChatClient.filter('searchFor', function(){

	// All filters must return a function. The first parameter
	// is the data that is to be filtered, and the second is an
	// argument that may be passed with a colon (searchFor:searchString)

	return function(arr, searchString){

		if(!searchString){
			return arr;
		}

		var result = [];

		searchString = searchString.toLowerCase();

		// Using the forEach helper method to loop through the array
		angular.forEach(arr, function(currentUsers){

			if(currentUsers.title.toLowerCase().indexOf(searchString) !== -1){
				result.push(currentUsers);
			}
		});
		return result;
	};

});



