import React, { useState } from 'react';
import Login from '../components/Login';
import Header from '../components/Header';

const LoginPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthentication = (status) => {
    setIsAuthenticated(status);
  };

  return (
    <div>
        <center><Header /></center>
        <Login setAuth={handleAuthentication} />
    </div>
  );
}

<<<<<<< HEAD
export default LoginPage;
=======
export default LoginPage;
>>>>>>> 762fdb7d089df30373bdf56f9fc2bab557d09f81
