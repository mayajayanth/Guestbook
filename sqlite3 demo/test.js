var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('devicesDb');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS devices (macaddr TEXT, devicename TEXT, devicedate TEXT )");

  var stmt = db.prepare("INSERT INTO devices (macaddr, devicename, devicedate) VALUES (? ,? , ?)");
  //for (var i = 0; i < 10; i++) {
      stmt.run('28:CF:DA:08:B5:6A', 'Ashish',new Date().getTime());
      stmt.run('69:CF:ew:08:B5:23', 'Shishi',new Date().getTime());
      stmt.run('28:CF:DA:08:B5:6B', 'Usheesh',new Date().getTime());
     
  //}
  stmt.finalize();

  db.each("SELECT rowid AS id, macaddr, devicename, devicedate FROM devices", function(err, row) {
      console.log(row.id + ": " + row.macaddr +' '+ row.devicename +' '+row.devicedate);
  });
});

db.close();