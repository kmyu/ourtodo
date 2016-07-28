var db = require('../db')
var todo = db.Schema(
	{
		todo:{type:String, require:true}
		, assignee:{type:[String]}
		, assigner:{type:String}
		, priority:{type:Boolean}
		, completed:{type:Boolean, require:true}
		, createUser:{type:String, require:true}
		, createDate:{type:Date, require:true}
		, completedDate:{type:Date, require:true}
		, desc:{type:String}

	}
	)

module.exports = db.model('Todo', todo)