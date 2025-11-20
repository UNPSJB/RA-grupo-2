import React, { useState, useEffect } from 'react';
import LoginCard from './LoginCard';
import AnimatedBird from './AnimatedBird';
import Background from './Background';
import './login.css';

const LoginPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchMedia.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    matchMedia.addEventListener('change', handleChange);

    return () => matchMedia.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`login-container d-flex justify-content-center align-items-center ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      
      <Background isDarkMode={isDarkMode} />

      <AnimatedBird />

      <div style={{ zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <LoginCard isDarkMode={isDarkMode} />
      </div>

    </div>
  );
};

export default LoginPage;