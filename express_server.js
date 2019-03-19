const express = require("express");
const app = express();
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080;
const bcrypt = require('bcrypt');

// app.use(cookieParser());

app.use(
  cookieSession({
    name: 'session',
    keys: ['ab222be5-0215-45a0-8c01-41d141d1185b'],
  })
);

app.use(express.static('public'));



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
// ** PLZ ADD HASH FUNCTION
let usersDb = { 
  "4cbhg": {
    id: "4cbhg", 
    email: "mr_popo@caramail.com", 
    password: "asd"
    
  },
 "7jkgl": {
    id: "7jkgl", 
    email: "iamAUser@userdatabase.com", 
    password: "asd2"
 }
};
// IMPLEMENT CALLBACK HASH FUNCTION
// let hash = bcrypt.hashSync('myPassword', 10);

// FIX HASH IMPLEMENTATION
const createUser = (email, password) => {

  const userId = generateRandomString();
  // let hash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: userId,
    email: email,
    password: bcrypt.hashSync(password, 10)
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

// const authenticate = (email, password) => {
//   const usersArray = Object.values(usersDb);
//   for (let user in usersArray) {
//     if (usersArray[user].email === email && bcrypt.compareSync(password, usersArray[user].password)) {
//       return true;
//     }
//   }
// }




app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  const userId =  req.session.user_id
    let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL], user: usersDb[userId] }
    if (!userId) {
      res.redirect('/login')
    } else {
  res.render("urls_new",templateVars);
}
});

app.post("/urls", (req, res) => {
  const userId =  req.session.user_id
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
  const userId =  req.session.user_id
    let templateVars = { 
      user: usersDb[userId], 
      urls: urlDatabase,
    };
    if (!userId) {
      res.redirect('/login')
    } else {
      templateVars.urls = urlsForUser(userId)
      console.log("test userId main", userId)
      console.log("user", templateVars.user)
      console.log("check database", usersDb)
    res.render("urls_index", templateVars);
    }
  });

  app.get("/urls/:shortURL", (req, res) => {
    const userId =  req.session.user_id
    let templateVars = { 
      user: usersDb[userId],
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL], 
    }
    res.render("urls_show", templateVars);
  });


  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(`http://${longURL}`);
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    let userId = req.session.user_id
    
    if (userId && userId === urlDatabase[req.params.shortURL].userId) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.status(403).send("Access Forbidden")
    }
  });

  // adding render to register end point
  app.get('/register', (req, res) => {
    let userId =  req.session.user_id
    let templateVars = {user: usersDb[userId]};
    res.render("urls_register", templateVars);
  });

  // FIX HASH IMPLEMENTATION
  app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    if (email === "" || password === "") {
      res.status(400).send("Invalid input: Please enter Email and Password again.");
    } 
     else if (checkIfEmailExists(email)) {
      res.status(400).send("Email already Registered !");
    } else {

      let userId = createUser(email, password);
      console.log("check userId Register", userId)
      req.session.user_id = userId
     
    res.redirect('/urls');
    }
  });



  app.post("/urls/:shortURL", (req, res) => {
    let userId = req.session.user_id
    let shortURL = req.params.shortURL;
    let newlongURL = req.body.longURL;
    if (userId && userId === urlDatabase[shortURL].userId) {
      urlDatabase[shortURL]['longURL'] = newlongURL;
      res.redirect("/urls");
    } else {
      res.status(403).send("Access Forbidden")
    }
  });

  app.get("/urls/:shortURL", (req, res) => {
    const userId =  req.session.user_id
    let templateVars = {user: usersDb[userId]};
    res.render('urls_show');
  });

  app.get('/login', (req, res) => {
    
    const userId =  req.session.user_id
    let templateVars = {user: usersDb[userId]};
    res.render("urls_login", templateVars);
  });

// PLZ FIX HASH PASSWORD IMPLEMENTATION IN LOGIN
  app.post("/login", (req, res) => {
    // const {email, password} = req.body;

    
    const email = req.body.email;
    const password = req.body.password;
    
  
    if (email === "" || password === "") {
      res.status(400).send("Invalid input: Please enter Email and Password again.");
    } else if (!checkIfEmailExists(email)) {
      console.log(usersDb)
      console.log("testing", email)
      res.status(400).send("Invalid input:");

    } else {
      let user = getUserFromEmail(email);
      if (bcrypt.compareSync( password, user.password)) {
        req.session.user_id = user.id
        res.redirect("/urls");
      } else {
        res.status(400).send("Incorrect Password!");
      }
    }
  });

  app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
  });
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

