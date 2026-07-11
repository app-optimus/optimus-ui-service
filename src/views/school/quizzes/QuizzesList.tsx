import * as React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSchoolContext } from "../../../components/SchoolLayout";
import CustomTable, { Column } from "../../../components/CustomTable";

const CLASS_STRUCTURE_API = "http://localhost:8000/user/class-structure";
const QUIZ_API = "http://localhost:8000/user/quiz";

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

interface QuizRow {
  quiz_id: string;
  class_id: string;
  section_id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  created_at: string;
  question_count: number;
}

const QUIZ_COLUMNS: Column[] = [
  { field: "title", headerName: "Title", align: "left" },
  { field: "class_name", headerName: "Class", align: "left" },
  { field: "section_name", headerName: "Section", align: "left" },
  { field: "question_count", headerName: "Questions", align: "center" },
  { field: "status", headerName: "Status", align: "center" },
  { field: "created_at", headerName: "Created", align: "left" },
  { field: "actions", headerName: "", align: "right" },
];

export default function QuizzesList() {
  const { entityId } = useSchoolContext();
  const navigate = useNavigate();

  const [classStructure, setClassStructure] = React.useState<ClassData[]>([]);
  const [referenceLoading, setReferenceLoading] = React.useState(false);

  const [classFilter, setClassFilter] = React.useState("");
  const [sectionFilter, setSectionFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"" | "draft" | "published">("");

  const [quizzes, setQuizzes] = React.useState<QuizRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [createClassId, setCreateClassId] = React.useState("");
  const [createSectionId, setCreateSectionId] = React.useState("");
  const [createError, setCreateError] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const selectedFilterClass = classStructure.find((cls) => cls.class_id === classFilter);
  const selectedCreateClass = classStructure.find((cls) => cls.class_id === createClassId);

  const classNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    classStructure.forEach((cls) => {
      map[cls.class_id] = cls.class_name;
    });
    return map;
  }, [classStructure]);

  const sectionNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    classStructure.forEach((cls) => {
      cls.sections.forEach((section) => {
        map[section.section_id] = section.section_name;
      });
    });
    return map;
  }, [classStructure]);

  React.useEffect(() => {
    if (!entityId) return;
    const fetchClassStructure = async () => {
      setReferenceLoading(true);
      try {
        const res = await axios.get(`${CLASS_STRUCTURE_API}/?entity_id=${entityId}`);
        if (res.data.success) setClassStructure(res.data.data ?? []);
      } finally {
        setReferenceLoading(false);
      }
    };
    fetchClassStructure();
  }, [entityId]);

  const fetchQuizzes = React.useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${QUIZ_API}/`, {
        params: {
          entity_id: entityId,
          class_id: classFilter || undefined,
          section_id: sectionFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      if (res.data.success) {
        setQuizzes(res.data.data ?? []);
      } else {
        setError(res.data.message || "Failed to load quizzes");
      }
    } catch {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }, [entityId, classFilter, sectionFilter, statusFilter]);

  React.useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleCreateQuiz = async () => {
    const trimmedTitle = createTitle.trim();
    if (!trimmedTitle) {
      setCreateError("Please enter a title");
      return;
    }
    if (!createClassId || !createSectionId) {
      setCreateError("Please select a class and section");
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      const res = await axios.post(`${QUIZ_API}/`, {
        entity_id: entityId,
        class_id: createClassId,
        section_id: createSectionId,
        title: trimmedTitle,
        description: createDescription.trim() || undefined,
      });
      if (res.data.success) {
        const quizId = res.data.data?.quiz_id;
        setCreateOpen(false);
        setCreateTitle("");
        setCreateDescription("");
        setCreateClassId("");
        setCreateSectionId("");
        if (quizId) navigate(`/school/${entityId}/quizzes/${quizId}`);
      } else {
        setCreateError(res.data.message || "Failed to create quiz");
      }
    } catch (error: any) {
      setCreateError(error?.response?.data?.message || "Failed to create quiz");
    } finally {
      setCreating(false);
    }
  };

  const rows = quizzes.map((quiz) => ({
    ...quiz,
    class_name: classNameById[quiz.class_id] ?? quiz.class_id,
    section_name: sectionNameById[quiz.section_id] ?? quiz.section_id,
    created_at: new Date(quiz.created_at).toLocaleDateString(),
  }));

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">Quizzes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Create Quiz
        </Button>
      </Box>

      <Stack direction="row" spacing={2}>
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

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | "draft" | "published")}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
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
          No quizzes yet. Click "Create Quiz" to build the first one.
        </Typography>
      ) : (
        <CustomTable
          columns={QUIZ_COLUMNS}
          rows={rows}
          renderCell={(column, value, row) => {
            if (column.field === "status") {
              return (
                <Chip
                  size="small"
                  label={value === "published" ? "Published" : "Draft"}
                  color={value === "published" ? "success" : "default"}
                  variant={value === "published" ? "filled" : "outlined"}
                />
              );
            }
            if (column.field === "actions") {
              return (
                <Button size="small" onClick={() => navigate(`/school/${entityId}/quizzes/${row.quiz_id}`)}>
                  {row.status === "draft" ? "Edit" : "View"}
                </Button>
              );
            }
            return value;
          }}
        />
      )}

      {/* Create Quiz dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Quiz</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createError && <Alert severity="error">{createError}</Alert>}

            <TextField
              label="Title"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Description (optional)"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }} disabled={referenceLoading}>
                <InputLabel>Class</InputLabel>
                <Select
                  label="Class"
                  value={createClassId}
                  onChange={(e) => {
                    setCreateClassId(e.target.value);
                    setCreateSectionId("");
                  }}
                >
                  {classStructure.map((cls) => (
                    <MenuItem key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }} disabled={!selectedCreateClass}>
                <InputLabel>Section</InputLabel>
                <Select
                  label="Section"
                  value={createSectionId}
                  onChange={(e) => setCreateSectionId(e.target.value)}
                >
                  {(selectedCreateClass?.sections ?? []).map((section) => (
                    <MenuItem key={section.section_id} value={section.section_id}>
                      {section.section_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateQuiz} disabled={creating}>
            {creating ? <CircularProgress size={16} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
