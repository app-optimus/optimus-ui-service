"use client";
import * as React from "react";
import { entity_column, entity_rows } from "../mocks/tableData";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import CustomTable from "../components/CustomTable";
import TablePagination from "@mui/material/TablePagination";
import TableContainer from "@mui/material/TableContainer"; // Import TableContainer
import Paper from "@mui/material/Paper"; // Import Paper for TableContainer
import { Link } from "react-router-dom"; // for navigation -- >

export default function AdminPortfolio(props: {
  disableCustomTheme?: boolean;
}) {
  // State for search term and selected search field
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchField, setSearchField] = React.useState<
    "schoolName" | "schoolCode"
  >("schoolName");

  // State for pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const renderCell = (column: { field: string }, value: any, row: any) => {
    if (column.field === "schoolName") {
      // Replace spaces with hyphens for a cleaner URL
      const schoolNameSlug = value.replace(/\s+/g, "-").toLowerCase();

      return (
        <Link
          to={`/school/${schoolNameSlug}`}
          style={{
            color: "#fff",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {value}
        </Link>
      );
    }
    return value; // Default rendering for other columns
  };

  // Handle rows per page change
  // const handleChangeRowsPerPage = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0); // Reset to first page when rows per page changes
  // };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      {/* ColorModeIconDropdown at top-right */}
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <ColorModeIconDropdown />
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          padding: 0,
          overflowX: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search bar with dropdown */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            paddingX: 0.2,
            paddingY: 2,
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "inherit" : "inherit",
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "inherit" : "inherit",
          }}
        >
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Search By</InputLabel>
            <Select
              value={searchField}
              onChange={(e) =>
                setSearchField(e.target.value as "schoolName" | "schoolCode")
              }
              label="Search By"
            >
              <MenuItem value="schoolName">School Name</MenuItem>
              <MenuItem value="schoolCode">School Code</MenuItem>
            </Select>
          </FormControl>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{ flex: 1, maxWidth: 500 }}
          />
        </Box>

        {/* Table with Pagination */}
        <Box
          sx={{
            flex: 1,
            width: "100%",
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          <TableContainer component={Paper}>
            <CustomTable
              columns={entity_column}
              rows={entity_rows}
              renderCell={renderCell}
            />
            <TablePagination
              component="div"
              count={entity_rows.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
              sx={{
                borderTop: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[700]
                    : theme.palette.grey[300],
                "& .MuiTablePagination-toolbar": {
                  padding: "8px 16px", // Consistent padding with table
                },
              }}
            />
          </TableContainer>
        </Box>
      </Box>
    </AppTheme>
  );
}
