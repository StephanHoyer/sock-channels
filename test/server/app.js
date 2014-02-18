var express = require('express');

var app = express();

app.set('views', __dirname);
app.set('view engine', 'jade');

//register client js
app.use(express.static(__dirname + '/../client/'));
app.use(express.static(__dirname + '/../../'));
app.get('/', function(req, res) {
  res.render('index');
});
//app.listen(3333);

module.exports = app;
