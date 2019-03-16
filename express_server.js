const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080
app.use(cookieParser());
app.use(express.static('public'))



function generateRandomString() {
 let output = Math.random().toString(36).substr(2, 5);
 return output;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let urlDatabase = {
  'b2xVn2' : { longURL: "http://www.lighthouselabs.ca", userId: "4cbhg",},
  '9sm5xK' : { longURL: "http://www.google.com" , userId: "4cbhg" }
};

const usersDb = { 
  "4cbhg": {
    id: "4cbhg", 
    email: "mr_popo@caramail.com", 
    password: "asd"
  },
 "7jkgl": {
    id: "7jkgl", 
    email: "iamAUser@userdatabase.com", 
    password: "dishwasher-funk"
  }
};


const createUser = (email, password) => {

  const userId =generateRandomString();

  const newUser = {
    id: userId,
    email: email,
    password: password,
  };

  usersDb[userId] = newUser;

  return userId;
};

checkIfEmailExists = (email) => {
  for (let userGeneratedId in usersDb) {
    if (email === usersDb[userGeneratedId]['email']) {
      return true
    } 
}
}

getUserFromEmail = (email) => {
  for (let userId in usersDb) {
    if (email === usersDb[userId]['email']) {
      return usersDb[userId]
    }
  }
}

const urlsForUser = (userId) => {
  let filteredUrls = {};
  for (let shortUrlKey in urlDatabase) {
    if (userId === urlDatabase[shortUrlKey].userId) {
       filteredUrls[shortUrlKey] = urlDatabase[shortUrlKey]
    }
  }
  return filteredUrls;

}




app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  const userId =  req.cookies['user_id'];
    let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL], user: usersDb[userId] }
    if (!userId) {
      res.redirect('/login')
    } else {
  res.render("urls_new",templateVars);
}
});

app.post("/urls", (req, res) => {
  const userId =  req.cookies['user_id'];
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  if (userId) {
  urlDatabase[shortURL] = { longURL : longURL, userId: userId}
  res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login')
  }
});

app.get("/urls", (req, res) => {
  const userId =  req.cookies['user_id'];
    let templateVars = { 
      user: usersDb[userId], 
      urls: urlDatabase,
    };
    if (!userId) {
      res.redirect('/login')
    } else {
      templateVars.urls = urlsForUser(userId)
    res.render("urls_index", templateVars);
    }
  });

  app.get("/urls/:shortURL", (req, res) => {
    const userId =  req.cookies['user_id'];
    let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL], user: usersDb[userId] }
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
    const userId =  req.cookies['user_id'];
    let templateVars = {user: usersDb[userId]};
    res.render("urls_register", templateVars);
  });

  // need to add a post end point for a new user getting registered
  app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    if (email === "" || password === "") {
      res.status(400).send("Invalid input: Please enter Email and Password again.");
    } 
     else if (checkIfEmailExists(email)) {
      res.status(400).send("Email already Registered !");
    } else {
   
      const userId = createUser(email, password);
      res.cookie('user_id', userId)
  
    // set the cookie with the user_id (cookie session)
    // req.session.user_id = userId;
    }
    res.redirect('/urls');
  });



  app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const newlongURL = req.body.longURL;
    urlDatabase[shortURL]['longURL'] = newlongURL;
    res.redirect("/urls");
  });

  app.get("/urls/:shortURL", (req, res) => {
    const userId =  req.cookies['user_id'];
    let templateVars = {user: usersDb[userId]};
    res.render('urls_show');
  });

  app.get('/login', (req, res) => {
    
    const userId =  req.cookies['user_id'];
    let templateVars = {user: usersDb[userId]};
    res.render("urls_login", templateVars);
  });

  app.post("/login", (req, res) => {

    const {email, password} = req.body;
  
    if (email === "" || password === "") {
      res.status(400).send("Invalid input: Please enter Email and Password again.");
    } else if (!checkIfEmailExists(email)) {
      res.status(400).send("Invalid input:");

    } else {
      let user;
      user = getUserFromEmail(email);
      if (user.password === password) {
        res.cookie('user_id', user.id)
        res.redirect("/urls");
      } else {
        res.status(400).send("Incorrect Password!");
      }
    }
  });

  app.post("/logout", (req, res) => {
    let cookieOutput = req.body.user_id;
    res.clearCookie('user_id', cookieOutput)
    res.redirect("/urls");
  });
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

