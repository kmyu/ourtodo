var router = require('express').Router()
var Message = require('../models/message')
//var bcrypt = require('bcrypt')
var bcrypt = require('bcryptjs')
var jwt = require('jwt-simple')
var config = require('../config')
var websockets = require('../websockets');

var getWeekOfMonth_new = function(date) {
	var day = date.getDate()
    var month = date.getMonth();
    //get weekend date
    day += (date.getDay() == 0 ? 0 : 7 - date.getDay());
    return Math.ceil(parseFloat(day) / 7) + 'W/' + (month+1) +'M';
}
var getYearMonthDay = function(date) {
	var day = date.getDate()
    var month = date.getMonth();
	var year = date.getFullYear()
	console.log('getYearMonthDay : ' , year+'.'+month+'.'+day);
    return year+'.'+month+'.'+day;
}

router.get('/:userid', function(req, res, next) {
	console.log('messages.js - /',req.params.userid)
	var userId = req.params.userid
	
	Message.find({owner:userId}).sort({messageDate:-1}).exec(function(err, messages){
	//Todo.find({assignee:userId}).sort({createDate:-1, completedDate:-1}).exec(function(err, todos){
	//Todo.find({assignee:userId}).sort('-createDate').exec(function(err, todos){
		if (err) {return next(err)}
		console.log('message.js findMessage ', messages);
		for(var i = 0; i < messages.length; i++) {
			var message = messages[i];
			if (message.messageDate) {
				messages[i].messageDateDay = getYearMonthDay(message.messageDate);
			}
		}
		console.log('message.js findMessage22 ', messages);
		res.json(messages);
	})
})

router.post('/', function(req, res, next){
	
	// if (!req.headers['x-auth']) {
	// 	return res.send(401)
	// }
	//var auth = jwt.decode(req.headers['x-auth'], config.secret)

	var username = req.body.username
	//특수 기능에 대한 피싱 필요
	var message = req.body.message

	var messageDesc = req.body.messageDesc
	var messageArray = message.split(' ')

	var receiver = null;

	console.log('message.js - messageUnit : start!!', messageArray)
	if (message.indexOf('@') != -1) {
		for (var i=0; i < messageArray.length;i++) {
			var messageUnit = messageArray[i]
			if (messageUnit.indexOf('@')== 0) {
				messageUnit = messageUnit.replace('@','')
				console.log('message.js - messageUnit :', messageUnit)
				if (receiver == null) {
					console.log('message.js - receiver null :', receiver )
					receiver = messageUnit.split(',')
				} else {
					console.log('message.js - receiver :', receiver )
					var receiverUnit = messageUnit.split(',')
					for (var j=0; j < receiverUnit.length;j++) {
						receiver.push(receiverUnit[j])
					}
				}
			}
		}
	}

	if (receiver == null)
		return;

	var sender = username
	var messageDate = new Date();

	//send message
	for (var i=0; i < receiver.length; i++) {	
		var sendMessage = new Message({
			message : message
			,messageDate : messageDate
			,messageDesc : messageDesc
			,readYn : false
			,receiver : receiver[i]
			,sender : username
			,owner : receiver[i]
		})
		sendMessage.save(function(err, sendMessage){
			if (err) {return next(err)}
			console.log('sendMessage.brodcast message :',sendMessage)
			websockets.brodcast('receive_message',sendMessage);
		})
	}

	//myMessage 보낸편지함에 저장
	var myMessage = new Message({
		message : message
		,messageDate : messageDate
		,messageDesc : messageDesc
		,readYn : true
		,receiver : receiver
		,sender : username
		,owner : username
	})

	myMessage.save(function(err, myMessage){
		if (err) {return next(err)}
		console.log('myMessage.brodcast myMessage :',myMessage)
		websockets.brodcast('send_message', myMessage);
		res.send(myMessage)
	})
})
router.post('/delete', function(req, res, next) {
	var message = req.body.message
	console.log('messages.js - message:',message)
	var query = {
    	"_id": message._id
	}
	Message.remove(query, function(){
		console.log('delete message id: ' + message._id);
		websockets.brodcast('delete_message',message);
		res.send(message)
	})
 })
router.post('/update', function(req, res, next) {
	var message = req.body.message
	if (!message.readYn) {
		message.readYn = true;
	}
	var query = {
    	"_id": message._id
	}
	Message.update(query,message, function(){
		console.log('updateComplete id: ' +message._id);
		websockets.brodcast('update_message',message);
		res.send(message)
	})

})



module.exports = router