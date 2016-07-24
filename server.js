var express = require('express')
var bodyParser = require('body-parser')
var path = require('path');
var app = express()
app.use(bodyParser.json())

app.use('/api/sessions', require('./api/sessions'))
app.use('/api/users', require('./api/users'))

app.use('/api/todos', require('./api/todos'))

app.use(express.static(path.join(__dirname, 'public')))

//app.use('/', require('./router/NodeRouter'))
app.use('/*', require('./router/NodeRouter'))

var server = app.listen(3000, function(){
	console.log('Server listening on', 3000)
})

require('./websockets').connect(server);