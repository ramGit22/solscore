import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HhiCalculator from './components/HhiCalculator';
import './App.css';

/**
 * Main App component
 */
const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HhiCalculator />
      </main>
      <Footer />
    </div>
  );
};

export default App;