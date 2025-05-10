// Add MenuManagement route
import MenuManagement from './components/MenuManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* ... existing routes ... */}
        <Route path="/admin/menu" element={
          <ProtectedRoute>
            <MenuManagement />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}