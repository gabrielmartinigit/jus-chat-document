import * as React from "react";
import {
  TableRow,
  Modal,
  Typography,
  Box,
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
import SummarizeIcon from "@mui/icons-material/Summarize";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import api from "../services/api";
import SearchContext from "../contexts/SearchContext";
import Chat from "./Chat";

const columns = [
  { id: "name", label: "Name", minWidth: 100 },
  { id: "source", label: "Source", minWidth: 100 },
  // { id: "report", label: "Report", minWidth: 100 },
  { id: "chat", label: "Chat", minWidth: 100 },
];

function DataTable({ query }) {
  const { searchResults, setSearchResults } = React.useContext(SearchContext);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searchTable, setSearchTable] = React.useState();
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
          setSearchTable(true);
          let arr = response.data.results;
          let clean_array = arr.filter(
            (arr, index, self) =>
              index === self.findIndex((t) => t.source === arr.source)
          );
          clean_array.forEach((document) => {
            document["name"] = document["source"]
              .replace(".pdf", "")
              .split("/")[1];
            document["chat"] = document["source"];
          });
          setSearchResults(clean_array);
          setLoading(false);
        });
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

  const handleModalOpen = (summary) => {
    setModalContent(summary);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
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
          {searchTable && (
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
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={row.source}
                          >
                            {columns.map((column) => {
                              const value = row[column.id];
                              if (column.id === "source") {
                                return (
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                  >
                                    <Button
                                      onClick={() => {
                                        handleS3Link(value.split("/")[1]);
                                      }}
                                    >
                                      <PictureAsPdfIcon color="primary" />
                                    </Button>
                                  </TableCell>
                                );
                              } else if (column.id === "summary") {
                                return (
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                  >
                                    <Button
                                      onClick={() => {
                                        handleModalOpen(value);
                                      }}
                                    >
                                      <SummarizeIcon color="primary" />
                                    </Button>
                                  </TableCell>
                                );
                              } else if (column.id === "chat") {
                                return (
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                  >
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
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                  >
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
          )}
        </>
      )}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            overflow: "scroll",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Summary
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {modalContent}
          </Typography>
        </Box>
      </Modal>
      <Drawer anchor="right" open={chat} onClose={() => handleChat("", false)}>
        <Chat document={chatDocument} />
      </Drawer>
    </>
  );
}

export default DataTable;
