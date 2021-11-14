const express = require("express");

const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");    //installed body-parser


app.set("view engine", "ejs");    //telling Express to use EJS as templating engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1, key2']
}));



// const { resolveInclude } = require("ejs");     to verify ???


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
  // all new shortURLs added to the urlDatabase are added with the key userId instead of userID. Case sensitivity will affect urlsForUser if not checked for.
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
    password: "456"
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
  const userId = req.session.user_id;
  const user = users[userId];

  if (!userId) {
    return res.status(403).send("Please Login first");
  }

  const userUrls = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: userUrls, user: user };
  res.render("urls_index", templateVars);
});



// GET /urls/new (create new URL)
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});



// GEt /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userId) {
    return res.status(403).send("Please Login first");
  }
  if (!urlsForUser(userId, urlDatabase)[shortURL]) {
    return res.status(404).send("404: Page not found");
  }
  
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId],
  };
  console.log('template vars =>', templateVars);
  res.render("urls_show", templateVars);
});



// generates a short URL and adds it to the database
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("Please Login first");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId };
  console.log('line 141 =>', { shortURL, databaseShortURL: urlDatabase[shortURL] });
  res.redirect(`/urls/${shortURL}`);
});



//requests to the endpoint "/u/:shortURL" will redirect to its longURL website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("404: Page not found");
  }

  const redirectUrl = urlDatabase[shortURL].longURL;
  console.log({redirectUrl});

  // The res.redirect() function redirects to the URL derived from the specified path, with specified status, a integer (positive) which corresponds to an HTTP status code. The default status is “302 Found”.
  return res.redirect("http://" + redirectUrl);
  // return res.redirect(longURL);
});



// POST (delete a single shortURL)
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userId) {
    return res.status(403).send("You do not have permission");
  }
  if (!urlsForUser(userId, urlDatabase)[shortURL]) {
    return res.status(404).send("404: Not found");
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});



// POST for urls/:shortURL
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userId) {
    return res.status(403).send("You do not have permission");
  }
  if (!urlsForUser(userId, urlDatabase)[shortURL]) {
    return res.status(404).send("404: Page is not found");
  }
  
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId};
  res.redirect("/urls");
});




/// LOGIN page (GET)
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (users[userId]) {
    return res.redirect("/urls");
  }
  if (!users[userId]) {
    const templateVars  = { user: undefined};
  
    res.render("urls_login", templateVars);
  }
});


// LOGIN page (POST)
app.post("/login", (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(403).send('You cannnot have an empty email or password field');
  }
  const user = emailLookup(email, users);   //////helper function
  if (!user) {
    return res.status(403).send('E-mail does not exist');
  }
  if (!bcrypt.compareSync(password, user.hashedPassword)) { //checks if password matches using bcrypt.compareSync
    return res.status(403).send("Password does not match");
  }

  req.session["user_id"] = user.id;
  res.redirect("/urls");
});





// REGISTRATION page, allowing user to register, using email and password
app.get("/register", (req, res) => {
  // get user id from cookie
  const userId = req.session.user_id;
  if (!users[userId]) {
    const templateVars = { user: undefined };
    
    return res.render("urls_registration", templateVars);
  }

  // const user = users[userId];
  // const templateVars = { urls: urlDatabase, user: user };
  res.redirect("/urls");
});



//REGISTRATION page: handles the registration form data
app.post("/register", (req, res) => {
  const email = req.body.email;
  const enteredPassword = req.body.password;
  // handling errors (empty email or password fields)
  if (email === '') {
    return res.status(400).send('Email is required');
  }
  if (enteredPassword === '') {
    return res.status(400).send('Password is required');
  }
  
  const user = emailLookup(email, users);
  if (user) {
    return res.status(400).send('This email is already registered');
  }
  //updating our -users- database
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(enteredPassword, 10); //hashing the password

  users[id] = {id, email, hashedPassword};
  
  req.session["user_id"] = id;
  
  res.redirect('/urls');
});


//LOGOUT page
app.post('/logout', (req, res) => {
  //req.session = null;
  req.session = null;  //this clears the cookie session
  res.redirect('/');
});



//code for the server to listen to the client...
app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});

