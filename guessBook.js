var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('devicesDb2');
var date = new Date();
var test = new Date().toJSON().slice(0,10);
var moment = require('moment');
var now = moment();
var normal = now.format("MM-DD-YYYY");
var blackList = [];
var isInBlackList = false;
db.run("CREATE TABLE IF NOT EXISTS devices (macaddr TEXT, devicename TEXT, devicedate TEXT )");

setInterval( function(){
	blackList = [];
	isInBlackList = false;
	console.log('BLACKLIST CLEARED')
},15000) //10seconds clear blackList

function fetchDb(res) {
	db.all('SELECT rowid AS id, macaddr, devicename, devicedate FROM devices', [], function(err, rows){
		if(err !==null ){
			res.send({ok: false, message: 'error while fetching'});
			console.log('fetch error', err);
		} else {
			var devices = [];
			rows.forEach(function(row){
				devices.push({id: row.id, macaddr: row.macaddr, devicename: row.devicename, devicedate: row.devicedate});
			});
			res.send({ok: true, devices: devices});
		}
	})
 }
var listDevices = {
	listDevices:[],
	addRawLine:function(rawLine){
		if(rawLine.length>0){
			var words = rawLine.split(/[ \t]+/);
			//console.log('Val of blackList', blackList);
			// create a new device obj
			var device = {addr:undefined,name:undefined,time:undefined};
			device.addr = words[1];
			device.name = words[2];
			device.time = date.getTime();
			// console. log('adding device: ',device);
			this.addDevice(device);
			for (var i = blackList.length - 1; i >= 0; i--) {
				if(blackList[i] == words[2])
					isInBlackList = true;
			};
			if(isInBlackList == false) {
				var stmt = db.prepare("INSERT INTO devices (macaddr, devicename, devicedate) VALUES (? ,? , ?)");
				stmt.run(words[1], words[2], Math.round(new Date().getTime()/1000.0));
				blackList.push(words[2]);
				console.log('Black list', blackList);
				stmt.finalize();
			}

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
  //res.send(listDevices.getListDevices());
  console.log('it broke here');
  fetchDb(res);
});
// run the server
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
// db.each("SELECT rowid AS id, macaddr, devicename, devicedate FROM devices", function(err, row) {
//       console.log(row.id + ": " + row.macaddr +' '+ row.devicename +' '+row.devicedate);
// });
//db.close();