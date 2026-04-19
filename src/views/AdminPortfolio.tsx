"use client";
import * as React from "react";
import axios from "axios";
import { entity_column } from "../mocks/tableData";
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
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8000/user/entity";

interface EntityRow {
  entity_id: string;
  schoolName: string;
  schoolCode: string;
}

export default function AdminPortfolio(props: {
  disableCustomTheme?: boolean;
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchField, setSearchField] = React.useState<
    "schoolName" | "schoolCode"
  >("schoolName");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [rows, setRows] = React.useState<EntityRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(API_BASE + "/");
        if (res.data.success) {
          const mapped = (res.data.data ?? []).map((e: any) => ({
            entity_id: e.entity_id,
            schoolName: e.name,
            schoolCode: e.code,
          }));
          setRows(mapped);
        } else {
          setError(res.data.message || "Failed to load entities");
        }
      } catch {
        setError("Failed to load entities");
      } finally {
        setLoading(false);
      }
    };
    fetchEntities();
  }, []);

  const filteredRows = React.useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) =>
      row[searchField]?.toLowerCase().includes(term)
    );
  }, [rows, searchTerm, searchField]);

  const paginatedRows = React.useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const renderCell = (column: { field: string }, value: any, row: any) => {
    if (column.field === "schoolName") {
      return (
        <Link
          to={`/school/${row.entity_id}`}
          state={{ schoolName: value }}
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
    return value;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <ColorModeIconDropdown />
      </Box>

      <Box
        sx={{
          padding: 0,
          overflowX: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            variant="outlined"
            sx={{ flex: 1, maxWidth: 500 }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 3, textAlign: "center" }}>
              {error}
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <CustomTable
                columns={entity_column}
                rows={paginatedRows}
                renderCell={renderCell}
              />
              <TablePagination
                component="div"
                count={filteredRows.length}
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
                    padding: "8px 16px",
                  },
                }}
              />
            </TableContainer>
          )}
        </Box>
      </Box>
    </AppTheme>
  );
}
