import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Topology1 from './Iossif';
import CircleScheme1 from './KirilCircle/CircleScheme1';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', margin: 0, padding: 0 }}>
        <nav
          style={{
            width: '200px',
            background: '#222',
            color: '#fff',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
            margin: 0,
          }}
        >
          <Link
            to="/Topology-1"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Topology-1
          </Link>
          <Link
            to="/circle-scheme-1"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Circle Scheme 1
          </Link>
        </nav>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/Topology-1" element={<Topology1 />} />
            <Route path="/circle-scheme-1" element={<CircleScheme1 />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
