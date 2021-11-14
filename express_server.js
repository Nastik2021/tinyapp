const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
var cookieSession = require('cookie-session)')


app.set("view engine", "ejs");    //telling Express to use EJS as templating engine
app.use(bodyParser.urlencoded({extended: true}));

const bodyParser = require("body-parser");    //installed body-parser

const cookieParser = require('cookie-parser');  // installed cookie-parser
const { resolveInclude } = require("ejs");
app.use(cookieParser());


// Helper functions
const { emailLookup, urlsForUser, generateRandomString} = require("./helpers");


// -----------------//

// Urls Database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID:  "userRandomID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID:  "userRandomID"
  },

  "testID": {
    longURL: "http://www.hello.com",
    userID:  "user2RandomID"
  },
};



// Users Database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123"
  }
};

// Once connected to the server, re-direct to the Login page.
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});


// GET /urls (page showing My Urls but only if user is logged in)
app.get("/urls", (req, res) => {
  // get user id from cookie
  const userId = req.cookies["user_id"];
  const user = users[userId];

  if (!userId) {
    return res.status(403).send("Please Login first");   /// to verify....???
  }

  const usersUrls = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: usersUrls, user: user };
  res.render("urls_index", templateVars);
});






// GET /urls/new (create new URL)
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    const user = users[userId];
    const templateVars = { urls: urlDatabase, user: user };
    res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});

// GEt /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  
  
  
  
  
  res.render("urls_show", templateVars);
});





// generates a short URL and adds it to the database
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});



//requests to the endpoint "/u/:shortURL" will redirect to its longURL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`);
});



////requests to Delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


// app.post('/urls/:id', (req, res) => {

// // console.log(req.params.id);
// // console.log(req.body.longURL);
// urlDatabase[req.params.id] = req.body.longURL;

// //res.send('ok');
// //console.log(updateLongURL);
// //res.redirect('/urls');
// //});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //console.log(shortURL)
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

/// LOGIN page (GET)
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});


// LOGIN page (POST)
app.post("/login", (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(403).send('You cannnot have email or password empty');
  }
  const user = emailLookup(email, users);
  if (!user) {
    return res.status(403).send('Email doesnt exist');
  }
  if (!bcrypt.compareSync(password, user.password)) { //checks if password matches using bcrypt.compareSync
    return res.status(403).send("Password doesn't match");
  }

  res.cookie('user_id', user.id);
  res.redirect("/urls");
});





// REGISTRATION page, allowing user to register, using email and password
app.get("/register", (req, res) => {
  // get user id from cookie
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render('urls_registration', templateVars);
});

//REGISTRATION page: handles the registration form data
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  // handling errors (empty email or password fields)
  if (email === '') {
    return res.status(400).send('Email is required');
  }
  if (password === '') {
    return res.status(400).send('Password is required');
  }
  
  if (emailLookup(email, users)) {
    return res.status(400).send('This email is already registered');
  }
  //updating our -users- database
  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10); //hashing the password

  const user = {
    id: userID,
    email: email,
    password: password
  };
  users[userID] = user;
  res.cookie('user_id', userID);
  
  // users[abcd] = {
  //  id: abcd,
  // email: abcd@gmail.com,
  // password: hello
  //}

  // res.cookie('user_id', userID);
  res.redirect('/urls');
});

//LOGOUT page
app.post('/logout', (req, res) => {
  //req.session = null;
  res.clearCookie("user_id");
  res.redirect('/urls');
});




//code for the server to listen to the client...
app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});


