//helper function to find user by email
const getUserByEmail = (email, users) => {
  return Object.values(users).find(user => user.email === email);
};

module.exports = { getUserByEmail };