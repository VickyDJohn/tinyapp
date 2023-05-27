const express = require('express');
const app = express();
const PORT = 8080;
const morgan = require('morgan');

app.use(morgan, 'dev');

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
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// Route: Form to create a new URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// Route: Show details of a specific URL
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

// Route: Create a new URL
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

// Route: Delete a URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

// Route: Update a URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

//Route: login and set username cookie
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});