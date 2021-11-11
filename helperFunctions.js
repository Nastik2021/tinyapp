// Function to check if email is already registered (part of the Users database)
const emailLookup =  function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return email;
    }
  }
  return false;
};







module.exports = { emailLookup };