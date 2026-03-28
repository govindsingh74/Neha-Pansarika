import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ContactUs } from './pages/support/ContactUs';
import { TrackOrder } from './pages/support/TrackOrder';
import { ShippingDetails } from './pages/support/ShippingDetails';
import { CancelReturn } from './pages/support/CancelReturn';
import { RefundTracking } from './pages/support/RefundTracking';
import { RaiseTicket } from './pages/support/RaiseTicket';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Auth Routes - No Header/Footer */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          
          {/* Support Routes - No Header/Footer */}
          <Route path="/support/contact" element={<ContactUs />} />
          <Route path="/support/track-order" element={<TrackOrder />} />
          <Route path="/support/shipping" element={<ShippingDetails />} />
          <Route path="/support/cancel-return" element={<CancelReturn />} />
          <Route path="/support/refund-tracking" element={<RefundTracking />} />
          <Route path="/support/raise-ticket" element={<RaiseTicket />} />
          
          {/* Main App Routes - With Header/Footer */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-white">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;