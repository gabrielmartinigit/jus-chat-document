import {
  Box,
  Stack,
  FormControl,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
import api from "../services/api";
import { useEffect, useState } from "react";
import ChatAnswer from "./ChatAnswer";
import ChatQuestion from "./ChatQuestion";

function Chat({ document }) {
  const [question, setQuestion] = useState();
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const keyPress = (event) => {
    if (event.key === "Enter") {
      setQuestion(event.target.value);
      event.target.value = "";
    }
  };

  useEffect(() => {
    if (question !== undefined) {
      setLoading(true);
      api
        .get("chat", {
          params: {
            key: document.split("/")[1],
            question: question,
            s3uri: document,
          },
        })
        .then((response) => {
          setChatHistory((chatHistory) => [
            ...chatHistory,
            { question: question, answer: response.data.answer },
          ]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setChatHistory((chatHistory) => [
            ...chatHistory,
            { question: question, answer: "Sorry, I can't answer that" },
          ]);
          setLoading(false);
        });
    }
  }, [document, question, setChatHistory, setLoading]);

  return (
    <Box sx={{ width: 720, p: 4, height: "100%" }} role="presentation">
      <Box sx={{ overflow: "scroll", height: "95%", p: 1 }}>
        <Stack spacing={2}>
          <ChatAnswer
            answer={
              "Olá! Sou o assistente processual de Inteligência Artifical. Posso te ajudar a extrair informações do documento '" +
              document.split("/")[3] +
              "'. Qual a sua pergunta?"
            }
          />
          {chatHistory.map((chat, index) => {
            return (
              <div key={index}>
                <Stack spacing={2}>
                  <ChatQuestion question={chat.question} />
                  {chat.answer && <ChatAnswer answer={chat.answer} />}
                </Stack>
              </div>
            );
          })}
          {loading && <CircularProgress />}
        </Stack>
      </Box>
      <FormControl fullWidth>
        <OutlinedInput
          id="outlined-adornment-amount"
          placeholder="Faça uma pergunta"
          onKeyDown={(event) => {
            keyPress(event);
          }}
        />
      </FormControl>
    </Box>
  );
}

export default Chat;
