const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));

mongoose.connect("mongodb+srv://admin-shruthan:pass_26@cluster0-a9lgd.mongodb.net/todolistdb", { useNewUrlParser : true });
mongoose.set('useFindAndModify', false);

const itemsSchema = {
  name : String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const item1 = new Item({
  name : "Welcome!"
});

const item2 = new Item({
  name : "Click + to add"
});

const item3 = new Item({
  name : "Click to delete"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model('List', listSchema)

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          } else {
            console.log("Inserted items!")
          }
        });
        res.redirect('/');

      } else {
        res.render('list', { listTitle : "Today", newListItems : foundItems});
      }

  })
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name : customListName}, (err, foundList) => {
    if (!err){
      if (!foundList){
        // Create a new list
        const list = new List({
          name : customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customListName)
      } else {
        //Show an existing list
        res.render("list", { listTitle : customListName, newListItems : foundList.items});
      }
    }
  })


})


app.post('/', (req, res) => {

    const itemName = req.body.todo;
    const listName = req.body.add;
    const item =  new Item({
      name : itemName
    });

    if (listName === 'Today'){
        item.save();
        res.redirect('/');
    } else {
      List.findOne({name : listName}, (err, foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      })
    }

})

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted item!");
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({name : listName}, {$pull: {items: {_id : checkedItemId}}}, (err, foundList) => {
      if(!err){
        res.redirect('/' + listName);
      }
    });
  }



})

app.listen(3000, (req, res) => {
    console.log("Server Running on port 3000")
})
