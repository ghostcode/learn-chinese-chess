import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LevelPage } from './pages/LevelPage'
import { OpeningDetail, OpeningsPage } from './pages/OpeningsPage'
import { TacticDetail, TacticsPage } from './pages/TacticsPage'
import { ReviewPage } from './pages/ReviewPage'
import { NotationPage } from './pages/NotationPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="basics" element={<LevelPage />} />
          <Route path="intermediate" element={<LevelPage />} />
          <Route path="advanced" element={<LevelPage />} />
          <Route path="openings" element={<OpeningsPage />} />
          <Route path="openings/:id" element={<OpeningDetail />} />
          <Route path="tactics" element={<TacticsPage />} />
          <Route path="tactics/:id" element={<TacticDetail />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="notation" element={<NotationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
