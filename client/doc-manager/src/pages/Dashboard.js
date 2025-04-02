import { useAuth } from "../contexts/AuthContext";
import { Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";
import Sidebar from "../components/Sidebar";  // Import Sidebar

const Dashboard = () => {
  const { logout } = useAuth();
  
  const fetchProtectedData = async () => {
    try {
      const response = await axios.get("https://your-backend.com/api/protected");
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching protected data:", error);
    }
  };

  return (
    <Container>
      <Box display="flex">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom>Dashboard</Typography>
          <Button variant="contained" color="secondary" onClick={fetchProtectedData}>Fetch Data</Button>
          <Button variant="contained" color="error" onClick={logout} sx={{ ml: 2 }}>Logout</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
