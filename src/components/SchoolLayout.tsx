import * as React from "react";
import AppTheme from "../shared-theme/AppTheme";
import { Outlet, useNavigate, useLocation, useParams, useOutletContext } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Typography,
  CssBaseline,
  Divider,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";

const navItems = [
  { label: "Section 1", path: "section-1", icon: <FolderIcon /> },
  { label: "Section 2", path: "section-2", icon: <FolderIcon /> },
  { label: "Section 3", path: "section-3", icon: <FolderIcon /> },
  { label: "Section 4", path: "section-4", icon: <FolderIcon /> },
  { label: "Settings", path: "settings", icon: <SettingsIcon /> },
];

export interface SchoolContext {
  entityId: string;
}

export function useSchoolContext() {
  return useOutletContext<SchoolContext>();
}

export default function SchoolLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entityId } = useParams<{ entityId: string }>();
  const state = location.state as { schoolName?: string } | null;
  const schoolName = state?.schoolName || entityId || "School";

  return (
    <AppTheme>
      <Box sx={{ display: "flex", width: "100vw" }}>
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
              alignItems: "center",
              gap: 1,
              minHeight: 80,
              px: 3,
            }}
          >
            <IconButton
              onClick={() => navigate("/admin-portfolio")}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
              {schoolName}
            </Typography>
          </Toolbar>
          <Divider />

          <List>
            {navItems.map((item) => {
              const fullPath = `/school/${entityId}/${item.path}`;
              const isActive = location.pathname === fullPath;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => navigate(fullPath)}
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
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Box sx={{ minHeight: "40.5px" }} />
          <Outlet context={{ entityId: entityId ?? "" }} />
        </Box>
      </Box>
    </AppTheme>
  );
}
