import React from 'react';
import './login.css'; 

const AnimatedBird: React.FC = () => {
  return (
    <div 
      className="bird-container" 
      style={{ width: '140px', height: '110px' }} 
    >
      <div className="bird-wrapper w-100 h-100">
        
        <div className="bird-body w-100 h-100">
          <svg
            viewBox="0 0 500 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-100 h-100" 
            style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
          >
            <path
              d="M220 220 C 180 150, 100 120, 20 130 C 80 160, 120 190, 160 230 Z"
              fill="#9CA3AF"
              stroke="#4B5563"
              strokeWidth="3"
              className="wing-back"
            />
            
            <path
              d="M160 230 C 180 250, 210 240, 220 220"
              fill="#9CA3AF"
              stroke="#4B5563"
              strokeWidth="3"
            />

            <g className="body-static">
              <path d="M100 260 L 40 265 L 110 275 Z" fill="#E5E7EB" stroke="#374151" strokeWidth="3"/>
              <ellipse cx="200" cy="285" rx="15" ry="8" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
              <path
                d="M40 265 C 40 265, 100 220, 220 230 C 300 235, 320 200, 380 240 C 400 255, 380 280, 350 290 C 280 310, 150 310, 40 265 Z"
                fill="#F9FAFB" stroke="#374151" strokeWidth="3"
              />
              <path d="M380 255 Q 420 260 440 275 Q 420 280 375 275" fill="#F97316" stroke="#78350F" strokeWidth="2"/>
              <circle cx="365" cy="255" r="5" fill="#1F2937" />
              <circle cx="367" cy="253" r="1.5" fill="white" />
            </g>

            <g className="wing-front">
               <path d="M250 240 C 280 150, 350 80, 450 60 C 420 120, 400 180, 350 260" fill="#F3F4F6" stroke="#374151" strokeWidth="3"/>
               <path d="M450 60 C 460 70, 440 100, 420 130 L 415 120 Z" fill="#374151"/>
               <path d="M450 60 C 430 50, 410 55, 400 70" fill="#374151"/> 
            </g>

          </svg>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBird;