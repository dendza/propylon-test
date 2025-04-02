import { List, ListItem, ListItemText, Drawer, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh"
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <List>
        <ListItem button component={Link} to="/file-upload">
          <ListItemText primary="My files" />
        </ListItem>
        <ListItem button component={Link} to="/file-search">
          <ListItemText primary="File Search" />
        </ListItem>
      </List>
      <Box p={2}>
        <Button fullWidth variant="contained" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
