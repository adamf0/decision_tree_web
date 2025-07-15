import { Routes, Route } from 'react-router-dom';
import PredictionPage from './Page/PredictionPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PredictionPage />} />
    </Routes>
  );
}

export default App;
