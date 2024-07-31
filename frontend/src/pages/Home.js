import * as React from "react";
import { useState } from "react";
import { Container, FormControl, OutlinedInput, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TopMenu from "../components/TopMenu";
import DataTable from "../components/DataTable";
import UploadDocument from "../components/UploadDocument";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000",
      contrastText: "#fff",
    },
  },
});

function Home() {
  const [prompt, setPrompt] = useState();

  const keyPress = (event) => {
    if (event.key === "Enter") {
      setPrompt(event.target.value);
    }
  };

  return (
    <>
      <TopMenu menu={[]} />
      <Container
        disableGutters
        maxWidth="md"
        component="main"
        sx={{ pt: 8, pb: 6 }}
      >
        <ThemeProvider theme={theme}>
          <UploadDocument />
          <FormControl fullWidth>
            <OutlinedInput
              id="outlined-adornment-amount"
              placeholder="Pesquisar conteúdo do documento"
              onKeyDown={(event) => {
                keyPress(event);
              }}
            />
          </FormControl>
          <Box mt={10}>
            <DataTable query={prompt} />
          </Box>
        </ThemeProvider>
      </Container>
    </>
  );
}

export default Home;
