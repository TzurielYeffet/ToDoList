//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.bu9vz.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
///////////////////////////// **************************************  SCHEMA DECLARATIONS ************************************** ////////////////////////////////////
const itemSchema = mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);
///////////////////////////// **************************************  SCHEMA DECLARATIONS ************************************** ////////////////////////////////////




const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});


const defaultItems = [item1, item2, item3];
//
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list

  const newItem = new Item({
    name: itemName
  });


  if(listName==="Today"){
  newItem.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,result){
    result.items.push(newItem);
    result.save();
    res.redirect("/"+listName);
  });
}

});

app.post("/delete", function(req, res) {
  const checkItemID = req.body.checkbox;
  const listName= req.body.listName;
  if(listName === "Today"){
      Item.findByIdAndRemove(checkItemID, function(err) {
    if (!err) {
      console.log("Successfuly deleted item from DB");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkItemID}}},function(err,result){
    if(!err){
      res.redirect("/"+ listName);
    }
  });
}
});

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success!");
        }
      });
      res.redirect("/");
      // console.log(foundItems);
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err, result){
  if(!err){
    if(!result){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
       list.save();
       res.redirect("/" + customListName);
    }else{
      res.render("list",{listTitle:result.name,newListItems:result.items});
    }
  }
});
});


// res.redirect("/"+ listName);
// else {
// const list = new List({
//   name: customListName,
//   items: defaultItems
// });
// res.redirect("/" + listName);
// }
// });


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
