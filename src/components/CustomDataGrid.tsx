import * as React from "react";
import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

export default function CustomizedDataGrid(props: DataGridProps) {
  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto", // horizontal scroll container
        position: "relative", // Ensure the table respects the parent's layout
        zIndex: 1, // Ensure the table is below the navbar (which has zIndex: 10)
      }}
    >
      <Box
        sx={{
          minWidth: 1000, // minimum width for DataGrid
          height: { xs: 400, md: 600 },
          border: "1px solid",
          borderColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.grey[700]
              : theme.palette.grey[300],
          borderRadius: 1,
        }}
      >
        <DataGrid
          {...props}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            ...props.sx,
            border: "none",
            "& .MuiDataGrid-cell": {
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.grey[700]
                  : theme.palette.grey[200],
            },
          }}
          disableColumnResize
        />
      </Box>
    </Box>
  );
}
