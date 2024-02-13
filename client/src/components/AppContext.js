import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [name, setName] = useState(null);

  const loginUser = (userData) => {
    setUser(userData);
    setToken(userData.token); // Assuming the token is within the userData object
    setName(userData.name); // Assuming the name is within the userData object
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setName(null);
  };

  return (
    <AppContext.Provider value={{ user, token, name, loginUser, logoutUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
