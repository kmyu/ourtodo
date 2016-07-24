var express = require('express')
var router = express.Router();

router.all('*', function(req, res, next){
	// if (!req.headers['x-auth']) {
	// 	return res.sendfile('login/login.html')
	// }
	console.log('NodeRouter : get /*');
	return res.sendfile('index.html')
})

module.exports = router