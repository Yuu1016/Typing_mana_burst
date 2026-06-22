import { BrowserRouter, Routes, Route } from "react-router-dom";
import Title from "./pages/Title";
import Home from "./pages/Home";
import Deck from "./pages/Deck";
import Battle from "./pages/Battle";
import Upgrade from "./pages/Upgrade";

function App() {
  return (
    <BrowserRouter>
      {/* 画面遷移のルール（URLとコンポーネントの紐付け） */}
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/home" element={<Home />} />
        <Route path="/deck" element={<Deck />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;