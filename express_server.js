const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");    //telling Express to use EJS as templating engine

const bodyParser = require("body-parser");    //installed body-parser
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');  // installed cookie-parser
app.use(cookieParser());  ////DO I NEED THIS LINE???

// -----------------//

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Main page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Page where we make a new request
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`http://${longURL}`);
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


// Login page
app.post("/login", (req, res) => {
//const username = req.body.username;
//console.log(username);
res.cookie('username', req.body.username);
res.redirect("/urls");
});











function generateRandomString() {
  const result = Math.random().toString(36).substr(2,6);
  return result;
  //console.log(Math.random().toString(36))
  //console.log(result);
}
//generateRandomString();


//code for the server to listen to the client...
app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});




// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


