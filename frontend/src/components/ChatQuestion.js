import { Box, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#616161",
  padding: theme.spacing(5),
  textAlign: "right",
  color: "#fff",
}));

function ChatQuestion({ question }) {
  return (
    <Box>
      <div style={{ textAlign: "right" }}>
        <PersonIcon color="primary" />
      </div>
      <Item>
        <Typography>{question}</Typography>
      </Item>
    </Box>
  );
}

export default ChatQuestion;
