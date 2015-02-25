angular.module('ChatClient', ['ngRoute']);

angular.module('ChatClient').config(
	["$routeProvider",
	function ($routeProvider) {
		$routeProvider
			.when('/login', { templateUrl: 'Views/login.html', controller: 'LoginController' })
			.when('/rooms/:user/', { templateUrl: 'Views/rooms.html', controller: 'RoomsController' })
			.when('/room/:user/:room/', { templateUrl: 'Views/room.html', controller: 'RoomController' })
			.otherwise({
	  			redirectTo: '/login'
			});
	}]
);


angular.module('ChatClient').controller('LoginController', ["$scope","$location","$rootScope","$routeParams","socket",
	function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.errorMessage = '';
	$scope.nickname = '';

	$scope.getEnter = function(event) {
		if (event.which === 13) {
			$scope.login();
		}
	};

	$scope.login = function() {
		if ($scope.nickname === '') {
			$scope.errorMessage = 'Please choose a nick-name before continuing!';
		} else {
			socket.emit('adduser', $scope.nickname, function (available) {
				if (available) {
					$location.path('/rooms/' + $scope.nickname);
				} else {
					$scope.errorMessage = 'This nick-name is already taken!';
				}
			});
		}
	};
}]);
angular.module('ChatClient').controller('RoomController', [function($scope, $location, $rootScope, $routeParams, socket) {
    $scope.currentRoom = $routeParams.room;
    $scope.currentUser = $routeParams.user;
    $scope.currentUsers = [];
    $scope.errorMessage = '';
    $scope.currentMessages = [];
    $scope.bannedUsers = [];
    $scope.currentUserMessage = '';
    $scope.successMessage = '';
    $scope.isOp = false;
    $scope.opArray = [];
    $scope.privateSender = '';
    $scope.privateReceiver = '';
    $scope.currentPrivateUserMessage = '';
    $scope.incomingPrivateMessage = false;
    $scope.currentPrivateUserMessages = [];

    //adds a new room and pends current user information

    //GG added
    socket.emit('updateroom', {
        room: $routeParams.room
    }, function(success, reason) {
        if (!success) {
            $scope.errorMessage = reason;
        } else {
            console.log("worked");
            socket.emit('rooms');
        }
    });

    // End of GG added
    socket.on('updateusers', function(roomName, users, ops, banned) {
        if (ops[$scope.currentUser] === $scope.currentUser) {
            $scope.isOp = true;
        }
        $scope.opArray = ops;
        $scope.currentUsers = users;
        $scope.bannedUsers = banned;
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
            $scope.submitMessage();
        }
    };

    $scope.submitMessage = function() {
        if ($scope.currentUserMessage === '') {
            $scope.errorMessage = 'Please choose a message to send!';
        } else if ($scope.currentUserMessage.length >= 200) {
            $scope.errorMessage = 'Maximum length of message is 200 characters!';
        } else {
            socket.emit('sendmsg', {
                roomName: $routeParams.room,
                msg: $scope.currentUserMessage
            });
            $scope.currentUserMessage = '';
        }
    };

    // Kick User
    //TODO need to fix the leave op problem
    $scope.kickUser = function(user) {
        socket.emit('kick', {
            user: user,
            room: $scope.currentRoom
        }, function(success, reason) {
            if (!success) {
                $scope.errorMessage = 'Sorry, no user found';
            }
        });
    };

    $scope.leaveRoom = function() {
        socket.emit('partroom', $routeParams.room);
        $location.path('/rooms/' + $routeParams.user);
        // If he is not the last op to leave his view of the op toolbar gets hidden
        if ($scope.opArray.length > 0) {
            $scope.isOp = false;
        }
    };


    socket.on('kicked', function(room, kickedUser, kicker) {
        if (kickedUser === $scope.currentUser) {
            $location.path('/rooms/' + $scope.currentUser + '/');

        } else if (kicker === $scope.currentUser) {
            $scope.successMessage = ('Kicked user by the name of ' + kickedUser);
        }
    });

    //TODO acces the data...
    socket.on('updatechat', function(roomName, messageHistory) {
        if (roomName === $scope.currentRoom) {
            $scope.currentMessages = messageHistory;
        }
    });

    // Ban user
    $scope.banUser = function(user) {
        console.log(user);
        console.log($scope.opArray[user]);
        // If theres only one op left we can't ban the op 
        if ((Object.keys($scope.opArray).length > 1) || ($scope.opArray[user] != user)) {
            socket.emit('ban', {
                user: user,
                room: $scope.currentRoom
            }, function(success, reason) {
                if (!success) {
                    $scope.errorMessage = 'Sorry, no user found';
                }
            });
        } else {
            $scope.errorMessage = 'You will ruin the chatroom if you ban the last operator';
        }
    };

    socket.on('banned', function(room, bannedUser, banOp) {
        if (bannedUser === $scope.currentUser) {
            $location.path('/rooms/' + $scope.currentUser + '/');
        } else if (banOp === $scope.currentUser) {
            $scope.successMessage = ('Banned user by the name of ' + bannedUser);
        }
    });

    // Unban user
    $scope.unbanUser = function(user) {
        console.log("heeeelllo");
        socket.emit('unban', user, function(success, reason) {
            if (!success) {
                $scope.errorMessage = 'Sorry, no user found';
            } else {
                $scope.successMessage = 'You have successfully unbanned ' + user;
            }
        });
    };

    // hmmm why are there two of you
    $scope.unbanUser = function(user) {
        console.log(user);
        console.log($scope.opArray[user]);
        // If theres only one op left we can't ban the op 
        socket.emit('unban', {
            user: user,
            room: $scope.currentRoom
        }, function(success, reason) {
            if (!success) {
                $scope.errorMessage = 'Sorry, no user found';
            } else {
                $scope.successMessage = "You have successfuly unbanned" + user;
            }
        });

    };
    // Op user
    $scope.opUser = function(user) {
        socket.emit('op', {
            user: user,
            room: $scope.currentRoom
        }, function(success, reason) {
            if (!success) {
                $scope.errorMessage = 'Sorry, no user found';
            }
        });

    };

    socket.on('opped', function(room, oppedUser, opOp) {
        if (oppedUser === $scope.currentUser) {
            $scope.successMessage = ('You were opped by ' + opOp);
        } else if (opOp === $scope.currentUser) {
            $scope.successMessage = ('You successfully opped ' + oppedUser);
        }
    });

    socket.emit('refreshusers', {
        room: $routeParams.room,
    }, function(success, reason) {
        if (!success) {
            $scope.errorMessage = 'Sorry, no room found';
        }
    });
    // DeOp user

    $scope.deOpUser = function(user) {
        console.log(Object.keys($scope.opArray).length);
        if (Object.keys($scope.opArray).length > 1) {
            socket.emit('deop', {
                user: user,
                room: $scope.currentRoom
            }, function(success, reason) {
                if (!success) {
                    $scope.errorMessage = 'Sorry, no user found';
                }
            });
        } else {
            $scope.errorMessage = 'You will ruin the chatroom if you deop the last operator';
        }
    };

    socket.on('deopped', function(room, deOppedUser, deOpOp) {
        if (deOppedUser === $scope.currentUser) {
            $scope.successMessage = ('You were de-opped by ' + deOpOp);
            $scope.isOp = false;
        } else if (deOpOp === $scope.currentUser) {
            $scope.successMessage = ('You successfully de-opped ' + deOppedUser);
        }
    });

}]);
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
// Factory to wrap around the socket functions
// Borrowed from Brian Ford
// http://briantford.com/blog/angular-socket-io.html
angular.module('ChatClient').factory('socket', ["$rootScope",function ($rootScope) {
    var socket = io.connect('http://localhost:8080');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);