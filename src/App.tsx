import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import AddNodeOnEdgeDrop from "./Iossif";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0 }}>
        <nav
          style={{
            width: "200px",
            background: "#222",
            color: "#fff",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
            margin: 0,
          }}
        >
          <Link
            to="/AddNodeOnEdgeDrop"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            AddNodeOnEdgeDrop
          </Link>
        </nav>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Routes>
            <Route path="/AddNodeOnEdgeDrop" element={<AddNodeOnEdgeDrop />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
