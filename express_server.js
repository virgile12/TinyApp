const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(
cookieSession({
    name: 'session',
    keys: ['ab222be5-0215-45a0-8c01-41d141d1185b'],
  })
);

function generateRandomString() {
 let output = Math.random().toString(36).substr(2, 5);
 return output;
}

const createUser = (email, password) => {
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  usersDb[userId] = newUser;
  return userId;
};
// Checks if user input email exists in database
checkIfEmailExists = (email) => {
  for (let userGeneratedId in usersDb) {
    if (email === usersDb[userGeneratedId]['email']) {
      return true;
    } 
  }
}
// Confirmation Email function for Session Cookie
getUserFromEmail = (email) => {
  for (let userId in usersDb) {
    if (email === usersDb[userId]['email']) {
      return usersDb[userId];
    }
  }
}
// Sets users specific urls
const urlsForUser = (userId) => {
  let filteredUrls = {};
  for (let shortUrlKey in urlDatabase) {
    if (userId === urlDatabase[shortUrlKey].userId) {
      filteredUrls[shortUrlKey] = urlDatabase[shortUrlKey];
    }
  }
  return filteredUrls;
}

// userDatabase global
let usersDb = {};
// urlDataBase global
let urlDatabase = {};

app.get('/urls/new', (req, res) => {
  const userId =  req.session.user_id;
  let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL], user: usersDb[userId] };
  if (!userId) {
    res.redirect('/login');
  } else {
    res.render('urls_new',templateVars);
  }
});

//Main page end point - post
app.post('/urls', (req, res) => {
  const userId =  req.session.user_id;
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    if (userId) {
      urlDatabase[shortURL] = { longURL : longURL, userId: userId};
      res.redirect(`/urls/${shortURL}`);
    } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const userId =  req.session.user_id;
  let templateVars = {
    user: usersDb[userId],
    urls: urlDatabase,
    };
    if (!userId) {
      res.redirect('/login');
    } else {
    templateVars.urls = urlsForUser(userId);
    res.render('urls_index', templateVars);
    }
  });

  app.get('/urls/:shortURL', (req, res) => {
    const userId =  req.session.user_id;
    let templateVars = { 
      user: usersDb[userId],
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL], 
    };
    res.render('urls_show', templateVars);
  });

  app.get('/u/:shortURL', (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });

  app.post('/urls/:shortURL/delete', (req, res) => {
    const userId = req.session.user_id;

    if (userId && userId === urlDatabase[req.params.shortURL].userId) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    } else {
      res.status(403).send('Access Forbidden')
    }
  });

  app.get('/register', (req, res) => {
    const userId =  req.session.user_id;
    let templateVars = {user: usersDb[userId]};
    res.render('urls_register', templateVars);
  });

  app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (email === '' || password === '') {
      res.status(400).send('Invalid input: Please enter Email and Password again.');
    }
     else if (checkIfEmailExists(email)) {
       res.status(400).send('Email already Registered !');
      } else {
        let userId = createUser(email, password);
        req.session.user_id = userId;
        res.redirect('/urls');
      }
    });

    app.post('/urls/:shortURL', (req, res) => {
    const userId = req.session.user_id;
    const shortURL = req.params.shortURL;
    const newlongURL = req.body.longURL;
    if (userId && userId === urlDatabase[shortURL].userId) {
      urlDatabase[shortURL]['longURL'] = newlongURL;
      res.redirect('/urls');
    } else {
      res.status(403).send('Access Forbidden');
    }
  });

  app.get('/urls/:shortURL', (req, res) => {
    res.render('urls_show');
  });
  
  app.get('/login', (req, res) => {
    const userId =  req.session.user_id;
    let templateVars = {user: usersDb[userId]};
    res.render('urls_login', templateVars);
  });
  

  app.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
// If, Else If : sends error status for empty input or empty userId in database.
    if (email === '' || password === '') {
      res.status(400).send('Invalid input: Please enter Email and Password again.');
    } else if (!checkIfEmailExists(email)) {
      res.status(400).send('Invalid input:');
// Else : Logs user, encrypt password, or Redirect if incorrect password for userId input.
    } else {
      let user = getUserFromEmail(email);
      if (bcrypt.compareSync( password, user.password)) {
        req.session.user_id = user.id;
        res.redirect('/urls');
      } else {
        res.status(400).send('Incorrect Password!');
      }
    }
  });

  app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/urls');
  });

  app.get('/', (req, res) => {
    res.redirect('/urls');
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
    });
