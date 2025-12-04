import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PresentationPage from './pages/PresentationPage';
import MinigamePage from './pages/MinigamePage';
import MemoryGalleryPage from './pages/MemoryGalleryPage';
import ChatPage from './pages/ChatPage';
import AdminCreateRoom from './pages/minigame/AdminCreateRoom';
import PlayerJoinRoom from './pages/minigame/PlayerJoinRoom';
import LobbyRoom from './pages/minigame/LobbyRoom';
import GameBoard from './pages/minigame/GameBoard';
import TestGameBoard from './pages/minigame/TestGameBoard';
import GameEnd from './pages/minigame/GameEnd';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/minigame" element={<MinigamePage />} />
        <Route path="/minigame/create" element={<AdminCreateRoom />} />
        <Route path="/minigame/join" element={<PlayerJoinRoom />} />
        <Route path="/minigame/lobby/:roomId" element={<LobbyRoom />} />
        <Route path="/minigame/game/:roomId" element={<GameBoard />} />
        <Route path="/minigame/end/:roomId" element={<GameEnd />} />
        <Route path="/minigame/test" element={<TestGameBoard />} />
        <Route path="/memory-gallery" element={<MemoryGalleryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
