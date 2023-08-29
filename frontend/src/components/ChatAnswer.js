import { Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#212121",
  padding: theme.spacing(5),
  textAlign: "left",
  color: "#fff",
}));

function ChatAnswer({ answer }) {
  return (
    <Box>
      <SmartToyIcon color="primary"></SmartToyIcon>
      <Item>
        <Typography>{answer}</Typography>
      </Item>
    </Box>
  );
}

export default ChatAnswer;
