import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PackageDetailPage from './pages/PackageDetailPage';
import BlastRadiusPage from './pages/BlastRadiusPage';
import ComparePage from './pages/ComparePage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/package/:name" element={<PackageDetailPage />} />
          <Route path="/blast-radius" element={<BlastRadiusPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
