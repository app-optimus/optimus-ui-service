import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Define the shape of a column
export interface Column {
  field: string; // The key in the row data (e.g., "name", "calories")
  headerName: string; // The display name for the column header
  align?: "left" | "right" | "center"; // Optional alignment for the column
}

// Define the props for the table
interface CustomTableProps {
  columns: Column[];
  rows: { [key: string]: any }[];
  renderCell?: (column: Column, value: any, row: any) => React.ReactNode;
}

export default function CustomTable({
  columns,
  rows,
  renderCell,
}: CustomTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650, width: "100%" }} aria-label="generic table">
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={column.field}
                align={column.align || "left"} // Default to left if not specified
                sx={{ fontWeight: "bold" }} // Optional: Make headers bold
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={rowIndex} // Use rowIndex as key since row data might not have a unique id
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  component={column.field === columns[0].field ? "th" : "td"}
                  scope={column.field === columns[0].field ? "row" : undefined}
                  align={column.align || "left"}
                >
                  {renderCell
                    ? renderCell(column, row[column.field], row)
                    : row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
