var db = require('../db')
var todo = db.Schema(
	{
		todo:{type:String, require:true}
		, assignee:{type:[String]}
		, assigner:{type:String}
		, completed:{type:Boolean, require:true}
		, createUser:{type:String, require:true}
		, createDate:{type:String, require:true}
	}
	)

module.exports = db.model('Todo', todo)