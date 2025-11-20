import React, { useMemo } from 'react';

interface BackgroundProps {
  isDarkMode: boolean;
}

const Background: React.FC<BackgroundProps> = ({ isDarkMode }) => {
  
  const stars = useMemo(() => {
    if (!isDarkMode) return null;
    const starArray = [];
    for (let i = 0; i < 50; i++) {
      const style = {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        animationDelay: `${Math.random() * 3}s`,
      };
      starArray.push(<div key={i} className="star" style={style} />);
    }
    return starArray;
  }, [isDarkMode]);

  const clouds = useMemo(() => {
    if (isDarkMode) return null;
    const cloudArray = [];
    for (let i = 0; i < 6; i++) {
      const style: React.CSSProperties = {
        top: `${Math.random() * 60}%`,
        width: `${100 + Math.random() * 200}px`,
        height: `${40 + Math.random() * 60}px`,
        animationDuration: `${30 + Math.random() * 40}s`,
        animationDelay: `-${Math.random() * 20}s`,
        opacity: 0.7 + Math.random() * 0.3
      };
      cloudArray.push(<div key={i} className="cloud" style={style} />);
    }
    return cloudArray;
  }, [isDarkMode]);

  return (
    <>
      {isDarkMode ? (
        <div className="stars-container">
          <div className="nebula" style={{ top: '20%', left: '30%', width: '300px', height: '300px', background: '#4b0082' }}></div>
          <div className="nebula" style={{ bottom: '10%', right: '20%', width: '400px', height: '400px', background: '#00008b' }}></div>
          {stars}
        </div>
      ) : (
        <div className="clouds-container">
          {clouds}
        </div>
      )}
    </>
  );
};

export default Background;