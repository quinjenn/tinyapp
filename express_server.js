const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

// CONFIG //

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine
app.use(express.urlencoded({ extended: true })); // encode the data to make it readable // Express library's body parsing middleware
// app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: [
      "user_id",
      /* secret keys */
    ],

    // Cookie Options
    // maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// DATA BASE //
const {
  generateRandomString,
  getUserbyEmail,
  getUserbyId,
} = require("./helpers");

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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// MIDDLEWARE //
function isLoggedIn(req, res, next) {
  const userId = req.session["user_id"];
  if (userId && getUserbyId(userId)) {
    next();
  } else {
    res.redirect("/login");
  }
}

function isLoggedOut(req, res, next) {
  const userId = req.session["user_id"];
  if (!userId || !getUserbyId(userId)) {
    next();
  } else {
    res.redirect("/urls");
  }
}

// returns the URLs where the userID is equal to the id of the currently logged-in user
function urlsForUser(id) {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}
// ROUTES //

// /urls.json webpage - json object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// /hello webpage
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// new route handler for "/urls" // if loggedin
app.get("/urls", isLoggedIn, (req, res) => {
  //rending the url index template
  const userId = req.session["user_id"];
  const templateVars = {
    urls: urlsForUser(userId),
    user: getUserbyId(users, userId),
  };
  res.render("urls_index", templateVars);
});

// GET route, with the path /urls/new // if loggied in
app.get("/urls/new", isLoggedIn, (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: getUserbyId(users, userId),
  };
  res.render("urls_new", templateVars);
});

// new route handler for "/urls/:id"
app.get("/urls/:id", isLoggedIn, (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send(
      "<html><body>Error: 401: You do not have access this page</body></html>\n"
    );
  }
  const templateVars = {
    user: users[req.session["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id], //req.params is how to access the value // req.params.id is the shortURL
  };
  res.render("urls_show", templateVars);
});

// POST request to receive form submission
app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  };
  res.redirect("/urls");
});

// /urls redirection to /urls/:id.
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // created a new variable for shortURL
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// DELETE ROUTE
app.post("/urls/:id/delete", isLoggedIn, (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send(
      "<html><body>Error: 401: You do not have access this page</body></html>\n"
    );
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// EDIT ROUTE
app.post("/urls/:id", isLoggedIn, (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send(
      "<html><body>Error: 401: You do not have access this page</body></html>\n"
    );
  }
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

// POST request to /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Search for a user with an existing email
  const foundUser = getUserbyEmail(users, email);
  if (foundUser === null) {
    return res.status(401).send("Incorrect email or password");
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(401).send("Incorrect email or password");
  }

  req.session["user_id"] = foundUser.id;
  res.redirect("/urls");
});

// LOGOUT ROUTE to clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//GET /register endpoint
app.get("/register", isLoggedOut, (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: getUserbyId(users, userId),
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
  const foundUser = getUserbyEmail(users, email);
  // Check if the email is already taken
  if (foundUser) {
    res.status(400).send("Email already exists.");
    return;
  }
  // use bcrypt to hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Add the random ID and add it to the user
  newUser = {
    id: generateRandomString(),
    email,
    password: hashedPassword,
  };
  // Adding the user to the database (email, user, and id)
  users[newUser.id] = newUser;
  // Set cookie
  req.session["user_id"] = newUser.id;
  // Redirect to the /urls page
  res.redirect("/urls");
});

// GET /login endpoint
app.get("/login", isLoggedOut, (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: getUserbyId(users, userId),
  };
  res.render("login", templateVars);
});
