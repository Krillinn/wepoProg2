ChatClient.controller('RoomController', function($scope, $location, $rootScope, $routeParams, socket) {
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


    $scope.getEnter = function(event) {
        if (event.which === 13) {
            $scope.submitMessage();
        }
    }

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
    }

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
    }


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
        })
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
        })

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
    })
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
            })
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

});