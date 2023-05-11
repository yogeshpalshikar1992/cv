const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://yogeshpalshikar1992:yDinVZg4ik32qqEu@cluster0.ghc0te6.mongodb.net/todolistDB")
const itemSchema = {
    name : String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your To do list"
});

const item2 = new Item({
    name: "Hit + Button to add new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete the item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


// var items = [];
// var work_items = [];

app.get("/", function(req, res){
    // let day = date.getDay();
    const day = "Today";

    Item.find().then(function(items){
        if(items.length === 0){
            Item.insertMany(defaultItems).then(function(){
                console.log("Items inserted successfully")
            }).catch(function(err){
                console.log(err)
            });
            res.redirect("/")
        }
        else{
            res.render("list", {listTitle: day, items: items}); 
        }
        
    }).catch(function(err){
        console.log(err)
    });
    
});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    console.log(req.body.list);

    const new_item = new Item({
        name: itemName
    })

    if (listName === "Today"){
        new_item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName}).then(function(doc) {
            doc.items.push(new_item);
            doc.save();
            res.redirect("/"+listName)
        }).catch(function(err){
            console.log(err)
        })
    }
    
    // if (req.body.list === "work"){
    //     work_items.push(req.body.newItem);
    //     res.redirect("/work");
    // }
    // else
    // {
    //     items.push(req.body.newItem);
    //     res.redirect("/");
    // }
    
});

app.post("/delete", function(req, res){
    const id = req.body.checkbox;
    const listTitle = req.body.listName;

    if (listTitle === "Today"){
        Item.findByIdAndDelete(id).then(function(){
            console.log("Deleted successfully");
            res.redirect("/")
        }).catch(function(err){
            console.log(err);
        });
    }
    else{
        List.findOneAndUpdate({name: listTitle},{$pull: {items:{_id: id}}}).then(function(){
            console.log("deleted Successfully");
            res.redirect("/"+ listTitle)
        }).catch(function(err){
            console.log(err);
        })
    }

    

    // Item.deleteOne({_id: id}).then(function(){
    //     console.log("deleted successfully");
    // }).catch(function(err){
    //     console.log(err)
    // })
    
})

app.get("/:customListName", function(req, res){
    customListName = req.params.customListName;
    List.findOne({name: customListName}).then(function(doc){
        if(!doc){
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save();
            res.redirect("/"+customListName); 
        }
        else{
            res.render("list", {listTitle: doc.name, items: doc.items}); 
        }
    }).catch(function(err){
        console.log("Does not exists")
    });

    
});

app.post("/work", function(req, res){
    res.redirect("/work");
});

app.listen(3000, function(){
    console.log("Listening on port 3000")
});
