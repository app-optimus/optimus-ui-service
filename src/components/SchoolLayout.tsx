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
  Collapse,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import QuizIcon from "@mui/icons-material/Quiz";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface NavChild {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "section-1", icon: <FolderIcon /> },
  { label: "Quizzes", path: "quizzes", icon: <QuizIcon /> },
  { label: "Study Material", path: "study-material", icon: <MenuBookIcon /> },
  { label: "Users Metabase", path: "section-4", icon: <FolderIcon /> },
  {
    label: "Settings",
    path: "settings",
    icon: <SettingsIcon />,
    children: [
      { label: "Permissions", path: "settings/permissions", icon: <VerifiedUserIcon /> },
      { label: "Class Structure", path: "settings/class-structure", icon: <AccountTreeIcon /> },
      { label: "Question Templates", path: "settings/question-templates", icon: <QuizIcon /> },
    ],
  },
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

  const isSettingsRoute = location.pathname.includes("/settings");
  const [settingsOpen, setSettingsOpen] = React.useState(isSettingsRoute);

  React.useEffect(() => {
    if (isSettingsRoute) setSettingsOpen(true);
  }, [isSettingsRoute]);

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
              const hasChildren = !!item.children?.length;
              const childActive = item.children?.some(
                (child) => location.pathname === `/school/${entityId}/${child.path}`
              );
              const isActive =
                location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`) || !!childActive;

              return (
                <React.Fragment key={item.path}>
                  <ListItem disablePadding sx={{ mb: hasChildren && settingsOpen ? 0.5 : 1 }}>
                    <ListItemButton
                      onClick={() =>
                        hasChildren ? setSettingsOpen((prev) => !prev) : navigate(fullPath)
                      }
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
                      {hasChildren && (
                        <Box sx={{ display: "flex", color: isActive ? "inherit" : "black" }}>
                          {settingsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>

                  {hasChildren && (
                    <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                      <List disablePadding>
                        {item.children!.map((child) => {
                          const childFullPath = `/school/${entityId}/${child.path}`;
                          const isChildActive = location.pathname === childFullPath;
                          return (
                            <ListItem key={child.path} disablePadding sx={{ mb: 1 }}>
                              <ListItemButton
                                onClick={() => navigate(childFullPath)}
                                sx={{
                                  paddingY: 1,
                                  paddingX: 3,
                                  paddingLeft: 5,
                                  backgroundColor: isChildActive ? "#4876EF" : "#E4E4FF",
                                  "&:hover": {
                                    backgroundColor: "#4876EF",
                                  },
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    minWidth: 28,
                                    color: isChildActive ? "#1976d2" : "inherit",
                                  }}
                                >
                                  {child.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={child.label}
                                  primaryTypographyProps={{
                                    fontWeight: isChildActive ? 600 : 400,
                                    fontSize: "0.9rem",
                                    color: isChildActive ? "inherit" : "black",
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
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
