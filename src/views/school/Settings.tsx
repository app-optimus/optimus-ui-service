import * as React from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

interface ClassData {
  name: string;
  sections: string[];
}

const initialClassStructure: ClassData[] = [
  { name: "Class I", sections: ["Section A", "Section B"] },
  { name: "Class II", sections: ["Section A", "Section B"] },
  { name: "Class III", sections: ["Section A", "Section B", "Section C"] },
  { name: "Class IV", sections: ["Section A", "Section B"] },
  { name: "Class V", sections: ["Section A", "Section B"] },
];

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
  const [activeTab, setActiveTab] = React.useState(0);
  const [permissionsRows, setPermissionsRows] =
    React.useState(initialPermissionsRows);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<{
    [key: string]: PermissionValue;
  } | null>(null);

  const [classStructure, setClassStructure] =
    React.useState(initialClassStructure);
  const [addClassOpen, setAddClassOpen] = React.useState(false);
  const [newClassName, setNewClassName] = React.useState("");
  const [classNameError, setClassNameError] = React.useState("");
  const [addSectionTarget, setAddSectionTarget] = React.useState<number | null>(
    null
  );
  const [newSectionName, setNewSectionName] = React.useState("");
  const [sectionNameError, setSectionNameError] = React.useState("");
  const [renameError, setRenameError] = React.useState("");

  const handleAddClass = () => {
    const trimmed = newClassName.trim();
    if (!trimmed) return;
    if (classStructure.some((cls) => cls.name.toLowerCase() === trimmed.toLowerCase())) {
      setClassNameError("A class with this name already exists");
      return;
    }
    setClassStructure((prev) => [...prev, { name: trimmed, sections: [] }]);
    setNewClassName("");
    setClassNameError("");
    setAddClassOpen(false);
  };

  const handleDeleteClass = (classIndex: number) => {
    setClassStructure((prev) => prev.filter((_, i) => i !== classIndex));
  };

  const handleAddSection = () => {
    const trimmed = newSectionName.trim();
    if (addSectionTarget === null || !trimmed) return;
    const existing = classStructure[addSectionTarget].sections;
    if (existing.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSectionNameError("A section with this name already exists in this class");
      return;
    }
    setClassStructure((prev) =>
      prev.map((cls, i) =>
        i === addSectionTarget
          ? { ...cls, sections: [...cls.sections, trimmed] }
          : cls
      )
    );
    setNewSectionName("");
    setSectionNameError("");
    setAddSectionTarget(null);
  };

  const handleDeleteSection = (classIndex: number, sectionIndex: number) => {
    setClassStructure((prev) =>
      prev.map((cls, i) =>
        i === classIndex
          ? { ...cls, sections: cls.sections.filter((_, si) => si !== sectionIndex) }
          : cls
      )
    );
  };

  const [renameTarget, setRenameTarget] = React.useState<{
    classIndex: number;
    sectionIndex?: number;
  } | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  const openRename = (classIndex: number, sectionIndex?: number) => {
    const current =
      sectionIndex !== undefined
        ? classStructure[classIndex].sections[sectionIndex]
        : classStructure[classIndex].name;
    setRenameValue(current);
    setRenameTarget({ classIndex, sectionIndex });
  };

  const handleRename = () => {
    const trimmed = renameValue.trim();
    if (!renameTarget || !trimmed) return;
    const { classIndex, sectionIndex } = renameTarget;

    if (sectionIndex !== undefined) {
      const siblings = classStructure[classIndex].sections;
      if (
        siblings.some(
          (s, si) => si !== sectionIndex && s.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        setRenameError("A section with this name already exists in this class");
        return;
      }
    } else {
      if (
        classStructure.some(
          (cls, i) => i !== classIndex && cls.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        setRenameError("A class with this name already exists");
        return;
      }
    }

    setClassStructure((prev) =>
      prev.map((cls, i) => {
        if (i !== classIndex) return cls;
        if (sectionIndex !== undefined) {
          return {
            ...cls,
            sections: cls.sections.map((s, si) =>
              si === sectionIndex ? trimmed : s
            ),
          };
        }
        return { ...cls, name: trimmed };
      })
    );
    setRenameTarget(null);
    setRenameValue("");
    setRenameError("");
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

          <SimpleTreeView>
            {classStructure.map((cls, classIndex) => (
              <TreeItem
                key={classIndex}
                itemId={`class-${classIndex}`}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 0.5,
                    }}
                  >
                    <Typography fontWeight={500}>{cls.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        title="Rename class"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRename(classIndex);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Add section"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddSectionTarget(classIndex);
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Delete class"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(classIndex);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                }
              >
                {cls.sections.map((section, sectionIndex) => (
                  <TreeItem
                    key={sectionIndex}
                    itemId={`class-${classIndex}-section-${sectionIndex}`}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="body2">{section}</Typography>
                        <Box>
                          <IconButton
                            size="small"
                            title="Rename section"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRename(classIndex, sectionIndex);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            title="Delete section"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(classIndex, sectionIndex);
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
          Add Section to{" "}
          {addSectionTarget !== null && classStructure[addSectionTarget]?.name}
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
          Rename{" "}
          {renameTarget?.sectionIndex !== undefined ? "Section" : "Class"}
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
