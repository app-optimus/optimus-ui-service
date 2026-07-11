import * as React from "react";
import axios from "axios";
import { useSchoolContext } from "../../../components/SchoolLayout";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
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

const PERMISSIONS_API = "http://localhost:8000/user/permission/entity";

// Matches the backend's MODULE_NAME setting (app/settings.py), which is the
// top-level key under which submodule read/write permissions are stored.
const PERMISSION_MODULE = "USER";

const KNOWN_SUBMODULES = [
  { key: "class_structure", label: "Class Structure" },
  { key: "permissions", label: "Permissions" },
];

interface PermissionValue {
  read: boolean;
  write: boolean;
}

interface PermissionRow {
  permission_id: string;
  name: string;
  permissions: { [key: string]: PermissionValue };
}

function defaultSubmodulePermissions(): { [key: string]: PermissionValue } {
  return Object.fromEntries(
    KNOWN_SUBMODULES.map(({ key }) => [key, { read: false, write: false }])
  );
}

function withKnownSubmodules(perms: { [key: string]: PermissionValue }) {
  const merged = { ...perms };
  KNOWN_SUBMODULES.forEach(({ key }) => {
    if (!merged[key]) merged[key] = { read: false, write: false };
  });
  return merged;
}

function orderedSubmoduleKeys(perms: { [key: string]: PermissionValue }) {
  const known = KNOWN_SUBMODULES.map((s) => s.key).filter((key) => key in perms);
  const extra = Object.keys(perms).filter(
    (key) => !KNOWN_SUBMODULES.some((s) => s.key === key)
  );
  return [...known, ...extra];
}

