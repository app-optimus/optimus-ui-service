import * as React from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSchoolContext } from "../../../components/SchoolLayout";
import CustomTable, { Column } from "../../../components/CustomTable";

const CLASS_STRUCTURE_API = "http://localhost:8000/user/class-structure";
const SUBJECTS_API = "http://localhost:8000/user/subject";
const STUDY_MATERIAL_API = "http://localhost:8000/user/study-material";

const MAX_FILE_SIZE_MB = 25;
const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".mp4", ".jpg", ".jpeg", ".png", ".zip",
];

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

interface SubjectData {
  subject_id: string;
  class_id: string;
  subject_name: string;
  display_order: number;
}

type MaterialType = "lecture" | "notes" | "sample_quiz";

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  lecture: "Lecture",
  notes: "Notes",
  sample_quiz: "Sample Quiz",
};

const MATERIAL_TYPE_CHIP_COLOR: Record<MaterialType, "primary" | "secondary" | "warning"> = {
  lecture: "primary",
  notes: "secondary",
  sample_quiz: "warning",
};

interface MaterialRow {
  material_id: string;
  class_id: string;
  class_name: string;
  section_id: string | null;
  section_name: string | null;
  subject_id: string;
  subject_name: string;
  material_type: MaterialType;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_by: string;
  created_at: string;
}

