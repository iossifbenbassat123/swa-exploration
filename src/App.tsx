import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Iossif from "./Iossif";
import Kriil from "./Kriil";

function App() {
  return (
    <Router>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          padding: "1rem",
          background: "#222",
          color: "#fff",
          display: "flex",
          gap: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Link
          to="/iossif"
          style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
        >
          Iossif
        </Link>
        <Link
          to="/kriil"
          style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
        >
          Kriil
        </Link>
      </nav>
      <div style={{ paddingTop: "4.5rem" }}>
        <Routes>
          <Route path="/iossif" element={<Iossif />} />
          <Route path="/kriil" element={<Kriil />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
