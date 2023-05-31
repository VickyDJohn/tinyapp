const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.use(cookieParser());
app.use(morgan('dev'));

const users = {

};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Function to generate a random string of length 6
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

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
  const templateVars = {
    user_id: req.cookies['user_id'],
    urls: urlDatabase,
    users
  };
  res.render("urls_index", templateVars);
  console.log(users);
});

// Route: Form to create a new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users
  };
  res.render('urls_new', templateVars);
});

// Route: Show details of a specific URL
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id, longURL: urlDatabase[req.params.id],
    user_id: req.cookies['user_id'],
    users
  };
  res.render('urls_show', templateVars);
});

// POST: Create a new URL
app.post('/urls', (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  const newURL = `${req.protocol}://${req.get('host')}/urls/${id}`;
  res.send(`New URL: ${newURL}`);
});

// Route: Redirect to the long URL associated with the short URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

//Route: Register page
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    urls: urlDatabase
  };
  res.render('register');
});

//Route: Login page
app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users
  };
  res.render('login', templateVars);
});

//POST: Save new user registration details
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  const user = Object.values(users).find(user => user.email === email);
  if (user) {
    res.status(400).send('Email already exists.');
    return;
  }

  const newUser = {
    id,
    email,
    password
  };

  users[id] = newUser;
  res.cookie('user_id', id);
  res.redirect('/urls');
  console.log(users);
});

// POST: Delete a URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

// POST: Update a URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

//POST: login and set user_id cookie
app.post('/login', (req, res) => {
  const { user_id } = req.body;
  const user = Object.values(users).find(user => user.email === user_id);
  if (user) {
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  } else {
    res.status(401).send('User not found. Please <a href="/register">register</a>');
  }
});

// POST: Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
  console.log(users);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
