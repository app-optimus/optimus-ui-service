import * as React from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Stack,
  SelectChangeEvent,
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel,
  Divider,
  Grid,
  OutlinedInput,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSchoolContext } from "../../components/SchoolLayout";
import CustomTable, { Column } from "../../components/CustomTable";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const CLASS_STRUCTURE_API = "http://localhost:8000/user/class-structure";
const PERMISSIONS_API = "http://localhost:8000/user/permission/entity";
const USER_API = "http://localhost:8000/user";

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

interface PermissionData {
  permission_id: string;
  permission_name: string;
}

const USER_ROLES = [
  { value: "principal", label: "Principal" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
] as const;

type UserRoleValue = (typeof USER_ROLES)[number]["value"];

interface EntityUserRow {
  user_id: string;
  user_name: string;
  user_email: string;
  opti_code: string | null;
  user_role: UserRoleValue;
  permission_id: string;
  permission_name: string | null;
  class_id: string | null;
  section_id: string | null;
  roll_number: string | null;
  admission_number: string | null;
}

const ENTITY_USERS_COLUMNS: Column[] = [
  { field: "user_name", headerName: "Name", align: "left" },
  { field: "user_email", headerName: "Email", align: "left" },
  { field: "user_role", headerName: "Role", align: "left" },
  { field: "class_name", headerName: "Class", align: "left" },
  { field: "section_name", headerName: "Section", align: "left" },
  { field: "roll_number", headerName: "Roll No.", align: "left" },
  { field: "admission_number", headerName: "Admission No.", align: "left" },
  { field: "permission_name", headerName: "Permission Group", align: "left" },
];

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

function useReferenceData(entityId: string) {
  const [classStructure, setClassStructure] = React.useState<ClassData[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchReferenceData = React.useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError("");
    try {
      const [classRes, permRes] = await Promise.all([
        axios.get(`${CLASS_STRUCTURE_API}/`, { params: { entity_id: entityId } }),
        axios.get(PERMISSIONS_API, { params: { entity_id: entityId } }),
      ]);

      if (classRes.data.success) {
        setClassStructure(classRes.data.data ?? []);
      } else {
        setError(classRes.data.message || "Failed to load class structure");
      }

      if (permRes.data.success) {
        const permMap = permRes.data.data ?? {};
        setPermissions(Object.values(permMap) as PermissionData[]);
      } else {
        setError((prev) => prev || permRes.data.message || "Failed to load permissions");
      }
    } catch {
      setError("Failed to load classes, sections and permissions");
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  React.useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  return { classStructure, permissions, loading, error };
}

const defaultSingleForm = {
  user_name: "",
  user_email: "",
  user_role: "" as UserRoleValue | "",
  permission_name: "",
  opti_code: "",
  class_id: "",
  section_id: "",
  roll_number: "",
  admission_number: "",
};

function SingleUserForm({
  entityId,
  classStructure,
  permissions,
  referenceLoading,
}: {
  entityId: string;
  classStructure: ClassData[];
  permissions: PermissionData[];
  referenceLoading: boolean;
}) {
  const [form, setForm] = React.useState(defaultSingleForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const isStudent = form.user_role === "student";
  const selectedClass = classStructure.find((cls) => cls.class_id === form.class_id);

  const setField = (field: keyof typeof defaultSingleForm, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "user_role" && value !== "student") {
        next.class_id = "";
        next.section_id = "";
        next.roll_number = "";
        next.admission_number = "";
      }
      if (field === "class_id") {
        next.section_id = "";
      }
      return next;
    });
  };

  const handleChange = (field: keyof typeof defaultSingleForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setField(field, e.target.value);

  const handleSelectChange = (field: keyof typeof defaultSingleForm) => (
    e: SelectChangeEvent
  ) => setField(field, e.target.value);

  const validate = (): string => {
    if (!form.user_name.trim()) return "Please enter a name";
    if (!form.user_email.trim()) return "Please enter an email";
    if (!form.user_role) return "Please select a role";
    if (!form.permission_name) return "Please select a permission group";
    if (isStudent) {
      if (!form.class_id) return "Please select a class";
      if (!form.section_id) return "Please select a section";
      if (!form.roll_number.trim()) return "Please enter a roll number";
      if (!form.admission_number.trim()) return "Please enter an admission number";
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload: Record<string, unknown> = {
      entity_id: entityId,
      user_name: form.user_name.trim(),
      user_email: form.user_email.trim(),
      user_role: form.user_role,
      permission_name: form.permission_name,
      opti_code: form.opti_code.trim() || undefined,
    };

    if (isStudent) {
      payload.class_id = form.class_id;
      payload.section_id = form.section_id;
      payload.roll_number = form.roll_number.trim();
      payload.admission_number = form.admission_number.trim();
    }

    try {
      const res = await axios.post(`${USER_API}/`, payload);
      if (res.data.success) {
        setSuccessMessage(res.data.message || "User created successfully!");
        setForm(defaultSingleForm);
      } else {
        setErrorMessage(res.data.message || "Failed to create user");
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 760, mx: "auto" }}>
      <Stack spacing={2}>
        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0 }}>
              Basic Details
            </Typography>
          </Grid>
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor="user-name" required>
              Full Name
            </FormLabel>
            <OutlinedInput
              id="user-name"
              placeholder="Aarav Sharma"
              size="small"
              value={form.user_name}
              onChange={handleChange("user_name")}
            />
          </FormGrid>
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor="user-email" required>
              Email
            </FormLabel>
            <OutlinedInput
              id="user-email"
              type="email"
              placeholder="aarav.sharma@dpsschool.com"
              size="small"
              value={form.user_email}
              onChange={handleChange("user_email")}
            />
          </FormGrid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0 }}>
              Role &amp; Permissions
            </Typography>
          </Grid>
          <FormGrid size={{ xs: 12, md: 4 }}>
            <FormLabel htmlFor="user-role" required>
              Role
            </FormLabel>
            <Select
              id="user-role"
              size="small"
              value={form.user_role}
              onChange={handleSelectChange("user_role")}
            >
              {USER_ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormGrid>
          <FormGrid size={{ xs: 12, md: 4 }}>
            <FormLabel htmlFor="permission-name" required>
              Permission Group
            </FormLabel>
            <Select
              id="permission-name"
              size="small"
              disabled={referenceLoading}
              value={form.permission_name}
              onChange={handleSelectChange("permission_name")}
            >
              {permissions.map((perm) => (
                <MenuItem key={perm.permission_id} value={perm.permission_name}>
                  {perm.permission_name}
                </MenuItem>
              ))}
            </Select>
          </FormGrid>
          <FormGrid size={{ xs: 12, md: 4 }}>
            <FormLabel htmlFor="opti-code">Opti Code</FormLabel>
            <OutlinedInput
              id="opti-code"
              placeholder="OPTI-1023"
              size="small"
              value={form.opti_code}
              onChange={handleChange("opti_code")}
            />
          </FormGrid>

          {isStudent && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0 }}>
                  Student Details
                </Typography>
              </Grid>
              <FormGrid size={{ xs: 12, md: 6 }}>
                <FormLabel htmlFor="student-class" required>
                  Class
                </FormLabel>
                <Select
                  id="student-class"
                  size="small"
                  disabled={referenceLoading}
                  value={form.class_id}
                  onChange={handleSelectChange("class_id")}
                >
                  {classStructure.map((cls) => (
                    <MenuItem key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormGrid>
              <FormGrid size={{ xs: 12, md: 6 }}>
                <FormLabel htmlFor="student-section" required>
                  Section
                </FormLabel>
                <Select
                  id="student-section"
                  size="small"
                  disabled={!selectedClass}
                  value={form.section_id}
                  onChange={handleSelectChange("section_id")}
                >
                  {(selectedClass?.sections ?? []).map((section) => (
                    <MenuItem key={section.section_id} value={section.section_id}>
                      {section.section_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormGrid>
              <FormGrid size={{ xs: 12, md: 6 }}>
                <FormLabel htmlFor="roll-number" required>
                  Roll Number
                </FormLabel>
                <OutlinedInput
                  id="roll-number"
                  placeholder="24"
                  size="small"
                  value={form.roll_number}
                  onChange={handleChange("roll_number")}
                />
              </FormGrid>
              <FormGrid size={{ xs: 12, md: 6 }}>
                <FormLabel htmlFor="admission-number" required>
                  Admission Number
                </FormLabel>
                <OutlinedInput
                  id="admission-number"
                  placeholder="ADM2024015"
                  size="small"
                  value={form.admission_number}
                  onChange={handleChange("admission_number")}
                />
              </FormGrid>
            </>
          )}
        </Grid>

        <Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Create User
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function BulkUploadForm({
  entityId,
  classStructure,
  permissions,
  referenceLoading,
}: {
  entityId: string;
  classStructure: ClassData[];
  permissions: PermissionData[];
  referenceLoading: boolean;
}) {
  const [classId, setClassId] = React.useState("");
  const [sectionId, setSectionId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const selectedClass = classStructure.find((cls) => cls.class_id === classId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    if (!classId) {
      setErrorMessage("Please select a class");
      return;
    }
    if (!sectionId) {
      setErrorMessage("Please select a section");
      return;
    }
    if (!file) {
      setErrorMessage("Please choose an Excel file to upload");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("entity_id", entityId);
    formData.append("class_id", classId);
    formData.append("section_id", sectionId);
    formData.append("file", file);

    try {
      const res = await axios.post(`${USER_API}/bulk`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setSuccessMessage(res.data.message || "Students created successfully!");
        setFile(null);
      } else {
        setErrorMessage(res.data.message || "Failed to create students");
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Failed to create students");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 760, mx: "auto" }}>
      <Stack spacing={2}>
        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Typography color="text.secondary">
          Bulk upload creates <strong>students</strong> for a single class and section at a time.
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0 }}>
              Class &amp; Section
            </Typography>
          </Grid>
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor="bulk-class" required>
              Class
            </FormLabel>
            <Select
              id="bulk-class"
              size="small"
              disabled={referenceLoading}
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSectionId("");
              }}
            >
              {classStructure.map((cls) => (
                <MenuItem key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </Select>
          </FormGrid>
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor="bulk-section" required>
              Section
            </FormLabel>
            <Select
              id="bulk-section"
              size="small"
              disabled={!selectedClass}
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
            >
              {(selectedClass?.sections ?? []).map((section) => (
                <MenuItem key={section.section_id} value={section.section_id}>
                  {section.section_name}
                </MenuItem>
              ))}
            </Select>
          </FormGrid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0 }}>
              Excel File
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Expected columns: <strong>user_name</strong>, <strong>user_email</strong>,{" "}
              <strong>permission_id</strong>, <strong>roll_number</strong>,{" "}
              <strong>admission_number</strong> (e.g. Aarav Sharma, aarav.sharma@dpsschool.com,
              perm-9f21ac3d0b7e, 24, ADM2024015)
            </Typography>
          </Grid>

          {permissions.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ maxHeight: 220, overflow: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Permission ID</TableCell>
                      <TableCell>Permission Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permissions.map((perm) => (
                      <TableRow key={perm.permission_id}>
                        <TableCell>{perm.permission_id}</TableCell>
                        <TableCell>{perm.permission_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}>
              {file ? file.name : "Choose Excel File"}
              <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileChange} />
            </Button>
          </Grid>
        </Grid>

        <Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Upload
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function EntityUsersTable({
  entityId,
  classStructure,
  referenceLoading,
}: {
  entityId: string;
  classStructure: ClassData[];
  referenceLoading: boolean;
}) {
  const [classId, setClassId] = React.useState("");
  const [sectionId, setSectionId] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<UserRoleValue | "">("");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);

  const [rows, setRows] = React.useState<EntityUserRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const selectedClass = classStructure.find((cls) => cls.class_id === classId);

  // Debounce the free-text search before it triggers a server request.
  React.useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchEntityUsers = React.useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${USER_API}/entity-users`, {
        params: {
          entity_id: entityId,
          class_id: classId || undefined,
          section_id: sectionId || undefined,
          user_role: roleFilter || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setRows(res.data.data ?? []);
      } else {
        setError(res.data.message || "Failed to load users");
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [entityId, classId, sectionId, roleFilter, search]);

  React.useEffect(() => {
    fetchEntityUsers();
  }, [fetchEntityUsers]);

  React.useEffect(() => {
    setPage(0);
  }, [classId, sectionId, roleFilter, search]);

  const classNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    classStructure.forEach((cls) => map.set(cls.class_id, cls.class_name));
    return map;
  }, [classStructure]);

  const sectionNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    classStructure.forEach((cls) =>
      cls.sections.forEach((section) => map.set(section.section_id, section.section_name))
    );
    return map;
  }, [classStructure]);

  const tableRows = React.useMemo(
    () =>
      rows.map((row) => ({
        user_id: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        user_role: row.user_role.charAt(0).toUpperCase() + row.user_role.slice(1),
        class_name: row.class_id ? classNameById.get(row.class_id) ?? "-" : "-",
        section_name: row.section_id ? sectionNameById.get(row.section_id) ?? "-" : "-",
        roll_number: row.roll_number ?? "-",
        admission_number: row.admission_number ?? "-",
        permission_name: row.permission_name ?? "-",
      })),
    [rows, classNameById, sectionNameById]
  );

  const paginatedRows = React.useMemo(
    () => tableRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [tableRows, page, rowsPerPage]
  );

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Search by name, roll no. or admission no."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flex: 1, minWidth: 260 }}
        />

        <FormControl sx={{ minWidth: 160 }} disabled={referenceLoading}>
          <InputLabel>Class</InputLabel>
          <Select
            label="Class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSectionId("");
            }}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classStructure.map((cls) => (
              <MenuItem key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }} disabled={!selectedClass}>
          <InputLabel>Section</InputLabel>
          <Select label="Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            <MenuItem value="">All Sections</MenuItem>
            {(selectedClass?.sections ?? []).map((section) => (
              <MenuItem key={section.section_id} value={section.section_id}>
                {section.section_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRoleValue | "")}
          >
            <MenuItem value="">All Types</MenuItem>
            {USER_ROLES.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : tableRows.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No users found for the selected filters.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <CustomTable columns={ENTITY_USERS_COLUMNS} rows={paginatedRows} />
            <TablePagination
              component="div"
              count={tableRows.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
            />
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}

function AddUsersPanel({
  entityId,
  classStructure,
  permissions,
  referenceLoading,
}: {
  entityId: string;
  classStructure: ClassData[];
  permissions: PermissionData[];
  referenceLoading: boolean;
}) {
  const [mode, setMode] = React.useState<"single" | "bulk">("single");

  return (
    <Box>
      <Box sx={{ maxWidth: 760, mx: "auto", px: 3, pt: 3 }}>
        <FormControl>
          <FormLabel>Creation Mode</FormLabel>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value as "single" | "bulk")}
          >
            <FormControlLabel value="single" control={<Radio />} label="Single User" />
            <FormControlLabel value="bulk" control={<Radio />} label="Bulk Upload" />
          </RadioGroup>
        </FormControl>
      </Box>

      {mode === "single" ? (
        <SingleUserForm
          entityId={entityId}
          classStructure={classStructure}
          permissions={permissions}
          referenceLoading={referenceLoading}
        />
      ) : (
        <BulkUploadForm
          entityId={entityId}
          classStructure={classStructure}
          permissions={permissions}
          referenceLoading={referenceLoading}
        />
      )}
    </Box>
  );
}

export default function Section4() {
  const { entityId } = useSchoolContext();
  const [activeTab, setActiveTab] = React.useState(0);
  const { classStructure, permissions, loading, error } = useReferenceData(entityId);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h4" gutterBottom>
          Users Metabase
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="User Details" />
        <Tab label="Register User" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
          {error}
        </Alert>
      )}

      <TabPanel value={activeTab} index={0}>
        <EntityUsersTable entityId={entityId} classStructure={classStructure} referenceLoading={loading} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <AddUsersPanel
          entityId={entityId}
          classStructure={classStructure}
          permissions={permissions}
          referenceLoading={loading}
        />
      </TabPanel>
    </Box>
  );
}
