import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Topology1 from "./Iossif";
import CircleScheme1 from "./KirilCircle/CircleScheme1";
import TreeExample from "./TreeExample";
import IntegratedView from "./IntegratedView";

function App() {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <nav
          style={{
            width: "200px",
            minWidth: "200px",
            background: "#222",
            color: "#fff",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
            margin: 0,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <Link
            to="/topology-1"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Topology-1
          </Link>
          <Link
            to="/circle-scheme-1"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Circle Scheme 1
          </Link>
          <Link
            to="/tree-example"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Tree Example
          </Link>
          <Link
            to="/integrated-view"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Integrated View
          </Link>
        </nav>
        <div style={{ flex: 1, overflow: "auto", height: "100vh" }}>
          <Routes>
            <Route
              path="/"
              element={
                <div style={{ padding: "2rem" }}>
                  Select a topology from the menu
                </div>
              }
            />
            <Route path="/topology-1" element={<Topology1 />} />
            <Route path="/circle-scheme-1" element={<CircleScheme1 />} />
            <Route path="/tree-example" element={<TreeExample />} />
            <Route path="/integrated-view" element={<IntegratedView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
