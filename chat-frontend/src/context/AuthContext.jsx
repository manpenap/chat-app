import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [userLevel, setUserLevel] = useState(localStorage.getItem("userLevel") || "A1");

  const login = (token, level) => {
    setAuthToken(token);
    setUserLevel(level); // Actualiza el nivel del usuario
    localStorage.setItem("authToken", token);
    localStorage.setItem("userLevel", level); // Guarda el nivel en localStorage
  };

  const logout = () => {
    setAuthToken(null);
    setUserLevel("A1"); // Restablece el nivel al valor predeterminado
    localStorage.removeItem("authToken");
    localStorage.removeItem("userLevel");
  };

  return (
    <AuthContext.Provider value={{ authToken, userLevel, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);