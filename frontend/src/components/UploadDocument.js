import React, { useState } from "react";
import { Button, Input, Box, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import api from "../services/api";
import axios from "axios";

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      setLoading(true);
      try {
        api
          .post(
            "/upload",
            { filename: selectedFile.name },
            {
              headers: {
                "content-type": "application/json",
                accept: "application/json",
              },
            }
          )
          .then((response) => {
            let formData = new FormData();
            Object.keys(response.data.fields).forEach((key) => {
              formData.append(key, response.data.fields[key]);
            });
            formData.append("file", selectedFile);
            axios
              .post(response.data.url, formData)
              .then(() => {
                setSelectedFile(null);
                // Add a 10-second delay before setting loading to false
                setTimeout(() => {
                  setLoading(false);
                }, 10000); // 10000 milliseconds = 10 seconds
              })
              .catch((error) => {
                console.log(error);
              });
          });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <Box sx={{ mb: 5 }}>
      <Input
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="file-input"
      />
      <label htmlFor="file-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
        >
          Upload File
        </Button>
      </label>
      <Button
        variant="contained"
        color="primary"
        disabled={!selectedFile}
        onClick={handleUpload}
      >
        Upload
      </Button>
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      {loading && <CircularProgress />}
    </Box>
  );
};

export default UploadDocument;
