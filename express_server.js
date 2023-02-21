const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// CONFIG //

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine
app.use(express.urlencoded({ extended: true })); // encode the data to make it readable // Express library's body parsing middleware

// DATA BASE //

// generate a unique short url id
function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 6) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// urlDatabase used to keep track of all the URLs and their shortened forms
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// MIDDLEWARE //

// ROUTES //

// /urls.json webpage - json object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// /hello webpage
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// new route handler for "/urls"
app.get("/urls", (req, res) => {
  //rending the url index template
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET route, with the path /urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// new route handler for "/urls/:id"
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id], //req.params is how to access the value // req.params.id is the shortURL
  };
  res.render("urls_show", templateVars);
});

// POST request to receive form submission
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// /urls redirection to /urls/:id.
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // created a new variable for shortURL
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// DELETE ROUTE
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});
