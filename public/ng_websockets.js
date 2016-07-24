angular.module('app')
.run(function($rootScope, $timeout){

	(function connect(){
		var url = 'ws://' + window.location.host;
		var connection = new WebSocket(url)
		
		connection.onclose = function(e) {
			console.log('Websocket closed. reconnecting...')
			$timeout(connect, 10*1000)
		}
		connection.onmessage = function(e){
			console.log(e)
			var payload = JSON.parse(e.data)
			$rootScope.$broadcast('ws:' + payload.topic, payload.data);
		}
	})()

	// var url = 'ws://localhost:3000'
	// var connection = new WebSocket(url)
	// connection.onopen = function() {
	// 	console.log('Websocket connected!');
	// }
	// connection.onmessage = function(e){
	// 	console.log(e)
	// 	var payload = JSON.parse(e.data)
	// 	$rootScope.$broadcast('ws:' + payload.topic, payload.data);
	// }
})