function formatLabel(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PermissionsSettings() {
  const { entityId } = useSchoolContext();

  const [permissionsRows, setPermissionsRows] = React.useState<PermissionRow[]>([]);
  const [permissionsLoading, setPermissionsLoading] = React.useState(false);
  const [permissionsError, setPermissionsError] = React.useState("");
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<{
    [key: string]: PermissionValue;
  } | null>(null);
  const [draftName, setDraftName] = React.useState("");
  const [savingPermission, setSavingPermission] = React.useState(false);

  const [addPermissionOpen, setAddPermissionOpen] = React.useState(false);
  const [newPermissionName, setNewPermissionName] = React.useState("");
  const [newPermissionRights, setNewPermissionRights] = React.useState<{
    [key: string]: PermissionValue;
  }>(defaultSubmodulePermissions());
  const [permissionNameError, setPermissionNameError] = React.useState("");
  const [addingPermission, setAddingPermission] = React.useState(false);

  const fetchPermissions = React.useCallback(async () => {
    if (!entityId) return;
    setPermissionsLoading(true);
    setPermissionsError("");
    try {
      const res = await axios.get(PERMISSIONS_API, { params: { entity_id: entityId } });
      if (res.data.success) {
        const permissionMap = res.data.data ?? {};
        const rows: PermissionRow[] = Object.values(permissionMap).map((item: any) => ({
          permission_id: item.permission_id,
          name: item.permission_name,
          permissions: withKnownSubmodules(item.permission_json?.[PERMISSION_MODULE] ?? {}),
        }));
        setPermissionsRows(rows);
      } else {
        setPermissionsError(res.data.message || "Failed to load permissions");
      }
    } catch {
      setPermissionsError("Failed to load permissions");
    } finally {
      setPermissionsLoading(false);
    }
  }, [entityId]);

  React.useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setDraftName(permissionsRows[index].name);
    setDraft(
      JSON.parse(JSON.stringify(withKnownSubmodules(permissionsRows[index].permissions)))
    );
    setPermissionsError("");
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setDraft(null);
    setDraftName("");
  };

  const handleSave = async (index: number) => {
    if (!draft) return;
    const row = permissionsRows[index];
    const trimmedName = draftName.trim();
    if (!trimmedName) return;

    setSavingPermission(true);
    setPermissionsError("");
    try {
      const res = await axios.patch(PERMISSIONS_API, {
        entity_id: entityId,
        permission_id: row.permission_id,
        permission_name: trimmedName,
        permissions: { [PERMISSION_MODULE]: draft },
      });
      if (res.data.success) {
        setEditingIndex(null);
        setDraft(null);
        setDraftName("");
        await fetchPermissions();
      } else {
        setPermissionsError(res.data.message || "Failed to update permission group");
      }
    } catch (error: any) {
      setPermissionsError(error?.response?.data?.message || "Failed to update permission group");
    } finally {
      setSavingPermission(false);
    }
  };

  const handleToggle = (key: string, field: "read" | "write") => {
    if (!draft) return;
    setDraft((prev) =>
      prev
        ? { ...prev, [key]: { ...prev[key], [field]: !prev[key][field] } }
        : prev
    );
  };

  const handleNewPermissionToggle = (key: string, field: "read" | "write") => {
    setNewPermissionRights((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: !prev[key][field] },
    }));
  };

  const handleAddPermission = async () => {
    const trimmed = newPermissionName.trim();
    if (!trimmed) return;

    setAddingPermission(true);
    setPermissionNameError("");
    try {
      const res = await axios.post(PERMISSIONS_API, {
        entity_id: entityId,
        permission_name: trimmed,
        permissions: { [PERMISSION_MODULE]: newPermissionRights },
      });
      if (res.data.success) {
        setAddPermissionOpen(false);
        setNewPermissionName("");
        setNewPermissionRights(defaultSubmodulePermissions());
        await fetchPermissions();
      } else {
        setPermissionNameError(res.data.message || "Failed to add permission group");
      }
    } catch (error: any) {
      setPermissionNameError(error?.response?.data?.message || "Failed to add permission group");
    } finally {
      setAddingPermission(false);
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
        <Typography variant="h4">Permissions</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setAddPermissionOpen(true)}
        >
          Add Permission Group
        </Button>
      </Box>

      {permissionsError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPermissionsError("")}>
          {permissionsError}
        </Alert>
      )}

      {permissionsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : permissionsRows.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          No permission groups added yet. Click "Add Permission Group" to get started.
        </Typography>
      ) : (
        permissionsRows.map((row, index) => {
          const isEditing = editingIndex === index;
          const perms = isEditing && draft ? draft : row.permissions;
          const submoduleKeys = orderedSubmoduleKeys(perms);

          return (
            <Accordion key={row.permission_id} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {isEditing ? (
                  <TextField
                    size="small"
                    value={draftName}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setDraftName(e.target.value)}
                    sx={{ maxWidth: 260 }}
                  />
                ) : (
                  <Typography fontWeight={500}>{row.name}</Typography>
                )}
              </AccordionSummary>

              <AccordionDetails>
                {submoduleKeys.map((key, i) => {
                  const label =
                    KNOWN_SUBMODULES.find((s) => s.key === key)?.label ?? formatLabel(key);
                  return (
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
                          {label}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!perms[key].read}
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
                                checked={!!perms[key].write}
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
                  );
                })}

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
                      <Button size="small" onClick={handleCancel} disabled={savingPermission}>
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSave(index)}
                        disabled={savingPermission || !draftName.trim()}
                      >
                        {savingPermission ? <CircularProgress size={16} /> : "Save"}
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
        })
      )}

      {/* Add Permission Group dialog */}
      <Dialog
        open={addPermissionOpen}
        onClose={() => setAddPermissionOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Permission Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Permission Group Name"
            value={newPermissionName}
            onChange={(e) => {
              setNewPermissionName(e.target.value);
              setPermissionNameError("");
            }}
            error={!!permissionNameError}
            helperText={permissionNameError}
            sx={{ mt: 1, mb: 2 }}
          />

          {KNOWN_SUBMODULES.map(({ key, label }, i) => (
            <React.Fragment key={key}>
              {i > 0 && <Divider sx={{ my: 1 }} />}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ minWidth: 140 }}>
                  {label}
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPermissionRights[key].read}
                        onChange={() => handleNewPermissionToggle(key, "read")}
                        size="small"
                      />
                    }
                    label="Read"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPermissionRights[key].write}
                        onChange={() => handleNewPermissionToggle(key, "write")}
                        size="small"
                      />
                    }
                    label="Write"
                  />
                </Box>
              </Box>
            </React.Fragment>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddPermissionOpen(false);
              setNewPermissionName("");
              setNewPermissionRights(defaultSubmodulePermissions());
              setPermissionNameError("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPermission}
            disabled={!newPermissionName.trim() || addingPermission}
          >
            {addingPermission ? <CircularProgress size={16} /> : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
