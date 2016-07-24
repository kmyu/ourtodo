angular.module('app')
.controller('LoginCtrl', function($scope, $rootScope, $location, UserSvc, localStorageService){

	$scope.login = function(username, password) {
		console.log('loginCtrl-rootScope : ',$rootScope.test);
		UserSvc.login(username, password)
		.then(function(response){
			console.log('loginCtrl-response.data:',response.data)
			
			var auth = {
				isAuth: true,
				userName : username	
			}
			
			//$rootScope.authentication = auth;

			var storageKey = "currentUser";
        	var todos = localStorageService.add(storageKey,auth);

        	//console.log("loginCtrl-localStorageService:",localStorageService.get(storageKey));


			$scope.$emit('login', username)
			$location.path('/')
		})
	}
	$scope.register = function(username, password) {
		UserSvc.register(username, password)
		.then(function(response){
			console.log(response)
			$location.path('/')
		},function(err){
			console.log('err')
			alert('duplicate name!');
		})
	}
})