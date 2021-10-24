var jokes = require('./jokes.json');

module.exports = function() {

  var r = Math.floor(Math.random() * jokes.jokes.length);
  return jokes.jokes[r];

};