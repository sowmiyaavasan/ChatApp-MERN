import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext(); //creating a context API which is used by useContext hook

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const history = useHistory();

  //if user is logged in, set the user
  useEffect(() => {
    const user = localStorage.getItem("userInfo"); //fetching user information from local storage
    const userInfo = JSON.parse(user); //parsing it because stringified version is recieved
    setUser(userInfo); //setting user

    //if user is not loggedin, redirect to the login page
    if (!userInfo) {
      history.push("/");
    }
  }, [history]); //everytime history changes, run this hook

  //children is our entire app and ChatProvider is a wrapper for entire app
  return (
    <ChatContext.Provider value={{ user, setUser }}>
      {children}
    </ChatContext.Provider>
  );
};

//exporting the hook through a variable ChatState to be accessible by all components
export const ChatState = () => {
  return useContext(ChatContext); //useContext hook takes the context instance
};

export default ChatProvider;
