import React, { useState } from "react";
import { Button, Input, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import api from "../services/api";
import axios from "axios";

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
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
                console.log("upload com sucesso");
              })
              .catch((error) => {
                console.log(error);
              });
          });

        setSelectedFile(null);
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
    </Box>
  );
};

export default UploadDocument;
