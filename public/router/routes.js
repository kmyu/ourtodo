var app = angular.module('app')
app.config(['$stateProvider', '$urlRouterProvider','$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider
	.state('login',{
		url:'/ourtodoLogin',
		templateUrl:'view/login/login.html',
		controller:'LoginCtrl'
	})
	.state('register', {
		url: '/ourtodoRegister',
		templateUrl:'view/login/register.html',
		controller:'LoginCtrl'
	})	
	.state('home',{
		url:'/',
		templateUrl:'view/home.html',
		controller:'HomeCtrl',
		authenticate: true
	})
	// .state('detail',{
	// 	url:'/boardDetail/:id',
	// 	templateUrl:'./views/detail.html',
	// 	controller:'detailCtrl',
	// 	authenticate: true
	// })
	$locationProvider
	.html5Mode(true)
	.hashPrefix('!');
}]);

app.factory('authService', ['$http', '$q', '$rootScope','localStorageService', function ($http, $q, $rootScope, localStorageService) {

	var serviceBase = '';
	var authServiceFactory = {};
	var _isLoggedIn = function()
	{
        console.log("routes.js-localStorageService:",localStorageService.get('currentUser'));
		try {
			//console.log('routes.js-authService', $rootScope.authentication)
			//return $rootScope.authentication.isAuth;

			var auth = localStorageService.get('currentUser')
			console.log('routes.js-auth:',auth)
			return auth.isAuth

		} catch (err) {
			console.log('routes.js-err:isLoggedIn')
			return false;
		}
	}

	authServiceFactory.isLoggedIn = _isLoggedIn;

	return authServiceFactory;
}]);

app.run(['$rootScope', '$state','authService',function ($rootScope, $state, authService) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		console.log('routes.js-@@ rootScope.$on @@', authService.isLoggedIn());
		// 이동할 페이지에 authenticate 값이 있는지 확인해서 라우팅한다.
		if( toState.authenticate && !authService.isLoggedIn()){
			$state.transitionTo('login');
			event.preventDefault();
		}
	});
}]);