// import { GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { Column } from "../components/CustomTable"; // Adjust path as needed

// export const columns: GridColDef[] = [
//   {
//     field: "schoolName",
//     headerName: "School Name",
//     flex: 1.5,
//     minWidth: 200,
//   },
//   {
//     field: "schoolCode",
//     headerName: "School Code",
//     flex: 1.5,
//     minWidth: 200,
//   },
// ];

// export const rows: GridRowsProp = [
//   {
//     id: 1,
//     schoolName: "Premium Wireless Headphones",
//     schoolCode: "KV4",
//   },
//   {
//     id: 2,
//     schoolName: "Smart Fitness Watch",
//     schoolCode: "DPS",
//   },
// ];

export const entity_column: Column[] = [
  { field: "schoolName", headerName: "School Name", align: "left" },
  { field: "schoolCode", headerName: "School Code", align: "left" },
];

export const entity_rows = [
  { schoolName: "Kendriya Vidyalaya", schoolCode: "KV04" },
  { schoolName: "Delhi Public School", schoolCode: "DPS" },
];

export const global_users_column: Column[] = [
  { field: "userName", headerName: "User Name", align: "left" },
  { field: "optiCode", headerName: "Opti Code", align: "left" },
  { field: "userEmail", headerName: "User Email", align: "left" },
];

export const global_users_rows = [
  {
    userName: "Chirag Kumawat",
    optiCode: "OPTI-001",
    userEmail: "chiragk1511@gmail.com",
  },
  { userName: "Chiggs", optiCode: "OPTI-002", userEmail: "chiggs@gmail.com" },
  { userName: "Manas", optiCode: "OPTI-003", userEmail: "mkum@gmail.com" },
];
