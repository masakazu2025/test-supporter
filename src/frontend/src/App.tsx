import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import EvaluationPage from './pages/EvaluationPage'
import SettingsPage from './pages/SettingsPage'
import TerminalPage from './pages/TerminalPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/terminal" replace />} />
        <Route path="terminal" element={<TerminalPage />} />
        <Route path="evaluation" element={<EvaluationPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
