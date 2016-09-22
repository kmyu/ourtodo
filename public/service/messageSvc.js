angular.module('app')
.service('MessageSvc', function ($http) {
	var svc = this;
	svc.getMesssages = function() {
		return $http.get('/api/messages')
	}
	svc.sendMessages = function(username, message, messageDesc) {
		return $http.post('/api/messages', {username:username, message:message, messageDesc:messageDesc}).then(function(response){
			console.log('Send Message Success',response)
		})
	}
	
})
