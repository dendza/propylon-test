import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import axios from "axios";

const FileView = () => {
  const location = useLocation();
  const fileUrl = location.pathname; // Retain the leading slash
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/file_versions/get_file_by_url', {
          params: { file_url: fileUrl },
          responseType: 'blob',
        });

        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : 'downloaded_file';

        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(response.data);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        setError('Error downloading file');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileUrl]);

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 5 }}>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Box>
          <Typography variant="h6" gutterBottom>
            File is being downloaded...
          </Typography>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default FileView;