import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import KitchenPage from "./pages/KitchenPage";
import DisplayPage from "./pages/DisplayPage";
import SalesPage from "./pages/SalesPage";
import PasswordGate from "./components/PasswordGate";
import POSPage from "./pages/POSPage";

function App() {
  return (
    <BrowserRouter>
      {/* 開発時の画面切り替えを楽にするための簡易ナビゲーションバー */}
      <nav
        style={{
          display: "flex",
          gap: "0px 20px",
          flexWrap: "wrap",
          alignContent: "flex-start",
        }}
      >
        <span>POSシステム開発用ナビ:</span>

        <Link to="/pos">レジ (/pos)</Link>
        <Link to="/kitchen">キッチン (/kitchen)</Link>
        <Link to="/display">ディスプレイ (/display)</Link>
        <Link to="/sales">売上 (/sales)パスワード0000</Link>
      </nav>

      {/* ルーティング設定 */}
      <Routes>
        <Route path="/pos" element={<POSPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route
          path="/sales"
          element={
            <PasswordGate>
              <SalesPage />
            </PasswordGate>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
