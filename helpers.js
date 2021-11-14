// Function to check if email is already registered (part of the Users database)
const emailLookup =  function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return false;
};



const urlsForUser = (userID, urlDatabase) => {
  const userUrls = {};
  for (let key in urlDatabase) {
    const url = urlDatabase[key];

    if (userID === url.userID) {
      userUrls[key] = url;
    }
  }
  return userUrls;
};




// Function that generates random alphanumeric string
const generateRandomString = function()  {
  const result = Math.random().toString(36).substr(2,6);
  return result;
};




module.exports = { emailLookup, urlsForUser, generateRandomString };