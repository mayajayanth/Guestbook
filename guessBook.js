var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('devicesDb');
var date = new Date();


var listDevices = {
	listDevices:[],
	addRawLine:function(rawLine){
		if(rawLine.length>0){
			var words = rawLine.split(/[ \t]+/);
			// create a new device obj
			var device = {addr:undefined,name:undefined,time:undefined};
			device.addr = words[1];
			device.name = words[2];
			device.time = date.getTime();
			// console. log('adding device: ',device);
			this.addDevice(device);
		}
	},
	addDevice:function(device){
		this.listDevices.push(device);
	},	
	getListDevices:function(){
		return this.listDevices;
	}
};

var exec = require('child_process').exec,
    child;
// run repeatedly
setInterval(
	function(){
		console.log('Scanning for devices')
		// create the subprocess, replace with linux call 
		child = exec('node testProgram.js', 
		  function (error, stdout, stderr) {

		    // console.log('stdout: ' + stdout);
		    var lines = stdout.split('\n');
		    // remove the first line
		    lines.splice(0,1);
		    for (var i = lines.length - 1; i >= 0; i--) {
		    	var line = lines[i];
		    	listDevices.addRawLine(line);
		    };
		    // console.log(listDevices.getListDevices());
		    //console.log(lines);
		    //console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
		});
	},10000);


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.send(listDevices.getListDevices());
});

// run the server
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

