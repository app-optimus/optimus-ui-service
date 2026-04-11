import * as React from "react";
import AppTheme from "../shared-theme/AppTheme";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  CssBaseline,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { SitemarkIcon } from "./CustomIcons";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PeopleIcon from "@mui/icons-material/People";
const navItems = [
  {
    label: "Admin Portfolio",
    path: "/admin-portfolio",
    icon: <BusinessCenterIcon />,
  },
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Create Entity", path: "/create-entity", icon: <AddBoxIcon /> },
  {
    label: "Global Users",
    path: "/global-users",
    icon: <PeopleIcon />,
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppTheme>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: 280,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 280,
              boxSizing: "border-box",
              paddingTop: 2,
              backgroundColor: "inherit",
            },
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              minHeight: 80,
              px: 3,
            }}
          >
            <SitemarkIcon />
          </Toolbar>
          <Divider />

          {/* <Box sx={{ height: 16 }} /> */}
          <List>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      paddingY: 1.5,
                      paddingX: 3,
                      backgroundColor: isActive ? "#4876EF" : "#CCCCFF",
                      "&:hover": {
                        backgroundColor: "#4876EF",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: isActive ? "#1976d2" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                        fontSize: "1rem",
                        color: isActive ? "inherit" : "black",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Toolbar />
          <Box sx={{ flex: 1, width: "100%", overflow: "auto" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
