angular.module('app')
.service('TodoSvc', function ($http) {
	var svc = this
	svc.getTodos = function() {
		return $http.get('/api/todos')
	}
	svc.setTodos = function(username, value) {
		return $http.post('/api/todos', {username:username, value:value}).then(function(response){
			console.log('Register TODO Success',response)
		})
	}
	
	// svc.updateTodo = function(todo) {
	// 	return $http.put('/api/todos', {id:todo.id, todo:todo}).then(function(response){
	// 		console.log('Register TODO Success',response)
	// 	})
	// }



		// svc.login = function(username, password, $rootScope) {
	// 	return $http.post('/api/sessions', {username:username, password:password}).then(function(val){
	// 		svc.token = val.data
	// 		$http.defaults.headers.common['X-Auth'] = val.data
			
	// 		console.log('userSvc-svc.login set RootScope', username);
	// 		// $rootScope.authentication = {
	// 		// 	isAuth: true,
	// 		// 	userName : val.data	
	// 		// }
			
	// 		return svc.getUser()
	// 	})
	// }
})
