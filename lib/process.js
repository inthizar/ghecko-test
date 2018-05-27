var mongo = require('../adapter/mongo');

var Process = {};

function validType(type) {
  return isNaN(type);
}

function validId(id) {
  return Number.isInteger(id*1) && id > 0;
}

function validTime(time) {
  return Number.isInteger(time*1) && time > 0;
}

Process.loadData = function(data, fn) {
  var insertData = [], insertIds = [];
  for(var i in data) {
    var upData = null;
    try {
      upData = JSON.parse(data[i][3].replace(/\\"/g, '"'));
    } catch(e) {
      console.error(e.message);
    }
    if(!upData || Object.prototype.toString.call(upData) != '[object Object]') return fn(null, {s: false, m: 'error at row ' + i + ' column 4'});
    if(!validId(data[i][0]*1) || !validTime(data[i][2]*1) || !validType(data[i][1])) {
      return fn(null, {s: false, m: 'error at row ' + i});
    }
    var id = mongo.genId();
    insertIds.push(id);
    insertData.push({_id: id, objectId: data[i][0]*1, objectType: data[i][1], tstamp: data[i][2]*1, data: upData});
  }
  if(insertData.length) {
    var rollback = false;
    var failedrow = [];
    mongo.connect().then(function(db) {
      try {
        db.collection('transactions').insertMany(insertData, {writeConcern: {w:"majority"}, ordered: true}).then(function(result) {
          if(result.result.ok == 1 && result.insertedCount == insertIds.length) 
            return fn(null, {s: true, m: 'successful import num items: '+ result.insertedCount});
            
          if(Object.values(result.insertedIds).length) {
            for(var d in insertIds) {
              if(Object.values(result.insertedIds).indexOf(insertIds[d]) == -1) failedrow.push(d+1); 
            }
            rollback = failedrow.length > 0;
          } else rollback = true;
          if(!rollback)
            return fn(null, {s: true, m: 'successful imports: '+result.insertedCount+'. failed rows: '+failedrow.join()});
          else {
            db.collection('transactions').deleteMany({_id: {$in: insertIds}}, {writeConcern: {w:"majority"}}).then(function(result) {
              if(result.result.ok == 1 && result.deletedCount == insertIds.length) return fn(null, {s: false, m: 'failed import. rollback done.failed rows: '+failedrow.join()});
              else return fn(null, {s: false, m: 'failed import. rollback failed.failed rows: '+failedrow.join()});
            });
          }
        });
      } catch(e) {
        var mes = '';
        if(e instanceof BulkWriteError) {
          var errows = [];
          if(e.writeErrors.nInserted == insertIds.length) return fn(null, {s: true, m: 'inserted num items: '+ insertIds.length});
          if(e.writeErrors.length) {
            rollback = true;
            for(var er in e.writeErrors) {
              errows.push(er.index);
            }
            mes = 'failed rows: ' + errows.join();
            return fn(null, {s: true, m: 'number of successful import: '+ e.writeErrors.nInserted+ '. failed rows: ' + errows.join() || 'None'});
          } else if(e.writeConcernErrors.length) {
            rollback = true;
            for(var er in e.writeConcernErrors) {
              msg += er.errmsg+'.';
            }
          }
        } else if (e instanceof WriteConcernError) {
          rollback = true;
          msg = e.errmsg;
        }
        db.collection('transactions').deleteMany({_id: {$in: insertIds}}, {writeConcern: {w:"majority"}}).then(function(result) {
          if(result.result.ok == 1 && result.deletedCount == insertIds.length) return fn(null, {s: false, m: 'failed import. rollback done.'+msg});
          else return fn(null, {s: false, m: 'failed import. rollback failed.'+msg});
        });
      } 
   });
  }
}

Process.query = function(type, id, time, fn) {
  if(!validId(id) || !validTime(time) || !validType(type)) return fn(null, {});
  mongo.connect().then(function(db) {
    db.collection('transactions').find({objectId: id*1, objectType: type, tstamp: {$lte: time*1}}).sort({tstamp: 1}).toArray(function(err, result) {
      if(err) {console.error(err); return fn(err, {});}
      var data = {};
      for(var r in result) {
        data = Object.assign(data, result[r].data);
      } 
      fn(err, data);
    });
  });
}

module.exports = Process;
