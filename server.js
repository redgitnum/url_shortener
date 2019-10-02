"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cors = require("cors");

var app = express();

var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGOLAB_URI,{ useNewUrlParser: true, useUnifiedTopology: true }, (err, done) => {
    if (err) {
      console.log("error - " + err);
    }
  }
);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//model creating
var Schema = mongoose.Schema;
var urlSchema = new Schema({
  originalURL: String,
  shortURL: String
});
const MainModel = mongoose.model("MainModel", urlSchema, "MainModel");
//////////////////////////////////////////////////////////////////////////////
//adding new url and shorturl to the database, returning json with output data
app.get("/new/:url(*)", (req, res) => {
  var url = req.params.url;
  if(regex.test(url)) {
    var short = Math.floor(Math.random() * 10000).toString();

  const newurl = new MainModel({
    originalURL: url,
    shortURL: short
  });

  newurl.save((err) => {
    if (err) {
      console.log("something went wrong with saving data" + err);
    } else {
      console.log("save success");
    }

    res.json({ originalURL: url, shortURL: short });
  });
  }
  else {
    res.send("error - wrong URL format")
  }
  
});
///////////////////////////////////////////////////////////////////////
//looking for short url in the database and redirecting to original url
app.get("/:urlCode", (req, res) => {
  var urlCode = req.params.urlCode;
  
  MainModel.findOne({shortURL: urlCode}, (err, data)=> {
    if(err) {
      console.log("error fetching - "+err)
      res.send("error fetching - " + err)
    }
    else if(!data){
      res.send("no data found at this code")
    }
    else {
      res.status(301).redirect(data.originalURL)
    }
  })
});
//////////////////////////////////////////////////////////////////
//adding new url and shorturl to the database using the input on index main page, returning json with output data

app.post("/new/", (req, res)=> {
  var url = req.body.url;
  var httpURL = url.slice(0,4)
  if(httpURL != "http") {
    url = "http://"+ url
  }
  if(regex.test(url)) {
    var short = Math.floor(Math.random() * 10000).toString();

  const newurl = new MainModel({
    originalURL: url,
    shortURL: short
  });

  newurl.save((err) => {
    if (err) {
      console.log("something went wrong with saving data" + err);
    } else {
      console.log("save success");
    }

    res.json({ originalURL: url, shortURL: short });
  });
  }
  else {
    res.send("error - wrong URL format")
  }
   
})




app.listen(port, function() {
  console.log("Node.js listening ..."+ port);
});
