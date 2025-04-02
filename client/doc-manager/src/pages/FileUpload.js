import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import { TextField, Button, Box, Container, List, ListItem, ListItemText, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../config/axiosInstance';
import { useAuth } from "../contexts/AuthContext";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [email, setEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const { user } = useAuth();
  const currentUserId = user?.user_id;

  const myFiles = files.filter(file => file.user === currentUserId);
  const sharedFiles = files.filter(file => file.user !== currentUserId);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axiosInstance.get("/api/file_versions/");
        setFiles(response.data);
      } catch (error) {
        console.error("Failed to fetch files", error);
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!file || !url) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("url", url);

    try {
      const response = await axiosInstance.post("/api/file_versions/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFiles((prevFiles) => [...prevFiles, response.data]);
      setErrorMessage('');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.detail || 'Invalid request format');
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    }
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="subtitle1" gutterBottom>
          Input the URL and select file to upload
        </Typography>
        <TextField
          fullWidth
          label="URL"
          variant="outlined"
          margin="normal"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setErrorMessage('');
          }}
        />
        <Box display="flex" gap={2} sx={{ width: '100%', mt: 1, mb: 1 }}>
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
            {file ? file.name : 'Choose File'}
            <input
              type="file"
              onChange={handleFileChange}
              hidden
            />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || !url}
          >
            Upload
          </Button>
        </Box>
        <Box>
        {errorMessage && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 2,
                bgcolor: '#ef9a9a',
                color: 'white',
                borderColor: '#ef5350',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              {errorMessage}
            </Alert>
          )}
        </Box>
        <Box mt={4} width="100%">
          <Typography variant="h6" gutterBottom>My Files</Typography>
          <List sx={{
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            bgcolor: 'background.paper',
            mb: 3
          }}>
            {myFiles.map((file) => (
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
                      Revision: {file.version_number}
                    </>
                  }
                />
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const fileVersions = files.filter(f => f.url === file.url);
                        const hasMultipleVersions = fileVersions.length > 1;
                        const isLatestVersion = file.version_number === Math.max(...fileVersions.map(f => f.version_number));
                        console.log(fileVersions)
                        const downloadUrl = hasMultipleVersions && !isLatestVersion 
                          ? `${file.url}?revision=${file.version_number}`
                          : file.url;
                        navigate(downloadUrl, { state: { fileName: file.file_name } });
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setCurrentFileId(file.id);
                        setShareDialogOpen(true);
                        setShareError('');
                      }}
                      color="secondary"
                    >
                      Share
                    </Button>
                  </Box>
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" gutterBottom>Shared with me</Typography>
          <List sx={{
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}>
            {sharedFiles.map((file) => (
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
                      Revision: {file.version_number}
                    </>
                  }
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const fileVersions = files.filter(f => f.url === file.url);
                    const hasMultipleVersions = fileVersions.length > 1;
                    const isLatestVersion = file.version_number === Math.max(...fileVersions.map(f => f.version_number));
                    const downloadUrl = hasMultipleVersions && !isLatestVersion 
                      ? `${file.url}?revision=${file.version_number}`
                      : file.url;
                    navigate(downloadUrl, { state: { fileName: file.file_name } });
                  }}
                  sx={{ ml: 2 }}
                >
                  Download
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>

        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
          <DialogTitle>Share File</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="User Email"
              type="email"
              fullWidth
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {shareError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {shareError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShareDialogOpen(false);
              setEmail('');
            }}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!email) {
                  setShareError('Please enter an email');
                  return;
                }

                setShareLoading(true);
                try {
                  await axiosInstance.post(`/api/file_versions/${currentFileId}/share_file/`, {
                    user_email: email
                  });
                  setShareDialogOpen(false);
                  setEmail('');
                } catch (err) {
                  setShareError(err.response?.data?.message || 'Failed to share file');
                } finally {
                  setShareLoading(false);
                }
              }}
              disabled={shareLoading}
            >
              {shareLoading ? <CircularProgress size={24} /> : 'Share'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default FileUpload;
