angular.module('app')
.controller('HomeCtrl', function($scope, TodoSvc, $location, $http, localStorageService){

	$http.get('/api/todos/'+localStorageService.get('currentUser').userName).success(function(todos){
			console.log('homeCtrl.js - getTodos :',todos)
			$scope.todos = todos
		})

	$scope.clickTag = function(tag) {
		if ($scope.searchKey == tag) {
			$scope.searchKey = null
		} else {
			$scope.searchKey = tag;
		}
	}

	$scope.tagList = [];
	$scope.addTagList = function(todo) {
		$scope.findTagText(todo.todo, 0);
		
		console.log('tagList ', $scope.tagList);
	}

	$scope.findTagText = function(str, beginIndex) {

		var startIndex = str.indexOf('[', beginIndex);
		var endIndex = str.indexOf(']', startIndex+1);

		if (startIndex == -1 || endIndex == -1)
			return;

		var result =  str.substring(startIndex, endIndex+1)

		if ($scope.tagList.indexOf(result) == -1) {
			if (result != undefined)
				$scope.tagList.push(result);
		}

		if (str.indexOf('[', endIndex) != -1)
			$scope.findTagText(str, endIndex);

	}

	$scope.filterBySearchKey = function(todo) {

		if ($scope.searchKey) {
        	return (todo.indexOf($scope.searchKey) != -1);
		} else {
			return true;
		}
    };

    $scope.filterTodo = function(todo) {

		$scope.addTagList(todo);

		if ($scope.searchKey) {
        	return todo.todo.indexOf($scope.searchKey) != -1 && (todo.completed.toString() == $scope.query || $scope.query == "");
		} else {
			return todo.completed.toString() === $scope.query || $scope.query == "";
		}
    };


	$scope.copySuccess = function () {
		//alert('Copied!');
        console.log('Copied!');
    };
    $scope.copyFail = function (err) {
		//alert('Error! ' + err);
        console.error('Error!', err);
    };
	$scope.textToCopy = '';
	$scope.copyTodo = function(todo){
		console.log('homeCtrl copyClipboard!');
		$scope.textToCopy = '';
		var targetWeek = todo.completedWeek;
		for (var i= 0; i<$scope.todos.length;i++) {
			if ($scope.todos[i].completedWeek == targetWeek) {

				var result = $scope.todos[i].todo;
				var assignees = $scope.todos[i].assignee;
				for (var j=0; j<assignees.length;j++) {
					result = result.replace('@'+assignees[j]+' ','');
					result = result.replace(' @'+assignees[j],'');

					result = result.replace('#with ','');
					result = result.replace(' #with','');

					result = result.replace('#to ','');
					result = result.replace(' #to','');
				}
				$scope.textToCopy = $scope.textToCopy + result + '\n' 
				console.log('homeCtrl copyClipboard! Success', $scope.textToCopy);
			}
		}
	}
	$scope.orderBy = ''

	$scope.query = 'false'
	$scope.todoFilter = function(arg) {
		if (arg === 'true') {
			$scope.orderBy = '-completedDate'
		} else {
			$scope.orderBy = ''
		}
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

	var tempWeek = null;
	$scope.getWeekOfMonth = function(todo, isFirst) {
		if (isFirst)
			tempWeek = null
		if (!$scope.query) {
			return true;
		}
		if (tempWeek == todo.completedWeek) {
			return true;
		} else {
			tempWeek = todo.completedWeek;
			return false;
		}
	}


	// $scope.getNumberOfWeek = function(dateString) {
	// 	if (dateString == undefined)
	// 		return null;
	// 	var date = new Date(dateString);

	// 	var dayOfMonth = date.getDay();
	//     var month = date.getMonth();
	//     var year = date.getFullYear();
	//     var checkDate = new Date(year, month, date.getDate());
	//     var checkDateTime = checkDate.getTime();
	//     var currentWeek = 0;
	//     for (var i = 1; i < 32; i++) {
	//         var loopDate = new Date(year, month, i);
	//         if (loopDate.getDay() == dayOfMonth) {
	//             currentWeek++;
	//         }
	//         if (loopDate.getTime() == checkDateTime) {
	//             return month+1 +'M/'+currentWeek+'W';
	//         }
	//     }
	// }



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
	$scope.showTodoDesc = function(todo, index) {

		todo.showDesc  = !todo.showDesc

		
		$("#textarea"+index).height( $("#textarea"+index)[0].scrollHeight );

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