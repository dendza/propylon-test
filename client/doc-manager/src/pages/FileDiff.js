import { useState, useEffect } from "react";
import { Autocomplete, TextField, Button, Box, Container, Typography, } from "@mui/material";
import axiosInstance from '../config/axiosInstance';
import { html } from "diff2html";
import { createTwoFilesPatch } from "diff";
import "diff2html/bundles/css/diff2html.min.css";

const generateDiffHTML = (oldText, newText) => {
  const diffString = createTwoFilesPatch("Original", "Updated", oldText, newText);
  return html(diffString, { inputFormat: "diff", showFiles: false });
};

const FileDiffViewer = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [oldVersion, setOldVersion] = useState(null);
  const [newVersion, setNewVersion] = useState(null);
  const [diffHTML, setDiffHTML] = useState("");


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

  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.url]) {
      acc[file.url] = [];
    }
    acc[file.url].push(file);
    return acc;
  }, {});

  // Filter out files with only one revision
  const filesWithMultipleVersions = Object.keys(groupedFiles).filter(
    (url) => groupedFiles[url].length > 1
  );

  const handleFileSelect = (e, value) => {
    setSelectedFile(value);
    setOldVersion(null);
    setNewVersion(null);
  };

  const handleVersionSelect = async () => {
    if (!selectedFile || oldVersion === null || newVersion === null) return;

    try {
      const oldFileResponse = await axiosInstance.get(`/api/file_versions/get_file_by_url`, {
        params: { file_url: selectedFile + "?revision=" + oldVersion },
        responseType: 'text',
      });
      const newFileResponse = await axiosInstance.get(`/api/file_versions/get_file_by_url`, {
        params: { file_url: selectedFile + "?revision=" + newVersion },
        responseType: 'text',
      });

      const oldText = await oldFileResponse.data;
      const newText = await newFileResponse.data;

      setDiffHTML(generateDiffHTML(oldText, newText));
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  return (
    <Container>
      <Box mt={5}>
      <Typography variant="h5" gutterBottom>
          Select a file to compare versions (only txt files supported)
        </Typography>

        <Autocomplete
          options={filesWithMultipleVersions}
          getOptionLabel={(url) => groupedFiles[url][0].file_name}
          onChange={handleFileSelect}
          renderInput={(params) => <TextField {...params} label="Select File" variant="outlined" />}
          fullWidth
        />

        <Autocomplete
          options={files.filter((file) => file.url === selectedFile) || []}
          getOptionLabel={(option) => `Revision ${option.version_number}`}
          onChange={(_, value) => {setOldVersion(value ? value.version_number : null)}}
          renderInput={(params) => <TextField {...params} label="Select Old Version" variant="outlined" fullWidth margin="normal" disabled={!selectedFile} />}
        />

        <Autocomplete
          options={files.filter((file) => file.url === selectedFile) || []}
          getOptionLabel={(option) => `Revision ${option.version_number}`}
          onChange={(_, value) => setNewVersion(value ? value.version_number : null)}
          renderInput={(params) => <TextField {...params} label="Select New Version" variant="outlined" fullWidth margin="normal" disabled={!selectedFile} />}
        />

        <Button onClick={handleVersionSelect} variant="contained" color="primary" sx={{ mt: 2 }} disabled={oldVersion === null || newVersion === null}>
          Compare Versions
        </Button>

        <Box mt={4}>
          <div dangerouslySetInnerHTML={{ __html: diffHTML }} />
        </Box>
      </Box>
    </Container>
  );
};

export default FileDiffViewer;
