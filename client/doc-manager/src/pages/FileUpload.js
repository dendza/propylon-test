import { useState, useEffect } from "react";
import { TextField, Button, Box, Container, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/file_versions/");
        setFiles(response.data);
      } catch (error) {
        console.error("Failed to fetch files", error);
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !url) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("url", url);

    try {
      const response = await axios.post("http://localhost:8000/api/file_versions/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFiles((prevFiles) => [...prevFiles, response.data]);
      alert("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
    }
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
        <TextField
          fullWidth
          label="URL"
          variant="outlined"
          margin="normal"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} />
        <Button variant="contained" color="primary" onClick={handleUpload} sx={{ mt: 2 }}>
          Upload
        </Button>
        <Box mt={4} width="100%">
          <h3>My Files</h3>
          <List>
            {files.map((file) => (
              <ListItem key={file.id} button onClick={() => navigate(file.url)}>
                <ListItemText primary={file.file_name} secondary={file.url} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Container>
  );
};

export default FileUpload;