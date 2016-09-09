var router = require('express').Router()
var Todo = require('../models/todo')
//var bcrypt = require('bcrypt')
var bcrypt = require('bcryptjs')
var jwt = require('jwt-simple')
var config = require('../config')
var websockets = require('../websockets');

var getWeekOfMonth_notwork = function(date) {

	var dayOfMonth = date.getDay();
    var month = date.getMonth();
    var year = date.getFullYear();
    var checkDate = new Date(year, month, date.getDate());
    var checkDateTime = checkDate.getTime();
    var currentWeek = 0;
    for (var i = 1; i < 32; i++) {
        var loopDate = new Date(year, month, i);
        if (loopDate.getDay() == dayOfMonth) {
            currentWeek++;
        }
        if (loopDate.getTime() == checkDateTime) {
            return currentWeek+'W/'+ (month+1) +'M';
        }
    }
}

var getWeekOfMonth_new = function(date) {

	var day = date.getDate()
    var month = date.getMonth();

    //get weekend date
    day += (date.getDay() == 0 ? 0 : 7 - date.getDay());

    return Math.ceil(parseFloat(day) / 7) + 'W/' + (month+1) +'M';
}


router.get('/:userid', function(req, res, next) {
	console.log('todos.js - /',req.params.userid)
	var userId = req.params.userid
	// if (!req.headers['x-auth']) {
	// 	return res.send(401)
	// }
	// var auth = jwt.decode(req.headers['x-auth'], config.secret)
	// User.findOne({username:auth.username}, function(err, user) {
	// 	if (err) {return next(err)}
	// 	res.json(user)
	// })
	

	Todo.find({assignee:userId}).sort({createDate:-1}).exec(function(err, todos){
	//Todo.find({assignee:userId}).sort({createDate:-1, completedDate:-1}).exec(function(err, todos){
	//Todo.find({assignee:userId}).sort('-createDate').exec(function(err, todos){
		if (err) {return next(err)}

			for(var i = 0; i < todos.length; i++) {
				var todo = todos[i];
				if (todo.completedDate) {
					todo.completedWeek = getWeekOfMonth_new(todo.completedDate);
				}
			}

		res.json(todos);
	})
})

router.post('/delete', function(req, res, next) {
	var todo = req.body.todo
	console.log('todos.js - todo:',todo)
	var query = {
    	"_id": todo._id
	}
	Todo.remove(query, function(){
		console.log('updateComplete id: ' + todo._id);
		websockets.brodcast('delete_todo',todo);
		res.send(todo)
	})

})
router.post('/update', function(req, res, next) {
	var todo = req.body.todo
	if (todo.completed) {
		todo.completedDate = new Date()
		//todo.completedWeek = getWeekOfMonth(todo.completedDate);
	} else {
		todo.completedDate = null;
		todo.completedWeek = null;
	}
	var query = {
    	"_id": todo._id
	}
	Todo.update(query,todo, function(){
		console.log('updateComplete id: ' +todo._id);
		websockets.brodcast('update_todo',todo);
		res.send(todo)
	})

})

router.post('/', function(req, res, next){
	
	// if (!req.headers['x-auth']) {
	// 	return res.send(401)
	// }
	//var auth = jwt.decode(req.headers['x-auth'], config.secret)

	var username = req.body.username
	//특수 기능에 대한 피싱 필요
	var value = req.body.value

	var desc = req.body.desc
	var valueArray = value.split(' ')

	var assignee = null;
	var withAssign = null;
	var toAssign = null;
	var doType = null;

	if (value.indexOf('!') != -1) {

	}
	console.log('todos.js - valueUnit : start!!', valueArray)
	if (value.indexOf('@') != -1) {
		for (var i=0; i < valueArray.length;i++) {
			var valueUnit = valueArray[i]
			if (valueUnit.indexOf('@')== 0) {
				valueUnit = valueUnit.replace('@','')
				console.log('todos.js - valueUnit :', valueUnit)
				if (assignee == null) {
					console.log('todos.js - assisgnee null :', assignee )
					assignee = valueUnit.split(',')
				} else {
					console.log('todos.js - assisgnee :', assignee )
					var assigneeUnit = valueUnit.split(',')
					for (var j=0; j < assigneeUnit.length;j++) {
						assignee.push(assigneeUnit[j])
					}
				}
			}
		}
	}
	//기본적으로 모든 TODO 는 나와 @유저와 같이 할당 되지만
	//#to 키워드가 들어가면 나는 제외 한다

	if (assignee != null) {
		assignee.push(username)
	}
	//assignee.push(username)
	
	if (value.indexOf('#') != -1) {
		for (var i=0; i < valueArray.length;i++) {
			var valueUnit = valueArray[i]
			if (valueUnit.indexOf('#')== 0) {
				if (valueUnit == '#to') {
					assignee.pop()
				}
			}	
		}		
	}



	if (assignee == null)
		assignee = username

	var assigner = username
	var completed = 'false'
	var priority = 'false'
	var createUser = username
	var createDate = new Date();

	var todo = new Todo({
		todo : value
		,assignee : assignee
		,assigner : assigner
		,completed : completed
		,createUser : createUser
		,createDate : createDate
		,desc : desc
	})
	todo.save(function(err, todo){
		if (err) {return next(err)}
		console.log('todos.brodcast todo :',todo)
		websockets.brodcast('new_todo',todo);
		res.send(todo)
	})
})

module.exports = router