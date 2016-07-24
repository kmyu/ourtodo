var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/ourtodo', function(){
	console.log('mongodb connected!');
})
module.exports = mongoose;