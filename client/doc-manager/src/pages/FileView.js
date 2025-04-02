import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import axiosInstance from '../config/axiosInstance';

const FileView = () => {
  const location = useLocation();
  const fileUrl = location.pathname;
  const { fileName } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasDownloadedRef = useRef(false);

  useEffect(() => {
    const fetchFile = async () => {
      if (hasDownloadedRef.current) return;
      hasDownloadedRef.current = true;

      try {
        const response = await axiosInstance.get('/api/file_versions/get_file_by_url', {
          params: { file_url: fileUrl },
          responseType: 'blob',
        });

        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : fileName || 'downloaded_file';

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
  }, [fileUrl, fileName]);

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
