import * as React from "react";
import { Box, CssBaseline, GlobalStyles } from "@mui/material";
import AppRoutes from "./routes";
import searchContext from "./contexts/searchContext";
import sessionContext from "./contexts/sessionContext";
import { v4 as uuidv4 } from "uuid";

function App() {
  const session = uuidv4();
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
        <sessionContext.Provider value={{ session }}>
          <searchContext.Provider value={{ searchResults, setSearchResults }}>
            <AppRoutes />
          </searchContext.Provider>
        </sessionContext.Provider>
      </Box>
    </React.Fragment>
  );
}

export default App;
