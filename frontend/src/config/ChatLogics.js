//a function that returns the user name for a 1:1 chat that's not the logged in user ie, the reciever
//to be displayed as name for the chat
export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};
