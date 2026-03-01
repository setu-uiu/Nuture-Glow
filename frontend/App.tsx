
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Layout />
            </Router>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
};

export default App;
