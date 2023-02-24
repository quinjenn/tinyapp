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

function getUserbyId(users, ID) {
  for (const userId in users) {
    if (users[userId].id === ID) {
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
  const userId = req.cookies["user_id"];
  if (userId && getUserbyId(userId)) {
    next();
  } else {
    res.redirect("/login");
  }
}

function isLoggedOut(req, res, next) {
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlsForUser(userId),
    user: getUserbyId(users, userId),
  };
  console.log("userID", userId);
  res.render("urls_index", templateVars);
});

// GET route, with the path /urls/new // if loggied in
app.get("/urls/new", isLoggedIn, (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: getUserbyId(users, userId),
  };
  res.render("urls_new", templateVars);
});

// new route handler for "/urls/:id"
app.get("/urls/:id", isLoggedIn, (req, res) => {
  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send(
      "<html><body>Error: 401: You do not have access this page</body></html>\n"
    );
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id], //req.params is how to access the value // req.params.id is the shortURL
  };
  res.render("urls_show", templateVars);
});

// POST request to receive form submission
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
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
  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
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
  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
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
  console.log("foundUser", foundUser);
  // Check if the email is not found
  //   if (!foundUser) {
  //     return res.status(403).send("Invalid email or password.");
  //   }
  //   // Check if the password is correct
  //   if (foundUser.password !== password) {
  //     return res.status(403).send("Invalid email or password.");
  //   }
  //   // Set cookie
  //   res.cookie("user_id", foundUser.id);
  //   // Redirect to /urls
  //   res.redirect("/urls");
  // });
  if (foundUser && foundUser.password === password) {
    // set cookie and redirect to /urls
    res.cookie("user_id", foundUser.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Incorrect email or password");
  }
});

// LOGOUT ROUTE to clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//GET /register endpoint
app.get("/register", isLoggedOut, (req, res) => {
  const userId = req.cookies["user_id"];
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
app.get("/login", isLoggedOut, (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: getUserbyId(users, userId),
  };
  res.render("login", templateVars);
});
