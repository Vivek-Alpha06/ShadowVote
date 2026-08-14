import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateElection from './pages/CreateElection';
import ElectionDetails from './pages/ElectionDetails';
import Results from './pages/Results';
import ResultsOverview from './pages/ResultsOverview';
import History from './pages/History';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateElection />} />
          <Route path="/results" element={<ResultsOverview />} />
          <Route path="/history" element={<History />} />
          <Route path="/election/:id" element={<ElectionDetails />} />
          <Route path="/election/:id/results" element={<Results />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
