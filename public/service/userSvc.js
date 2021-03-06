angular.module('app')
.service('UserSvc', function ($http) {
	var svc = this
	svc.getUser = function() {
		return $http.get('/api/users')
	}
	svc.login = function(username, password, $rootScope) {
		return $http.post('/api/sessions', {username:username, password:password}).then(function(val){
			svc.token = val.data
			$http.defaults.headers.common['X-Auth'] = val.data
			
			console.log('userSvc-svc.login set RootScope', username);
			// $rootScope.authentication = {
			// 	isAuth: true,
			// 	userName : val.data	
			// }
			
			return svc.getUser()
		})
	}
	svc.register = function(username, password) {
		return $http.post('/api/users', {username:username, password:password}).then(function(){
			console.log('Register is Success')
		})
	}
})
