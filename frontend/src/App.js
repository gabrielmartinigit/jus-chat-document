import * as React from "react";
import { Box, CssBaseline, GlobalStyles } from "@mui/material";
import AppRoutes from "./routes";
import SearchContext from "./contexts/SearchContext";

function App() {
  const [searchResults, setSearchResults] = React.useState([]);

  return (
    <React.Fragment>
      <GlobalStyles
        styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
      />
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <SearchContext.Provider value={{ searchResults, setSearchResults }}>
          <AppRoutes />
        </SearchContext.Provider>
      </Box>
    </React.Fragment>
  );
}

export default App;
