import React from 'react';

import { useRoutes, BrowserRouter } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import ChatScreen from './components/ChatScreen';
import UserProfile from './components/UserProfile';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import TopicSelection from './pages/TopicSelection';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from "./context/AuthContext";
import { ErrorProvider } from './context/ErrorContext';

const AppRoutes = () => {
  let routes = useRoutes([
    { path: '/', element: <HomeScreen /> },
    { path: '/login', element: <LoginScreen /> },
    { path: "/practice", element: <ChatScreen chatType="practice" userLevel="A1" /> }, // Adjust userLevel if needed
    { path: "/profile", element: <UserProfile /> },
    { path: "/topic-selection", element: <TopicSelection /> },
    { path: "/register", element: <RegisterScreen /> },
    { path: "/chatscreen", element: <ChatScreen /> },
    { path: "/evaluation", element: <ChatScreen chatType="evaluation" userLevel="A1" /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password/:token", element: <ResetPassword /> }
  ]);

  return routes;
}

const App = () => {
  return (
    <ErrorProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorProvider>
  );
}

export default App;
