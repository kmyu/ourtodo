var _ = require('lodash')
var ws = require('ws')

var clients = [];

exports.connect = function(server) {
	var wss = new ws.Server({server:server})

	wss.on('connection', function(clientWebsocket){
		console.log('connect client websocket!')
		clients.push(clientWebsocket);

		exports.brodcast('new client join!')


		clientWebsocket.on('close', function(){
			console.log('close client websocket!')
			_.remove(clients, clientWebsocket);
		})

	})
}
exports.brodcast = function(topic, data) {
	var json = JSON.stringify({topic:topic, data:data})
	clients.forEach(function(client){
		client.send(json);
	})
}
