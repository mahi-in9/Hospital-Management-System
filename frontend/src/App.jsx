import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Login from "./pages/Login";
import RegisterHospital from "./pages/RegisterHospital";
import SignUp from "./pages/SignUp";
import Activate from "./pages/Activate";
import PatientsList from "./pages/PatientsList";
import PatientForm from "./pages/PatientForm";
import Dashboard from "./pages/Dashboard";
import HospitalsList from "./pages/HospitalsList";
import HospitalDetails from "./pages/HospitalDetails";
import Landing from "./pages/Landing";
import ImmersiveHospital from "./pages/ImmersiveHospital";
import Room from "./pages/Room";
import AdminModelUploader from "./pages/AdminModelUploader";
import { setUser } from "./redux/slices/authSlice";

// Dashboard is provided by pages/Dashboard.jsx

// Temporarily disable authentication guard so the app is usable during development.
// To re-enable auth, restore the original logic that redirects to /login when
// `state.auth.isAuthenticated` is false.
const ProtectedRoute = ({ children }) => {
  // eslint-disable-next-line no-console
  console.info('ProtectedRoute: authentication disabled for development — rendering protected route');
  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      try {
        dispatch(setUser(JSON.parse(user)));
      } catch (err) {
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-hospital" element={<RegisterHospital />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/hospitals" element={<HospitalsList />} />
        <Route path="/hospitals/:tenantId" element={<HospitalDetails />} />
        <Route path="/hospitals/:tenantId/immersive" element={<ImmersiveHospital />} />
        <Route path="/rooms/:roomId" element={<Room />} />
        <Route path="/admin/models-upload" element={<AdminModelUploader />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/new"
          element={
            <ProtectedRoute>
              <PatientForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id/edit"
          element={
            <ProtectedRoute>
              <PatientForm />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
