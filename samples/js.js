// Require our dependencies.
var Backing = require('backing');
var Realm = require('../').Realm;

// Define our backing store.
// Realms need somewhere to store their data
var backing = new Backing({
  name: 'example-counter',
  arenaSize: 1024 * 1024,
  arenaSource: {
    type: 'mmap',
    dirname: __dirname + '/../data'
  }
});

// Define our realm.
var realm = new Realm(backing);
realm.init().then(function () {
  var count = realm.get('numberOfRuns') || 0;
  console.log('Number of runs:', count);
  realm.set('numberOfRuns', count + 1);
});

// Export some variables for REPL convenience:
exports.realm = realm;
exports.backing = backing;