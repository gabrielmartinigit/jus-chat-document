import { AppBar, Button, Toolbar, Link, Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import logo from "../assets/logo.png";

const theme = createTheme({
  palette: {
    primary: {
      main: "#212121",
      contrastText: "#fff",
    },
  },
});

function TopMenu({ menu }) {
  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="static"
        color="primary"
        elevation={2}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: "wrap" }}>
          <Box sx={{ flexGrow: 0.02 }}>
            <Link component={RouterLink} to="/">
              <img src={logo} alt="pje" width={80} />
            </Link>
          </Box>
          <Typography variant="h6">Chat Documents</Typography>
          {menu.map((item) => (
            <Link
              component={RouterLink}
              to={item.link}
              underline="none"
              color="inherit"
            >
              <Button variant="contained" color="primary" sx={{ m: 1 }}>
                {item.text}
              </Button>
            </Link>
          ))}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default TopMenu;
