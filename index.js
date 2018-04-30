var express = require("express");
var app = express();
app.set('view engine', 'ejs')
var port = 3000;
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoose = require("mongoose");
mongoose.Promise = global.Promise; mongoose.connect("mongodb://localhost:27017/dbtest1");

var nameSchema = new mongoose.Schema({
    name: String,
    department: String
});

var User = mongoose.model("User", nameSchema);

app.get("/", (res, req) => {
    res.send("All APIs up and running !!")
});

app.get("/input", (req, res) => {
    res.sendFile(__dirname + "/input.html");
});

app.get("/update", (req, res) => {
    res.sendFile(__dirname + "/update.html");
});

app.get("/delete", (req, res) => {
    res.sendFile(__dirname + "/delete.html");
});


app.get("/view", (req, res) => {
    var resultArray = [];
    mongo.connect('mongodb://localhost:27017', function (err, client) {
        var db = client.db('dbtest1');
        assert.equal(null, err);
        var cursor = db.collection('users').find({});
        cursor.forEach(function (doc) {
            assert.notEqual(null, doc);
            resultArray.push(doc);
        }, function (err, doc) {
            assert.equal(null, err);
            client.close();
            console.log(resultArray.length);
            res.render('disp', { resultArray: resultArray });
        });
    });
});

app.post("/addstd", (req, res) => {
    var myData = new User(req.body);
    myData.save()
        .then(item => {
            console.log("Added");
            res.send("item saved to database");
        })
        .catch(err => {
            console.log("Not added");
            res.status(400).send("unable to save to database");
        });
});

app.post("/updateapi", (req, res) => {


    MongoClient.connect('mongodb://localhost:27017', function (err, client) {
        var db = client.db('dbtest1');
        if (err) throw err;
        //var dbo = db.db("mydb");
        var myquery = { name: req.body.name1 };
        var newvalues = { $set: { department: req.body.department1 } };
        db.collection("users").updateMany(myquery, newvalues, function (err, obj) {
            if (err) throw err;
            console.log(obj.result.nModified + " document(s) updated");
            client.close();
            res.send("Updated successfully");
        });
    });


});


app.post("/deleteapi", (req, res) => {


    MongoClient.connect('mongodb://localhost:27017', function (err, client) {
        var db = client.db('dbtest1');
        if (err) throw err;
        //var dbo = db.db("mydb");
        var myquery = { name: req.body.name1 };
        db.collection("users").deleteMany(myquery, function (err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
            client.close();
            res.send("Deleted successfully");
        });
    });


});


app.listen(port, () => {
    console.log("Server listening on port " + port);
});