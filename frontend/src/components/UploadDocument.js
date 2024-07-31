import React, { useState } from "react";
import { Button, Input, Box, CircularProgress, Snackbar } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import api from "../services/api";
import axios from "axios";

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [openSnack, setOpenSnack] = useState(false);

  const allowedFileTypes = [
    ".pdf",
    ".txt",
    ".md",
    ".html",
    ".doc",
    ".docx",
    ".csv",
    ".xls",
    ".xlsx",
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fileExtension = file.name.split(".").pop();

    if (allowedFileTypes.includes(`.${fileExtension}`)) {
      setSelectedFile(file);
    } else {
      setMessage("Tipo de arquivo não permitido.");
      setOpenSnack(true);
      setSelectedFile(null);
    }
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
                  setMessage("Upload feito com sucesso.");
                  setOpenSnack(true);
                }, 10000); // 10000 milliseconds = 10 seconds
              })
              .catch((error) => {
                console.log(error);
                setMessage("Não foi possível fazer o upload do arquivo.");
                setOpenSnack(true);
              });
          });
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("Não foi possível fazer o upload do arquivo.");
        setOpenSnack(true);
      }
    }
  };

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Input
          type="file"
          accept={allowedFileTypes.join(",")}
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
            Selecionar arquivo
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedFile}
          onClick={handleUpload}
        >
          Enviar
        </Button>
        {selectedFile && <p>Arquivo selecionado: {selectedFile.name}</p>}
        {loading && <CircularProgress />}
      </Box>
      {message && (
        <Snackbar
          open={openSnack}
          autoHideDuration={6000}
          onClose={() => setOpenSnack(false)}
          message={message}
        />
      )}
    </>
  );
};

export default UploadDocument;
