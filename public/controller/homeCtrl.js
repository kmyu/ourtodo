angular.module('app')
.controller('HomeCtrl', function($scope, TodoSvc, $location, $http, localStorageService){

	$http.get('/api/todos/'+localStorageService.get('currentUser').userName).success(function(todos){
			console.log('homeCtrl.js - todos :',todos)
			$scope.todos = todos
		})
	$scope.add = function(){
		var value = $scope.value
		console.log('homeCtrl-value:',value);
		var currentUser = localStorageService.get('currentUser').userName;
		TodoSvc.setTodos(currentUser, value)
		.then(function(response){
			console.log(response)
			$scope.value = null;
			//$location.path('/')
		})	
	}
	$scope.getTodoStyle = function(isCompleted) {
		if (isCompleted)
			return 'completeTodo'
	}
	
	$scope.toggleCompleted = function (todo, completed) {
		console.log('homeCtrl : toggleCompleted',todo.todo);
		$http.post('/api/todos/update', {todo:todo})
	}
	$scope.enableEdit = function(item){
	  	item.editable = true;
	}

	$scope.disableEdit = function(item){
	  	item.editable = false;
	}
	$scope.deleteTodo = function(todo) {
		$http.post('/api/todos/delete',{todo:todo})
	}
	$scope.showTodo = function(todo){

	}
	//websocket function
	$scope.$on('ws:new_todo',function(_, todo){
		console.log('homeCtrl.js - call websocket!')
		var assignee = todo.assignee
		for (var i =0; i < assignee.length ;i++) {
			if (localStorageService.get('currentUser').userName == assignee[i]){
				$scope.$apply(function(){
					$scope.todos.unshift(todo)
				})
				break;
			}
		}
	})
	// $scope.$on('ws:new_todo',function(_, todo){
	// 	$scope.$apply(function(){
	// 		$scope.todos.unshift(todo)
	// 	})
	// })
	$scope.$on('ws:update_todo',function(_, todo){
		console.log('homeCtrl update todo!!!');
		$scope.$apply(function(){
			for (var i=0; i <$scope.todos.length; i++) {
				var _todo = $scope.todos[i]
				if (todo._id == _todo._id) {
					$scope.todos.splice(i, 1, todo);
					break;
				}
			}
		})
	})
	$scope.$on('ws:delete_todo',function(_, todo){
		console.log('homeCtrl delete todo!!!');
		$scope.$apply(function(){
			for (var i=0; i <$scope.todos.length; i++) {
				var _todo = $scope.todos[i]
				if (todo._id == _todo._id) {
					$scope.todos.splice(i, 1);
					break;
				}
			}
		})
	})
})