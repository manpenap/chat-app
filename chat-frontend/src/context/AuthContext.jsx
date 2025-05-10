import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [userLevel, setUserLevel] = useState("A1");

  const login = (token) => {
    setAuthToken(token);
    localStorage.setItem("authToken", token);
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ authToken, userLevel, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);