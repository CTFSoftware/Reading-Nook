const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("public"));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);

/*create Schemea*/
const listSchema = {

  title: String,
  author: String,
  rating: String
};


  
//new mongoose model
const List = mongoose.model("List", listSchema);



app.get('/signup', (req, res) => {
    res.render("signup")
});

app.post('/signup', (req, res) => {
    const users = new Users ({
        username: req.body.enterUsername,
        email: req.body.enterEmail,
        password: req.body.enterPass
    });
        

    users.save(function(err){
        if(!err){
            res.redirect('/signup')
            console.log('new user created');
        }
});
});




app.get("/", function (req, res) {
    res.render('login')
    });

    app.post('/', (req, res) => {
       const email = req.body.enterEmail;
       const password = req.body.enterPass;
       const username = req.body.enterUsername;


       Users.findOne({ email: username}, function(err, foundUser){
           if (err) {
               console.log(err);
           } else {
              
                       res.render('add')
                   }
       })
    });
    
     
   


app.get("/display", function(req, res){
    List.find({}, function(err, lists){
      res.render("display", {
       lists:lists
      });  
  
    })
     
  })

app.get('/delete/:id', function(req, res, ) {
      const id = req.params.id;

    List.findByIdAndRemove(id, (err) => {
    if (!err) {
    res.redirect('/display')
    } else {
    console.log('Failed to Delete user Details: ' + err);
    }
    });
    })


    app.get("/add", function (req, res) {
        res.render('add')
        });
    

app.post('/add', (req,res) => {
    
    const list = new List ({
        title: req.body.enterTitle,
        author: req.body.enterAuthor,
        rating: req.body.enterRating
    });
        

    list.save(function(err){
        if(!err){
            res.render("add")
        }
    });
    


    
});

//update part
app.get('/edit/:id', function(req, res) {
    List.findById(req.params.id, (err,lists ) => {
        if (!err) {
        res.render('edit', {
        lists:lists
        });
        } else {
        console.log('error', 'User not found with id = ' + req.params.id)
        res.redirect('/')
        }
        });
        })

//Creating a function to update data in MongoDB
app.post('/update/:id',  (req,res)=>{

    List.findByIdAndUpdate(req.params.id, {
        title: req.body.enterTitle || "Untitled Note",
        author: req.body.enterAuthor,
        rating: req.body.enterRating
    }, {new: true})
    .then(list => {
    
           console.log('success');
   
        res.redirect('/display')
    })
        
    });



       /* app.post('/update/:id',  (req,res)=>{
            List.findByIdAndUpdate(req.params.id,req.body);
            
        res.redirect('/display')
        });
        */

//Server Running
app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");
});
