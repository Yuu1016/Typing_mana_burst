import { BrowserRouter, Routes, Route } from "react-router-dom";
import Title from "./pages/Title";
import Home from "./pages/Home";
import Deck from "./pages/Deck";
import Battle from "./pages/Battle";
import Result from './pages/Result';
import Upgrade from "./pages/Upgrade";
import StageSelect from './pages/StageSelect';

function App() {
  return (
    <BrowserRouter>
      {/* 画面遷移のルール（URLとコンポーネントの紐付け） */}
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/home" element={<Home />} />
        <Route path="/deck" element={<Deck />} />
        <Route path="/battle/:stageId" element={<Battle />} />
        <Route path="/result" element={<Result />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/stage-select" element={<StageSelect />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;