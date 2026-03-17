import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ListaObras from "./pages/obras/ListaObras";
import NovaObra from "./pages/obras/NovaObra";
import DetalheObra from "./pages/obras/DetalheObra";
import LancarCusto from "./pages/custos/LancarCusto";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/obras" element={<ListaObras />} />
          <Route path="/obras/nova" element={<NovaObra />} />
          <Route path="/obras/:id" element={<DetalheObra />} />
          <Route path="/custos/novo" element={<LancarCusto />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
