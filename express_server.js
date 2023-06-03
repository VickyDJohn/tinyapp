const express = require('express');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8080;

// Set up cookie session
app.use(cookieSession({
  name: 'session',
  keys: ['secret-key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Middleware setup
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const users = {};
const urlDatabase = {};

// Route: Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route: JSON representation of the URL database
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Route: Example HTML response
app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route: Display all URLs
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    const errorMessage = "Please log in or register to view URLs.";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <h1>Error</h1>
        <p>${errorMessage}</p>
      </body>
      </html>
    `;
    res.send(html);
  } else {
    const userUrls = urlsForUser(userId, urlDatabase);
    const templateVars = {
      user_id: userId,
      urls: userUrls,
      users
    };
    res.render("urls_index", templateVars);
  };
});

// Route: Form to create a new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    users
  };
  res.render('urls_new', templateVars);
});

// Route: Show details of a specific URL
app.get('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const urlId = req.params.id;
  const url = urlDatabase[urlId];

  if (!userId) {
    res.send("Please login or register first.");
    return;
  }

  if (!url || url.userID !== userId) {
    res.send("You do not have access to this URL.");
    return;
  }

  const templateVars = {
    id: urlId,
    longURL: url.longURL,
    user_id: userId,
    users
  };
  res.render('urls_show', templateVars);
});

// POST: Create a new URL
app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send("Please login to shorten URLs");
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.session.user_id;
    urlDatabase[id] = {
      longURL,
      userID
    };
    const newURL = `${req.protocol}://${req.get('host')}/urls/${id}`;
    res.redirect('/urls');
  }
});

// Route: Redirect to the long URL associated with the short URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : null;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("The requested URL does not exist");
  }
});

//Route: Register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.session['user_id'],
      users
    };
    res.render('register', templateVars);
  }
});

//Route: Login page
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.session['user_id'],
      users
    };
    res.render('login', templateVars);
  }
});

//POST: Save new user registration details
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email, users);
  if (user) {
    res.status(400).send('Email already exists.');
    return;
  }

  const id = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    id,
    email,
    password: hashedPassword
  };

  users[id] = newUser;
  req.session.user_id = id;
  res.redirect('/urls');
});

// POST: Delete a URL
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.user_id;
  const urlId = req.params.id;
  const url = urlDatabase[urlId];

  if (!userId) {
    res.send("Please login or register first.");
    return;
  }

  if (!url || url.userID !== userId) {
    res.send("You do not have permission to delete this URL.");
    return;
  }

  delete urlDatabase[urlId];
  res.redirect('/urls');
});

// POST: Update a URL
app.post('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const urlId = req.params.id;
  const url = urlDatabase[urlId];

  if (!userId) {
    res.send("Please login or register first.");
    return;
  }

  if (!url || url.userID !== userId) {
    res.send("You do not have permission to edit this URL.");
    return;
  }

  const newLongURL = req.body.longURL;
  urlDatabase[urlId].longURL = newLongURL;
  res.redirect('/urls');
});

//POST: login and set user_id cookie
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Invalid email or password');
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

// POST: Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});