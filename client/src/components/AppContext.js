import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [name, setName] = useState(null);
  const [loginState, setLoginState] = useState(false);
  const [fromStationSearch, setFromStationSearch] = useState(null);
  const [toStationSearch, setToStationSearch] = useState(null);
  const [dates, setDates] = useState(null);
  return (
    <AppContext.Provider value=
    {{
      userId,
      setUserId,
      token,
      setToken,
      name,
      setName,
      loginState,
      setLoginState,
      fromStationSearch,
      setFromStationSearch,
      toStationSearch,
      setToStationSearch,
      dates,
      setDates
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useData = () => useContext(AppContext);
