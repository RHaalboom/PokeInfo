import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import "./styles/navigation.css";

function App() {
    return (
        <>
            <nav className="main-nav">
                <Link to="/">Home</Link>
                <Link to="/register">Register</Link>
            </nav>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </>
    );
}

export default App;