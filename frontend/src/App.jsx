import { BrowserRouter, Routes, Route} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import Preferences from "./pages/preferences";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
            <ProtectedRoute> 
              <Dashboard /> 
            </ProtectedRoute>
          }
        /> {/* Protect the dashboard route */}

        <Route
          path="/preferences" element={
            <ProtectedRoute>
              <Preferences />
            </ProtectedRoute>
          }
        /> {/* Protect the preferences route */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;