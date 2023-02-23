const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

// CONFIG //

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine
app.use(express.urlencoded({ extended: true })); // encode the data to make it readable // Express library's body parsing middleware
app.use(cookieParser());

// app.get("/", function (req, res) {
// Cookies that have not been signed
// console.log("Cookies: ", req.cookies);
// });

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

function getUserbyEmail(users, email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

// store and access the users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

// GET route, with the path /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

// new route handler for "/urls/:id"
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
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

// EDIT ROUTE
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// POST request to /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Search for a user with an existing email
  const foundUser = getUserbyEmail(users, email);
  console.log("foundUser", foundUser);
  // Check if the email is not found
  if (!foundUser) {
    return res.status(403).send("Invalid email or password.");
  }
  // Check if the password is correct
  if (foundUser.password !== password) {
    return res.status(403).send("Invalid email or password.");
  }
  // Set cookie
  res.cookie("user_id", foundUser.id);
  // Redirect to /urls
  res.redirect("/urls");
});

// LOGOUT ROUTE to clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//GET /register endpoint
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

// POST /register endpoint
app.post("/register", (req, res) => {
  // Get the email and password from the request body
  const { email, password } = req.body;
  // Check if email or password is missing
  if (!email || !password) {
    res.status(400).send("Email and password are required to log in.");
    return;
  }
  const foundUser = getUserbyEmail(email, users);
  // Check if the email is already taken
  if (foundUser) {
    res.status(400).send("Email already exists.");
    return;
  }
  // Add the random ID and add it to the user
  const newUser = {
    id: generateRandomString(),
    email,
    password,
  };
  // Adding the user to the database (email, user, and id)
  users[newUser.id] = newUser;
  // Set cookie
  res.cookie("user_id", newUser.id);
  // Redirect to the /urls page
  res.redirect("/urls");
});

// GET /login endpoint
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});
