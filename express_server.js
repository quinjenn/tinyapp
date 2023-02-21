const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// new route handler for "/urls/:id"
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: "http://www.lighthouselabs.ca",
  };
  res.render("urls_show", templateVars);
});