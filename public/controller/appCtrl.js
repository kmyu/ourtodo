angular.module('app')
.controller('appCtrl', function($scope,$http, $rootScope,$location, localStorageService){
	
    //$scope.mainTitle = 'OurTodo'
    $scope.mainTitle = $location.$$path === '/' ? 'OurTodo' : $location.$$path === '/message' ? 'OurMessage': $location.$$path === '/note' ? 'OurNote': 'OurTodo';

    var currentUserAuth = localStorageService.get('currentUser')
	if (currentUserAuth)
		$scope.currentUser = currentUserAuth.userName;
	

    $scope.$on('login', function(_, user){
		$scope.currentUser = localStorageService.get('currentUser').userName;
        $scope.refreshMessageCount();
        $scope.mainTitle = $location.$$path === '/' ? 'OurTodo' : $location.$$path === '/message' ? 'OurMessage': $location.$$path === '/note' ? 'OurNote': 'OurTodo';
	})


    //데스크탑 알림
    $scope.$on('ws:receive_message',function(_, message){
        console.log('appCtrl.js - call websocket!')
        if(message.sender != localStorageService.get('currentUser').userName) { 
            if (Notification.permission !== "granted")
                Notification.requestPermission();
            else {
                var notification = new Notification("You've got message!", {
                  icon: '/images/logo_v.png',
                  body: message.message,
                });
                notification.onclick = function () {
                  window.open("/message", "OurMessage");      
                };
            }
            $scope.refreshMessageCount();
        }
    })
    $scope.$on('ws:new_todo',function(_, todo){
        console.log('appCtrl.js - call websocket!')
        var assignee = todo.assignee
        for (var i =0; i < assignee.length ;i++) {
            if (localStorageService.get('currentUser').userName == assignee[i]){
                if(todo.assigner != localStorageService.get('currentUser').userName) {   
                 if (Notification.permission !== "granted")
                     Notification.requestPermission();
                 else {
                     var notification = new Notification('New Todo Arrived!', {
                       icon: '/images/logo_v.png',
                       body: todo.todo,
                     });
                     notification.onclick = function () {
                       window.open("/", "OurTodo");      
                     };
                 }
                }
                break;
            }
        }
    })

    $scope.newMessageCount = 0;
    $scope.refreshMessageCount = function(){
        var count = 0;
        if (localStorageService.get('currentUser')){
            $http.get('/api/messages/'+localStorageService.get('currentUser').userName).success(function(messages){
            console.log('MessageCtrl.js - getMessage :',messages)

            for (var i = 0; i < messages.length; i++) {
                if (!messages[i].readYn && messages[i].receiver[0] === $scope.currentUser) {
                    count = count + 1;
                }
            }
            $scope.newMessageCount = count; 
        })
        }
    }

    $scope.refreshMessageCount();

    $scope.$on('receiveMessage', function(_, count){
        //console.log('ReceiveMessage', count);
        $scope.$apply(function(){
            $scope.newMessageCount = count;
        })
    });

	$scope.logout = function(){
		localStorageService.clearAll();
		$scope.currentUser = null;
		$location.path('/ourtodoLogin')	
	}
	$scope.goTodo = function(){
		$location.path('/')
        $scope.mainTitle = 'OurTodo'
	}
    $scope.goMessage = function(){
        $location.path('/message')
        $scope.mainTitle = 'OurMessage'
    }
    $scope.goNote = function(){
        $location.path('/note')
        $scope.mainTitle = 'OurNote'
    }
	$scope.register = function(){
		$location.path('/ourtodoRegister')
	}
    $scope.enableEdit = function(item){
        item.editable = true;
    }
    $scope.disableEdit = function(item){
        item.editable = false;
    }
    $scope.getDateString = function(dateString) {
        if (dateString == undefined)
            return null;
        var date = new Date(dateString);
        return date.getTime();
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