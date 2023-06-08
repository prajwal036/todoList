const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://prajwalsingh890:Test123@cluster0.yw8owy9.mongodb.net/todolistDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to your todo list"
});

const item2 = new Item({
    name: "Make sure to like subscribe"
});

const item3 = new Item({
    name: "Give me 5 stars rating"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List =  mongoose.model("List", listSchema);


app.get("/",function(req,res){
    // let today = new Date();
    
    // let options = {  month: 'long', day:'numeric', weekday:'long' };

    // let day = today.toLocaleDateString("en-US",options);
    
    Item.find({}).then((items) =>{
        
        if(items.length === 0){

            Item.insertMany(defaultItems).then((items) =>{

                console.log("items inserted successfully");

            }).catch((err) =>{

                console.log(err);
            });
            res.redirect("/");
        }
        else{
        res.render("list",{listTitle:"Today", newListItem:items});
        }
    }).catch((err) => {
        console.log(err);
    });

    
});

app.post("/",function(req,res){

    let itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name : itemName
    });
    
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName}).then((lists) =>{
            lists.items.push(item);
            lists.save();
            res.redirect("/"+ listName);
        }).catch((err) => {
            console.log(err);
        });
    }
    
});

app.post("/delete", function(req,res){
    const deleteItem =req.body.checkbox;
    const hiddenList = req.body.hiddenList;

    if(hiddenList === "Today"){
        Item.deleteOne({_id:deleteItem}).then((items) =>{
            console.log("items deleted successfully ");
    
        }).catch((err) =>{
    
            console.log(err);
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:hiddenList}, {$pull: {items: {_id:deleteItem}}}).then((lists) =>{
            res.redirect("/"+hiddenList);
        })


    }
});

app.get("/:listtype",function(req,res){
    const listType = _.capitalize(req.params.listtype);
    

    List.findOne({name:listType}).then((listTypes) => {
        
        if(!listTypes){
            //create a new list
            const list = new List({
                name: listType,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + listType);
        }
        else{
            
            //showing the existing list
            res.render("list",{listTitle:listTypes.name, newListItem:listTypes.items});
        }
    }).catch((err) => {
        console.log(err);
    });
});



app.listen(process.env.PORT || 3000, function(){
    console.log("This is port 3000");
});
