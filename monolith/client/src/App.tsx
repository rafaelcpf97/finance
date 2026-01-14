import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterUser from './pages/RegisterUser';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Digital Wallet</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="/dashboard/:userId" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
