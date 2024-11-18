import React from 'react';
import { useRoutes, BrowserRouter } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import ChatScreen from './components/ChatScreen';
import UserProfile from './components/UserProfile';

const AppRoutes = () => {
  let routes = useRoutes([
    { path: '/', element: <HomeScreen /> },
    { path: "/practice", element: <ChatScreen chatType="practice" userLevel="A1" /> }, // Adjust userLevel if needed
    { path: "/profile", element: <UserProfile /> },
    { path: "/evaluation", element: <ChatScreen chatType="evaluation" userLevel="A1" /> }
  ]);

  return routes;
}

const App = () => {
  return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
  );
}

export default App;
