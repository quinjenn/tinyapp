const { assert } = require("chai");

const { getUserbyEmail } = require("../helpers.js");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserbyEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });
  it("should return undefined with invalid email", function () {
    const user = getUserbyEmail(testUsers, "user3@example.com");
    const expectedUserID = undefined;
    // Write your assert statement here
    // console.log("user:", user)
    assert.equal(user, expectedUserID);
  });
});
