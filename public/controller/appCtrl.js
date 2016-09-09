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
.directive('elastic', [
    '$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            scope: {
                ngShow: "="
            },
            link: function($scope, element, attr) {
                $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                var resize = function() {
                    element[0].style.height = $scope.initialHeight;
                    element[0].style.height = "" + element[0].scrollHeight + "px";
                };
                 if (attr.hasOwnProperty("ngShow")) {
                    function ngShow() {
                        if ($scope.ngShow === true) {
                            $timeout(resize, 0);
                        }
                    }
                    $scope.$watch("ngShow", ngShow);
                    setTimeout(ngShow, 0);
                 }
                element.on("input change", resize);
                $timeout(resize, 0);
            }
        };
    }
]);