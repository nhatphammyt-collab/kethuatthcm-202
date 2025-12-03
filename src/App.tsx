import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PresentationPage from './pages/PresentationPage';
import MinigamePage from './pages/MinigamePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/minigame" element={<MinigamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
