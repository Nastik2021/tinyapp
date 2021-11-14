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
  // console.log({urlDatabase});
  let url;
  for (let key in urlDatabase) {
    url = urlDatabase[key];
    // console.log({url, userID, urlUserID: url.userId});

    if (userID === url.userId || userID === url.userID) {
      // This is a quick fix for checking against userId/userID (only the seeded/initial users in the
      // users database have userID; All new users will have userId

      // console.log('yay we matched the userID');
      console.log('yay we matched the userID');
      userUrls[key] = url;
    }
  }

  // console.log({userUrls});
  return userUrls;
};




// Function that generates random alphanumeric string
const generateRandomString = function()  {
  const result = Math.random().toString(36).substr(2,6);
  return result;
};




module.exports = { emailLookup, urlsForUser, generateRandomString };