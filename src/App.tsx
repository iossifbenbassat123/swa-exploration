import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Topology1 from './views/Topology1/Topology1';
import CircleScheme1 from './views/KirilCircle/CircleScheme1';
import CircleScheme2 from './views/kiril-circle-2/CircleScheme2';
import PrimeReactTreeView from './views/PrimeReactTreeView/PrimeReactTreeView';
import CombinedView from './views/CombinedView/CombinedView';
import CombinedViewPrimeReact from './views/CombinedViewPrimeReact/CombinedViewPrimeReact';
import CombinedViewVisx from './views/CombinedViewVisx/CombinedViewVisx';
import CombinedViewPrimeReactSticky from './views/CominedSticky/CombinedViewPrimeReactSticky';

function App() {
  return (
    <Router>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <nav
          style={{
            width: '200px',
            minWidth: '200px',
            background: '#222',
            color: '#fff',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
            margin: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          <Link to="/topology-1" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
            Topology-1
          </Link>
          <Link
            to="/circle-scheme-1"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Circle Scheme 1
          </Link>
          <Link
            to="/circle-scheme-2"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Circle Scheme 2
          </Link>
          <Link
            to="/tree-example"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Tree Example
          </Link>
          <Link to="/combined" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
            Combined (Arborist)
          </Link>
          <Link
            to="/combined-primereact"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Combined (PrimeReact)
          </Link>
          <Link
            to="/combined-primereact-sticky"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Combined (PrimeReact Sticky)
          </Link>
          <Link
            to="/combined-visx"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}
          >
            Combined (Visx)
          </Link>
        </nav>
        <div style={{ flex: 1, overflow: 'auto', height: '100vh' }}>
          <Routes>
            <Route
              path="/"
              element={<div style={{ padding: '2rem' }}>Select a topology from the menu</div>}
            />
            <Route path="/topology-1" element={<Topology1 />} />
            <Route path="/circle-scheme-1" element={<CircleScheme1 />} />
            <Route path="/circle-scheme-2" element={<CircleScheme2 />} />
            <Route path="/tree-example" element={<PrimeReactTreeView />} />
            <Route path="/combined" element={<CombinedView />} />
            <Route path="/combined-primereact" element={<CombinedViewPrimeReact />} />
            <Route path="/combined-primereact-sticky" element={<CombinedViewPrimeReactSticky />} />
            <Route path="/combined-visx" element={<CombinedViewVisx />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
