angular.module('app')
.controller('MessageCtrl', function($scope, MessageSvc, $location, $http, localStorageService){

	//$scope.messages = [{id:'123', message:'to songmi hello world', receiveDate:new Date(), messageDesc:'hello description', readYn:false, receiver:'songmi', sender:'kmyu'},{id:'123', message:'from songmi hello world', receiveDate:new Date(), messageDesc:'hello description', readYn:false, receiver:'kmyu', sender:'songmi'}];

	$scope.messages = [];

	$http.get('/api/messages/'+localStorageService.get('currentUser').userName).success(function(messages){
			console.log('MessageCtrl.js - getMessage :',messages)

			var count = 0;
			for (var i = 0; i < messages.length; i++) {
				if (!messages[i].readYn && messages[i].receiver[0] === $scope.currentUser) {
					count = count + 1;
				}
			}
			//$scope.$emit('receiveMessage', count)
			$scope.messages = messages;
		})

	$scope.publishNewMessageCount = function() {
		var count = 0;
		for (var i = 0; i < $scope.messages.length; i++) {
			if (!$scope.messages[i].readYn && $scope.messages[i].receiver[0] === $scope.currentUser) {
				count = count + 1;
			}
		}
		$scope.$emit('receiveMessage', count)
	}

	$scope.readMessage = function(message) {
		if (!message.readYn)
			$http.post('/api/messages/update', {message:message})
	}
	$scope.deleteMessage = function(message) {
		$http.post('/api/messages/delete',{message:message})
	}
	$scope.send = function(){

		if (!$scope.message)
			return;
		if ($scope.message.indexOf('@') == -1)
			return;

		var message = $scope.message
		var messageDesc = $scope.messageDesc
		console.log('messageCtrl.js - send:',message);
		var currentUser = localStorageService.get('currentUser').userName;
		MessageSvc.sendMessages(currentUser, message, messageDesc)
		.then(function(response){
			console.log(response)
			$scope.message = null;
			$scope.messageDesc = null;
			$scope.showDesc = false;
			//$location.path('/')
		})	
	}

	var tempDay = null;
	$scope.getDay = function(message, isFirst) {
		//console.log('@@@@@@', message);
		if (isFirst)
			tempDay = null
		if (tempDay == message.messageDateDay) {
			return true;
		} else {
			tempDay = message.messageDateDay;
			return false;
		}
	}
	// var getYearMonthDay = function(date) {
	// 	var day = date.getDate()
	//     var month = date.getMonth();
	// 	var year = date.getFullYear()
	// 	console.log('getYearMonthDay : ' , year+'.'+month+'.'+day);
	//     return year+'.'+month+'.'+day;
	// }
	$scope.removeByDay = function(day) {
		//day:2016.9.1
		for(var i = 0; i < $scope.messages.length; i++) {
			if (day === $scope.messages[i].messageDateDay && $scope.messages[i].sender != $scope.currentUser) {
				//console.log('messageCtrl :: ', day , $scope.messages[i].messageDateDay);
				$scope.deleteMessage($scope.messages[i]);
			}
		}
		//$scope.publishNewMessageCount();
	}

    $scope.messageTypeFilter = function(message) {

    	//console.log('messageCtrl:', $scope.messageType, message, $scope.currentUser);

    	if ($scope.messageType === 'receive') {
    		return message.receiver[0] === $scope.currentUser ? true:false;
    	} else {
    		return message.sender === $scope.currentUser ? true:false;
    	}
    };

	$scope.messageType = 'receive';
	$scope.changeMessageType = function(arg) {
		$scope.messageType = arg
	}

	$scope.deleteMessage = function(message) {
		$http.post('/api/messages/delete',{message:message})
	}
	$scope.showMessageDesc = function(message, index) {

		message.showDesc  = !message.showDesc
		$("#textarea"+index).height( $("#textarea"+index)[0].scrollHeight );
	}
	$scope.showDesc = false;
	$scope.toggleDesc = function() {
		$scope.showDesc = !$scope.showDesc
	}

	$scope.clickFromUser = function(user) {
		if ($scope.message) {
			if ($scope.message.indexOf('@'+user) == -1)
				$scope.message = $scope.message + ' @' + user + ' ';
		} else {
			$scope.message = '@' + user + ' ';
		}
	}

//websocket function
	$scope.$on('ws:send_message',function(_, message){
		console.log('messageCtrl.js - call websocket!')
		var sender = message.sender;
		if (localStorageService.get('currentUser').userName == sender){
				$scope.$apply(function(){
					$scope.messages.unshift(message)
				})
			}
	})
	$scope.$on('ws:receive_message',function(_, message){
		console.log('messageCtrl.js - call websocket!')
		var receiver = message.receiver;
		for (var i =0; i < receiver.length ;i++) {
			if (localStorageService.get('currentUser').userName == receiver[i]){
				$scope.$apply(function(){
					$scope.messages.unshift(message)
				})
				break;
			}
		}
		$scope.publishNewMessageCount();
	})
	// $scope.$on('ws:new_todo',function(_, todo){
	// 	$scope.$apply(function(){
	// 		$scope.todos.unshift(todo)
	// 	})
	// })
	$scope.$on('ws:update_message',function(_, message){
		console.log('homeCtrl update message!!!');
		$scope.$apply(function(){
			for (var i=0; i <$scope.messages.length; i++) {
				var _message = $scope.messages[i]
				if (message._id == _message._id) {
					$scope.messages.splice(i, 1, message);
					break;
				}
			}
		})
		$scope.publishNewMessageCount();
	})
	$scope.$on('ws:delete_message',function(_, message){
		console.log('homeCtrl delete message!!!');
		$scope.$apply(function(){
			for (var i=0; i <$scope.messages.length; i++) {
				var _message = $scope.messages[i]
				if (message._id == _message._id) {
					$scope.messages.splice(i, 1);
					break;
				}
			}
		})
		$scope.publishNewMessageCount();
	})



})