var router = require('express').Router()
var User = require('../models/user')
//var bcrypt = require('bcrypt')
var bcrypt = require('bcryptjs')
var jwt = require('jwt-simple')
var config = require('../config')

router.post('/', function (req, res, next){
	console.log('sessiong.js username :',req.body.username)
	User.findOne({username: req.body.username})
	.select('password').select('username')
	.exec(function(err, user) {
		if (err) {
			console.log('session.js  errors!')
			return next(err)
		}
		if (!user) {return res.send(401)}

		console.log('sessiong user : ',user)
		bcrypt.compare(req.body.password, user.password, function(err, valid) {
			if (err) {console.log('err : ', err); return next(err)}
			if (!valid) {return res.send(401)}
			var token = jwt.encode({username:user.username}, config.secret)
			res.send(token)
		})
	})
})

module.exports = router