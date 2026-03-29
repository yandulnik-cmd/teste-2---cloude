import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ListaObras from "./pages/obras/ListaObras";
import NovaObra from "./pages/obras/NovaObra";
import DetalheObra from "./pages/obras/DetalheObra";
import LancarCusto from "./pages/custos/LancarCusto";
import NovoFaturamento from "./pages/faturamentos/NovoFaturamento";
import Financeiro from "./pages/Financeiro";
import Bancos from "./pages/Bancos";
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
          <Route path="/faturamentos/novo" element={<NovoFaturamento />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/bancos" element={<Bancos />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
