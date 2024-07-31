import * as React from "react";
import {
  TableRow,
  TablePagination,
  TableHead,
  TableContainer,
  TableCell,
  Paper,
  Table,
  Button,
  TableBody,
  CircularProgress,
  Drawer,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import api from "../services/api";
import SearchContext from "../contexts/SearchContext";
import Chat from "./Chat";

const columns = [
  { id: "name", label: "Nome", minWidth: 100 },
  { id: "source", label: "Arquivo", minWidth: 100 },
  { id: "chunk", label: "Conteúdo", minWidth: 100 },
  { id: "score", label: "Similaridade", minWidth: 100 },
  { id: "chat", label: "Chat", minWidth: 100 },
];

function DataTable({ query }) {
  const { searchResults, setSearchResults } = React.useContext(SearchContext);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(false);
  const [chat, setChat] = React.useState(false);
  const [chatDocument, setChatDocument] = React.useState("");

  React.useEffect(() => {
    if (query !== undefined && query !== "") {
      setLoading(true);
      api
        .get("search", {
          params: {
            q: query,
          },
        })
        .then((response) => {
          let arr = response.data.results;
          let documents = [];
          arr.forEach((document) => {
            document["name"] = document["source"]["uri"].split("/")[3];
            document["chat"] = document["source"]["uri"];
            document["source"] = document["source"]["uri"];
            document["score"] = (document["score"] * 100).toFixed(2) + "%";
            document["chunk"] = document["content"].slice(0, 100) + "...";
            documents.push(document);
          });
          setSearchResults(documents);
          setLoading(false);
        });
    } else {
      setSearchResults([]);
    }
  }, [query, setSearchResults, setLoading]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleS3Link = (document) => {
    api.get("download", { params: { key: document } }).then((response) => {
      window.open(response.data["url"]);
    });
  };

  const handleChat = (document, open) => {
    setChat(open);
    setChatDocument(document);
  };

  return (
    <>
      {loading && <CircularProgress />}
      {!loading && (
        <>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={Math.random()}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            if (column.id === "source") {
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  <Button
                                    onClick={() => {
                                      handleS3Link(value.split("/")[3]);
                                    }}
                                  >
                                    <PictureAsPdfIcon color="primary" />
                                  </Button>
                                </TableCell>
                              );
                            } else if (column.id === "chat") {
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  <Button
                                    onClick={() => {
                                      handleChat(row["source"], true);
                                    }}
                                  >
                                    <SmartToyIcon color="primary" />
                                  </Button>
                                </TableCell>
                              );
                            } else {
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {value}
                                </TableCell>
                              );
                            }
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={searchResults.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}
      <Drawer anchor="right" open={chat} onClose={() => handleChat("", false)}>
        <Chat document={chatDocument} />
      </Drawer>
    </>
  );
}

export default DataTable;
