import { Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#212121",
  padding: theme.spacing(2),
  textAlign: "left",
  color: "#fff",
  wordWrap: "break-word",
  overflow: "hidden",
}));

function ChatAnswer({ answer }) {
  return (
    <Box sx={{ width: "100%" }}>
      <SmartToyIcon color="primary" />
      <Item>
        <Typography>{answer}</Typography>
      </Item>
    </Box>
  );
}

export default ChatAnswer;
