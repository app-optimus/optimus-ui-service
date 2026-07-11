import * as React from "react";
import axios from "axios";
import { useSchoolContext } from "../../../components/SchoolLayout";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
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

export default function ClassStructureSettings() {
  const { entityId } = useSchoolContext();

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

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">Class Structure</Typography>
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
                      <Typography variant="body2">{section.section_name}</Typography>
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

      {/* Add Class dialog */}
      <Dialog open={addClassOpen} onClose={() => setAddClassOpen(false)} maxWidth="xs" fullWidth>
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
          <Button
            onClick={() => {
              setAddClassOpen(false);
              setClassNameError("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddClass} disabled={!newClassName.trim()}>
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
        <DialogTitle>Add Section to {addSectionTarget?.class_name}</DialogTitle>
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
          <Button
            onClick={() => {
              setAddSectionTarget(null);
              setSectionNameError("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddSection} disabled={!newSectionName.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameTarget !== null} onClose={() => setRenameTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename {renameTarget?.sectionItem ? "Section" : "Class"}</DialogTitle>
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
          <Button
            onClick={() => {
              setRenameTarget(null);
              setRenameError("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRename} disabled={!renameValue.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
