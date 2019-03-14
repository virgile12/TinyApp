const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
app.use(cookieParser())

function generateRandomString() {
 let output = Math.random().toString(36).substr(2, 5);
 return output;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};





app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL], username: req.cookies["username"] }
    res.render("urls_show", templateVars);
  });


  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  });

  // adding render to register end point
  app.get('/register', (req, res) => {
    res.render("urls_register", { username: null });
  });

  // need to add a post end point for a new user getting registered



  app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const newlongURL = req.body.longURL;
    urlDatabase[shortURL] = newlongURL;
    res.redirect("/urls");
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {username: req.cookies["username"]}
    res.render(`/urls/${shortURL}`);
  });

  app.post("/login", (req, res) => {
    let cookieOutput = req.body.username;
    res.cookie("username", cookieOutput);
    res.redirect("/urls");
  });
  app.post("/logout", (req, res) => {
    let cookieOutput = req.body.username;
    res.clearCookie('username')
    res.redirect("/urls");
  });
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

