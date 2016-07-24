angular.module('app')
.controller('appCtrl', function($scope, $rootScope,$location, localStorageService){
	var currentUserAuth = localStorageService.get('currentUser')
	if (currentUserAuth)
		$scope.currentUser = currentUserAuth.userName;
	$scope.$on('login', function(_, user){
		$scope.currentUser = localStorageService.get('currentUser').userName;
	})
	$scope.logout = function(){
		localStorageService.clearAll();
		$scope.currentUser = null;
		$location.path('/ourtodoLogin')	
	}
	$scope.goHome = function(){
		$location.path('/')
	}
	$scope.register = function(){
		$location.path('/ourtodoRegister')
	}
})