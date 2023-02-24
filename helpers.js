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

module.exports = { generateRandomString, getUserbyEmail, getUserbyId };
