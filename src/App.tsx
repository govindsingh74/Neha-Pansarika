import React from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Home />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;