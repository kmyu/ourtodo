angular.module('app')
.controller('HomeCtrl', function($scope, TodoSvc, $location, $http, localStorageService){

	$http.get('/api/todos/'+localStorageService.get('currentUser').userName).success(function(todos){
			console.log('homeCtrl.js - getTodos :',todos)
			$scope.todos = todos
		})

	$scope.todosToClipboard = function() {
		var todoValues = angular.element(document.getElementsByClassName('todoValue'))
		var result = ''
		for (var i= 0; i<todoValues.length;i++) {
			result += todoValues[i].innerHTML+'\n'
		}
		console.log('homeCtrl copyClipboard : ',result)
		window.prompt("Copy to clipboard: Ctrl+C, Enter", result);
	}

	$scope.query = 'false'
	$scope.todoFilter = function(arg) {
		$scope.query = arg
	}
	$scope.showOption = false;
	$scope.toggleOption = function() {
		$scope.showOption = !$scope.showOption;
		console.log('homeCtrl:',$scope.showOption);
	}

	$scope.add = function(){
		var value = $scope.value
		var description = $scope.desc
		console.log('homeCtrl.js - addValue:',value);
		var currentUser = localStorageService.get('currentUser').userName;
		TodoSvc.setTodos(currentUser, value, description)
		.then(function(response){
			console.log(response)
			$scope.value = null;
			$scope.desc = null;
			$scope.showDesc = false;
			//$location.path('/')
		})	
	}
	$scope.getTodoStyle = function(todo) {
		var result = ''
		if (todo.completed)
			result +='completeTodo'
		if (todo.priority)
			result += ' priority_high'
		return result
	}
	$scope.getDateString = function(dateString) {
		if (dateString == undefined)
			return null;
		var date = new Date(dateString);
		return date.getTime();
	}
	$scope.toggleCompleted = function (todo, completed) {
		console.log('homeCtrl : toggleCompleted',todo.todo);
		$http.post('/api/todos/update', {todo:todo})
	}
	$scope.togglePriority = function (todo, priority) {
		console.log('homeCtrl : togglePriority',todo.todo);
		todo.priority = !todo.priority
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
	$scope.showDesc = false;
	$scope.toggleDesc = function() {
		$scope.showDesc = !$scope.showDesc
	}
	$scope.showTodoDesc = function(todo) {
		todo.showDesc  = !todo.showDesc
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