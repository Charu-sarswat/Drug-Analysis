import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Home from './components/Home';
import DrugAnalysis from './components/DrugAnalysis';
import UnknownDrugAnalysis from './components/UnknownDrugAnalysis';
import History from './components/History';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Container fluid className="mt-4 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<DrugAnalysis />} />
            <Route path="/unknown-analysis" element={<UnknownDrugAnalysis />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App; 