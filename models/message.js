var db = require('../db')
var message = db.Schema(
	{
		message:{type:String, require:true}
		, messageDate:{type:Date, require:true}
		, messageDesc:{type:String}
		, readYn:{type:Boolean}
		, receiver:{type:[String]}
		, sender:{type:String}
		, owner:{type:String}
		, messageDateDay:{type:String}
	}
	)

module.exports = db.model('Message', message)
