import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress
} from "@mui/material";
import axiosInstance from "../config/axiosInstance";

const FileSearch = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const generateHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const hashBuffer = await crypto.subtle.digest(
            'SHA-256',
            new Uint8Array(buffer)
          );
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSearch = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSearchCount(searchCount + 1)

    try {
      const hash = await generateHash(file);
      const response = await axiosInstance.get("/api/file_versions/search_documents_by_hash", {
        params: { file_hash: hash }
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to search files');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (file) => {
    const fileVersions = results.filter(f => f.url === file.url);
    const hasMultipleVersions = fileVersions.length > 1;
    const isLatestVersion = file.version_number === Math.max(...fileVersions.map(f => f.version_number));
    console.log(fileVersions)
    const downloadUrl = hasMultipleVersions && !isLatestVersion 
      ? `${file.url}?revision=${file.version_number}`
      : file.url;
    navigate(downloadUrl, { state: { fileName: file.file_name } });
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="h5" gutterBottom>
          File Search
        </Typography>
        
        <Box display="flex" gap={2} sx={{ width: '100%', mt: 2, mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            sx={{ 
              flexGrow: 1,
              textAlign: 'left',
              justifyContent: 'flex-start',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {file ? file.name : 'Select File'}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              hidden
            />
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSearch}
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {results.length > 0 && (
          <Box mt={4} width="100%">
            <Typography variant="h6" gutterBottom>Search Results</Typography>
            <List sx={{
              maxHeight: 400,
              overflow: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              bgcolor: 'background.paper'
            }}>
              {results.map((file) => (
                <ListItem 
                  key={file.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText 
                    primary={file.file_name} 
                    secondary={
                      <>
                        {file.url}
                        <br />
                        Version: {file.version_number}
                      </>
                    } 
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => downloadFile(file)}
                    sx={{ ml: 2 }}
                  >
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {results.length === 0 && searchCount > 0 && !loading && !error && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No files found matching your search
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default FileSearch;
