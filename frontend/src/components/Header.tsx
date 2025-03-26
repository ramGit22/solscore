import React from 'react';

/**
 * Header component with logo and navigation
 */
const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-charcoal bg-opacity-80 backdrop-blur-md z-10 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-neon-cyan">HHI</span> Insights
          </h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a 
                href="/" 
                className="text-white hover:text-neon-cyan transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="/about" 
                className="text-white hover:text-neon-cyan transition-colors"
              >
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;