import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import FileUpload from "./pages/FileUpload";
import FileFetch from "./pages/FileFetch";
import FileSearch from "./pages/FileSearch";
import Layout from "./components/Layout";
import FileView from "./pages/FileView";


const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Layout>{children}</Layout> : <Navigate to="/" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/file-upload" element={<PrivateRoute><FileUpload /></PrivateRoute>} />
          <Route path="/file-fetch" element={<PrivateRoute><FileFetch /></PrivateRoute>} />
          <Route path="/file-search" element={<PrivateRoute><FileSearch /></PrivateRoute>} />
          <Route path="/:fileUrl" element={<PrivateRoute><FileView /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
