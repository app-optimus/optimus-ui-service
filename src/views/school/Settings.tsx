import * as React from "react";
import axios from "axios";
import { useSchoolContext } from "../../components/SchoolLayout";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

const API_BASE = "http://localhost:8000/user/class-structure";

interface SectionData {
  section_id: string;
  section_name: string;
  display_order: number;
}

interface ClassData {
  class_id: string;
  class_name: string;
  display_order: number;
  sections: SectionData[];
}

interface PermissionValue {
  read: number;
  write: number;
}

interface PermissionRow {
  name: string;
  permissions: { [key: string]: PermissionValue };
}

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  if (value !== index) return null;
  return <Box sx={{ flex: 1, overflow: "auto" }}>{children}</Box>;
}

function formatLabel(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const initialPermissionsRows: PermissionRow[] = [
  {
    name: "Permission 1",
    permissions: {
      entity_management: { read: 1, write: 0 },
      user_management: { read: 1, write: 1 },
      permission_management: { read: 1, write: 0 },
    },
  },
  {
    name: "Permission 2",
    permissions: {
      entity_management: { read: 1, write: 1 },
      user_management: { read: 0, write: 0 },
      permission_management: { read: 1, write: 1 },
    },
  },
  {
    name: "Permission 3",
    permissions: {
      entity_management: { read: 0, write: 0 },
      user_management: { read: 1, write: 0 },
      permission_management: { read: 0, write: 0 },
    },
  },
  {
    name: "Permission 4",
    permissions: {
      entity_management: { read: 1, write: 1 },
      user_management: { read: 1, write: 1 },
      permission_management: { read: 1, write: 1 },
    },
  },
  {
    name: "Permission 5",
    permissions: {
      entity_management: { read: 1, write: 0 },
      user_management: { read: 0, write: 0 },
      permission_management: { read: 1, write: 0 },
    },
  },
  {
    name: "Permission 6",
    permissions: {
      entity_management: { read: 0, write: 0 },
      user_management: { read: 1, write: 1 },
      permission_management: { read: 0, write: 0 },
    },
  },
];

export default function Settings() {
  const { entityId } = useSchoolContext();

  const [activeTab, setActiveTab] = React.useState(0);
  const [permissionsRows, setPermissionsRows] =
    React.useState(initialPermissionsRows);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<{
    [key: string]: PermissionValue;
  } | null>(null);

  const [classStructure, setClassStructure] = React.useState<ClassData[]>([]);
  const [classLoading, setClassLoading] = React.useState(false);
  const [classError, setClassError] = React.useState("");

  const [addClassOpen, setAddClassOpen] = React.useState(false);
  const [newClassName, setNewClassName] = React.useState("");
  const [classNameError, setClassNameError] = React.useState("");
  const [addSectionTarget, setAddSectionTarget] = React.useState<ClassData | null>(null);
  const [newSectionName, setNewSectionName] = React.useState("");
  const [sectionNameError, setSectionNameError] = React.useState("");
  const [renameError, setRenameError] = React.useState("");

  const [renameTarget, setRenameTarget] = React.useState<{
    classItem: ClassData;
    sectionItem?: SectionData;
  } | null>(null);
  const [renameValue, setRenameValue] = React.useState("");


  const fetchClassStructure = React.useCallback(async () => {
    if (!entityId) return;
    setClassLoading(true);
    setClassError("");
    try {
      const res = await axios.get(`${API_BASE}/?entity_id=${entityId}`);
      if (res.data.success) {
        setClassStructure(res.data.data ?? []);
      } else {
        setClassError(res.data.message || "Failed to load class structure");
      }
    } catch {
      setClassError("Failed to load class structure");
    } finally {
      setClassLoading(false);
    }
  }, [entityId]);

  React.useEffect(() => {
    fetchClassStructure();
  }, [fetchClassStructure]);

  const handleAddClass = async () => {
    const trimmed = newClassName.trim();
    if (!trimmed) return;
    try {
      const res = await axios.post(API_BASE + "/", {
        entity_id: entityId,
        class_name: trimmed,
      });
      if (res.data.success) {
        setNewClassName("");
        setClassNameError("");
        setAddClassOpen(false);
        await fetchClassStructure();
      } else {
        setClassNameError(res.data.message || "Failed to add class");
      }
    } catch {
      setClassNameError("Failed to add class");
    }
  };

  const handleDeleteClass = async (cls: ClassData) => {
    try {
      const res = await axios.delete(API_BASE + "/", {
        data: { entity_id: entityId, class_ids: [cls.class_id] },
      });
      if (res.data.success) {
        await fetchClassStructure();
      }
    } catch {
      setClassError("Failed to delete class");
    }
  };

  const handleAddSection = async () => {
    const trimmed = newSectionName.trim();
    if (addSectionTarget === null || !trimmed) return;
    try {
      const res = await axios.post(API_BASE + "/section", {
        entity_id: entityId,
        class_id: addSectionTarget.class_id,
        sections: [{ section_name: trimmed }],
      });
      if (res.data.success) {
        setNewSectionName("");
        setSectionNameError("");
        setAddSectionTarget(null);
        await fetchClassStructure();
      } else {
        setSectionNameError(res.data.message || "Failed to add section");
      }
    } catch {
      setSectionNameError("Failed to add section");
    }
  };

  const handleDeleteSection = async (cls: ClassData, section: SectionData) => {
    try {
      const res = await axios.delete(API_BASE + "/section", {
        data: {
          entity_id: entityId,
          class_id: cls.class_id,
          section_ids: [section.section_id],
        },
      });
      if (res.data.success) {
        await fetchClassStructure();
      }
    } catch {
      setClassError("Failed to delete section");
    }
  };

  const openRename = (classItem: ClassData, sectionItem?: SectionData) => {
    const current = sectionItem ? sectionItem.section_name : classItem.class_name;
    setRenameValue(current);
    setRenameTarget({ classItem, sectionItem });
  };

  const handleRename = async () => {
    const trimmed = renameValue.trim();
    if (!renameTarget || !trimmed) return;
    const { classItem, sectionItem } = renameTarget;

    try {
      let res;
      if (sectionItem) {
        res = await axios.patch(API_BASE + "/section", {
          entity_id: entityId,
          class_id: classItem.class_id,
          section_id: sectionItem.section_id,
          section_name: trimmed,
        });
      } else {
        res = await axios.patch(API_BASE + "/", {
          entity_id: entityId,
          class_id: classItem.class_id,
          class_name: trimmed,
        });
      }
      if (res.data.success) {
        setRenameTarget(null);
        setRenameValue("");
        setRenameError("");
        await fetchClassStructure();
      } else {
        setRenameError(res.data.message || "Failed to rename");
      }
    } catch {
      setRenameError("Failed to rename");
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setDraft(
      JSON.parse(JSON.stringify(permissionsRows[index].permissions))
    );
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setDraft(null);
  };

  const handleSave = (index: number) => {
    if (!draft) return;
    setPermissionsRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, permissions: draft } : row
      )
    );
    setEditingIndex(null);
    setDraft(null);
  };

  const handleToggle = (key: string, field: "read" | "write") => {
    if (!draft) return;
    setDraft((prev) =>
      prev
        ? { ...prev, [key]: { ...prev[key], [field]: prev[key][field] ? 0 : 1 } }
        : prev
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Permissions" />
        <Tab label="Class Structure" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ p: 3, overflowY: "auto" }}>
          {permissionsRows.map((row, index) => {
            const isEditing = editingIndex === index;
            const perms = isEditing && draft ? draft : row.permissions;

            return (
              <Accordion key={index} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>{row.name}</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  {Object.keys(perms).map((key, i) => (
                    <React.Fragment key={key}>
                      {i > 0 && <Divider sx={{ my: 1 }} />}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" sx={{ minWidth: 180 }}>
                          {formatLabel(key)}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={perms[key].read === 1}
                                disabled={!isEditing}
                                onChange={() => handleToggle(key, "read")}
                                size="small"
                              />
                            }
                            label="Read"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={perms[key].write === 1}
                                disabled={!isEditing}
                                onChange={() => handleToggle(key, "write")}
                                size="small"
                              />
                            }
                            label="Write"
                          />
                        </Box>
                      </Box>
                    </React.Fragment>
                  ))}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 2,
                      gap: 1,
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Button size="small" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSave(index)}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(index);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ p: 3, overflowY: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Class Structure</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddClassOpen(true)}
            >
              Add Class
            </Button>
          </Box>

          {classError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setClassError("")}>
              {classError}
            </Alert>
          )}

          {classLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : classStructure.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No classes added yet. Click "Add Class" to get started.
            </Typography>
          ) : (
            <SimpleTreeView>
              {classStructure.map((cls) => (
                <TreeItem
                  key={cls.class_id}
                  itemId={cls.class_id}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 0.5,
                      }}
                    >
                      <Typography fontWeight={500}>{cls.class_name}</Typography>
                      <Box>
                        <IconButton
                          size="small"
                          title="Rename class"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRename(cls);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Add section"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddSectionTarget(cls);
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Delete class"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                >
                  {cls.sections.map((section) => (
                    <TreeItem
                      key={section.section_id}
                      itemId={section.section_id}
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 0.5,
                          }}
                        >
                          <Typography variant="body2">
                            {section.section_name}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              title="Rename section"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRename(cls, section);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Delete section"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(cls, section);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                    />
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          )}
        </Box>
      </TabPanel>

      {/* Add Class dialog */}
      <Dialog
        open={addClassOpen}
        onClose={() => setAddClassOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Class Name"
            value={newClassName}
            onChange={(e) => {
              setNewClassName(e.target.value);
              setClassNameError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
            error={!!classNameError}
            helperText={classNameError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddClassOpen(false); setClassNameError(""); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddClass}
            disabled={!newClassName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Section dialog */}
      <Dialog
        open={addSectionTarget !== null}
        onClose={() => setAddSectionTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Add Section to {addSectionTarget?.class_name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Section Name"
            value={newSectionName}
            onChange={(e) => {
              setNewSectionName(e.target.value);
              setSectionNameError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
            error={!!sectionNameError}
            helperText={sectionNameError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddSectionTarget(null); setSectionNameError(""); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddSection}
            disabled={!newSectionName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Rename {renameTarget?.sectionItem ? "Section" : "Class"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="New Name"
            value={renameValue}
            onChange={(e) => {
              setRenameValue(e.target.value);
              setRenameError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            error={!!renameError}
            helperText={renameError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRenameTarget(null); setRenameError(""); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRename}
            disabled={!renameValue.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
