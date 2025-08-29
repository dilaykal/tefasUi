import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AllFunds from './components/AllFunds';
import FundSearch from './components/FundSearch';


const AppContent = () => {
    const location = useLocation();

    return (
        <div className="App p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-10 text-blue-800">Fon Takip Sistemi</h1>
            
            <nav className="mb-8 justify-center space-x-4">
                <Link
                    to="/"
                    className={`px-6 py-3 rounded-lg shadow-md text-lg font-medium  ${
                        location.pathname === '/' ? 'bg-blue-800 text-white' : 'bg-white text-blue-800 hover:bg-blue-100'
                    }`}
                >
                    Tüm Fonlar
                </Link>
                <Link
                    to="/search"
                    className={`px-6 py-3 rounded-lg shadow-md text-lg font-medium ${
                        location.pathname === '/search' ? 'bg-blue-800 text-white' : 'bg-white text-blue-800 hover:bg-blue-100'
                    }`}
                >
                    Fona Göre Ara
                </Link>
            </nav>

            <div className="bg-white p-6 rounded-lg shadow-xl max-w-[1600px] mx-auto">
                <Routes>
                    <Route path="/search" element={<FundSearch />} />
                    <Route path="/search/:fonKodu" element={<FundSearch />} />
                    <Route path="/" element={<AllFunds />} />
                </Routes>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;