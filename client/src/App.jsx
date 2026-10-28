import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BlockchainProvider } from './context/BlockchainContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ToastContainer from './components/shared/ToastContainer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import Blocks from './pages/Blocks';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BlockchainProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/blocks" element={<Blocks />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </BlockchainProvider>
  );
}
