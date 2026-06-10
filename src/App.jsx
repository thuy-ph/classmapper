import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RosterScreen from './screens/RosterScreen';
import MapScreen from './screens/MapScreen';
import RulesScreen from './screens/RulesScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<RosterScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/rules" element={<RulesScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
