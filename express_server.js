const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.use(cookieParser());
app.use(morgan('dev'));

const users = {

};

//helper variable
const user = Object.values(users).find(user => user.email === email);

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
  if (!req.params.id) {
    res.send("This shortened URL does not exist.");
    return;
  } else {
    const templateVars = {
      id: req.params.id, longURL: urlDatabase[req.params.id],
      user_id: req.cookies['user_id'],
      users
    };
    res.render('urls_show', templateVars);
  }
});

// POST: Create a new URL
app.post('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    res.send("Please login to shorten URLs");
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = longURL;
    const newURL = `${req.protocol}://${req.get('host')}/urls/${id}`;
    res.send(`New URL: ${newURL}`);
  }
});

// Route: Redirect to the long URL associated with the short URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("The requested URL does not exist");
  }
});

//Route: Register page
app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.cookies['user_id'],
      urls: urlDatabase,
      users
    };
    res.render('register', templateVars);
  }
});

//Route: Login page
app.get('/login', (req, res) => {
  console.log(users);
  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.cookies['user_id'],
      users
    };
    res.render('login', templateVars);
    console.log(users);
  }
});

//POST: Save new user registration details
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

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
  const { email, password } = req.body;

  if (!user || user.password !== password) {
    res.status(403).send('Invalid email or password');
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});

// POST: Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