const MATERIAL_COLUMNS: Column[] = [
  { field: "title", headerName: "Title", align: "left" },
  { field: "material_type", headerName: "Type", align: "center" },
  { field: "subject_name", headerName: "Subject", align: "left" },
  { field: "class_section", headerName: "Class / Section", align: "left" },
  { field: "file_info", headerName: "File", align: "left" },
  { field: "uploaded_at", headerName: "Uploaded", align: "left" },
  { field: "actions", headerName: "", align: "right" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudyMaterialList() {
  const { entityId } = useSchoolContext();

  const [classStructure, setClassStructure] = React.useState<ClassData[]>([]);
  const [subjects, setSubjects] = React.useState<SubjectData[]>([]);
  const [referenceLoading, setReferenceLoading] = React.useState(false);

  const [classFilter, setClassFilter] = React.useState("");
  const [sectionFilter, setSectionFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"" | MaterialType>("");

  const [materials, setMaterials] = React.useState<MaterialRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [uploadDescription, setUploadDescription] = React.useState("");
  const [uploadType, setUploadType] = React.useState<MaterialType>("lecture");
  const [uploadClassId, setUploadClassId] = React.useState("");
  const [uploadSectionId, setUploadSectionId] = React.useState("");
  const [uploadSubjectId, setUploadSubjectId] = React.useState("");
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  const selectedFilterClass = classStructure.find((cls) => cls.class_id === classFilter);
  const selectedUploadClass = classStructure.find((cls) => cls.class_id === uploadClassId);
  const uploadClassSubjects = subjects.filter((s) => s.class_id === uploadClassId);

  React.useEffect(() => {
    if (!entityId) return;
    const fetchReferenceData = async () => {
      setReferenceLoading(true);
      try {
        const [classRes, subjectRes] = await Promise.all([
          axios.get(`${CLASS_STRUCTURE_API}/?entity_id=${entityId}`),
          axios.get(`${SUBJECTS_API}/?entity_id=${entityId}`),
        ]);
        if (classRes.data.success) setClassStructure(classRes.data.data ?? []);
        if (subjectRes.data.success) setSubjects(subjectRes.data.data ?? []);
      } finally {
        setReferenceLoading(false);
      }
    };
    fetchReferenceData();
  }, [entityId]);

  const fetchMaterials = React.useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${STUDY_MATERIAL_API}/`, {
        params: {
          entity_id: entityId,
          class_id: classFilter || undefined,
          section_id: sectionFilter || undefined,
          subject_id: subjectFilter || undefined,
          material_type: typeFilter || undefined,
        },
      });
      if (res.data.success) {
        setMaterials(res.data.data ?? []);
      } else {
        setError(res.data.message || "Failed to load study materials");
      }
    } catch {
      setError("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  }, [entityId, classFilter, sectionFilter, subjectFilter, typeFilter]);

  React.useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      setUploadFile(null);
      return;
    }
    const extension = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setUploadError(`Unsupported file type. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`);
      setUploadFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB`);
      setUploadFile(null);
      return;
    }
    setUploadError("");
    setUploadFile(file);
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadDescription("");
    setUploadType("lecture");
    setUploadClassId("");
    setUploadSectionId("");
    setUploadSubjectId("");
    setUploadFile(null);
    setUploadError("");
  };

  const handleUpload = async () => {
    const trimmedTitle = uploadTitle.trim();
    if (!trimmedTitle) {
      setUploadError("Please enter a title");
      return;
    }
    if (!uploadClassId || !uploadSubjectId) {
      setUploadError("Please select a class and subject");
      return;
    }
    if (!uploadFile) {
      setUploadError("Please choose a file to upload");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("entity_id", entityId);
      formData.append("class_id", uploadClassId);
      if (uploadSectionId) formData.append("section_id", uploadSectionId);
      formData.append("subject_id", uploadSubjectId);
      formData.append("material_type", uploadType);
      formData.append("title", trimmedTitle);
      if (uploadDescription.trim()) formData.append("description", uploadDescription.trim());
      formData.append("file", uploadFile);

      const res = await axios.post(`${STUDY_MATERIAL_API}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUploadOpen(false);
        resetUploadForm();
        await fetchMaterials();
      } else {
        setUploadError(res.data.message || "Failed to upload study material");
      }
    } catch (error: any) {
      setUploadError(error?.response?.data?.message || "Failed to upload study material");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (material: MaterialRow) => {
    try {
      const res = await axios.get(`${STUDY_MATERIAL_API}/${material.material_id}/download`, {
        params: { entity_id: entityId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = material.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download file");
    }
  };

  const handleDelete = async (material: MaterialRow) => {
    try {
      const res = await axios.delete(`${STUDY_MATERIAL_API}/`, {
        data: { entity_id: entityId, material_id: material.material_id },
      });
      if (res.data.success) {
        await fetchMaterials();
      }
    } catch {
      setError("Failed to delete study material");
    }
  };

  const rows = materials.map((material) => ({
    ...material,
    class_section: `${material.class_name}${material.section_name ? ` - ${material.section_name}` : " - All sections"}`,
    file_info: `${material.file_name} (${formatFileSize(material.file_size)})`,
    uploaded_at: new Date(material.created_at).toLocaleDateString(),
  }));

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">Study Material</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadOpen(true)}>
          Upload Material
        </Button>
      </Box>

      <Stack direction="row" spacing={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 160 }} disabled={referenceLoading}>
          <InputLabel>Class</InputLabel>
          <Select
            label="Class"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setSectionFilter("");
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

        <FormControl sx={{ minWidth: 160 }} disabled={!selectedFilterClass}>
          <InputLabel>Section</InputLabel>
          <Select label="Section" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <MenuItem value="">All Sections</MenuItem>
            {(selectedFilterClass?.sections ?? []).map((section) => (
              <MenuItem key={section.section_id} value={section.section_id}>
                {section.section_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }} disabled={referenceLoading}>
          <InputLabel>Subject</InputLabel>
          <Select label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <MenuItem value="">All Subjects</MenuItem>
            {subjects
              .filter((s) => !classFilter || s.class_id === classFilter)
              .map((subject) => (
                <MenuItem key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "" | MaterialType)}
          >
            <MenuItem value="">All Types</MenuItem>
            {Object.entries(MATERIAL_TYPE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          No study materials yet. Click "Upload Material" to add the first one.
        </Typography>
      ) : (
        <CustomTable
          columns={MATERIAL_COLUMNS}
          rows={rows}
          renderCell={(column, value, row) => {
            if (column.field === "material_type") {
              const type = value as MaterialType;
              return <Chip size="small" label={MATERIAL_TYPE_LABELS[type]} color={MATERIAL_TYPE_CHIP_COLOR[type]} />;
            }
            if (column.field === "actions") {
              return (
                <>
                  <IconButton size="small" title="Download" onClick={() => handleDownload(row)}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" title="Delete" onClick={() => handleDelete(row)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              );
            }
            return value;
          }}
        />
      )}

      {/* Upload Material dialog */}
      <Dialog
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          resetUploadForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Study Material</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {uploadError && <Alert severity="error">{uploadError}</Alert>}

            <TextField
              label="Title"
              placeholder="e.g. Chapter 3 - Fractions"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Description (optional)"
              placeholder="Brief note about what this material covers"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Material Type</InputLabel>
              <Select
                label="Material Type"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as MaterialType)}
              >
                {Object.entries(MATERIAL_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }} disabled={referenceLoading}>
                <InputLabel>Class</InputLabel>
                <Select
                  label="Class"
                  value={uploadClassId}
                  onChange={(e) => {
                    setUploadClassId(e.target.value);
                    setUploadSectionId("");
                    setUploadSubjectId("");
                  }}
                >
                  {classStructure.map((cls) => (
                    <MenuItem key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }} disabled={!selectedUploadClass}>
                <InputLabel>Section</InputLabel>
                <Select
                  label="Section"
                  value={uploadSectionId}
                  onChange={(e) => setUploadSectionId(e.target.value)}
                >
                  <MenuItem value="">All sections</MenuItem>
                  {(selectedUploadClass?.sections ?? []).map((section) => (
                    <MenuItem key={section.section_id} value={section.section_id}>
                      {section.section_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <FormControl fullWidth disabled={!uploadClassId}>
              <InputLabel>Subject</InputLabel>
              <Select
                label="Subject"
                value={uploadSubjectId}
                onChange={(e) => setUploadSubjectId(e.target.value)}
              >
                {uploadClassSubjects.map((subject) => (
                  <MenuItem key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              sx={{ justifyContent: "flex-start" }}
            >
              {uploadFile ? uploadFile.name : "Choose File"}
              <input
                type="file"
                hidden
                onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Allowed types: {ALLOWED_EXTENSIONS.join(", ")}. Max size {MAX_FILE_SIZE_MB}MB.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUploadOpen(false);
              resetUploadForm();
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading}>
            {uploading ? <CircularProgress size={16} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
