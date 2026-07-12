import * as React from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  Checkbox,
  FormControlLabel,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSchoolContext } from "../../../components/SchoolLayout";

const QUIZ_API = "http://localhost:8000/user/quiz";
const QUESTION_TEMPLATES_API = "http://localhost:8000/user/question-templates";
const CLASS_STRUCTURE_API = "http://localhost:8000/user/class-structure";

const QUIZ_MIN_QUESTIONS = 3;
const QUIZ_MAX_QUESTIONS = 20;

type QuestionType = "single_choice" | "multiple_choice" | "one_word" | "number" | "long_text";
type GradingMode = "auto" | "manual";

const TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  one_word: "One Word Answer",
  number: "Number Answer",
  long_text: "Long Text Answer",
};

interface QuestionTemplate {
  template_code: QuestionType;
  template_name: string;
  description: string;
  default_grading_mode: GradingMode;
}

interface QuizQuestion {
  question_id: string;
  question_type: QuestionType;
  question_text: string;
  config: any;
  answer_key: any;
  grading_mode: GradingMode;
  marks: number;
  display_order: number;
}

type QuizLifecycleStatus = "draft" | "ready" | "published";

interface QuizDetail {
  quiz_id: string;
  entity_id: string;
  class_id: string;
  section_id: string;
  title: string;
  description: string | null;
  status: QuizLifecycleStatus;
  scheduled_start: string | null;
  questions: QuizQuestion[];
}

const STATUS_CHIP_PROPS: Record<QuizLifecycleStatus, { label: string; color: "default" | "info" | "success"; variant: "outlined" | "filled" }> = {
  draft: { label: "Draft", color: "default", variant: "outlined" },
  ready: { label: "Ready", color: "info", variant: "filled" },
  published: { label: "Published", color: "success", variant: "filled" },
};

function formatScheduledStart(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface SectionData {
  section_id: string;
  section_name: string;
}

interface ClassData {
  class_id: string;
  class_name: string;
  sections: SectionData[];
}

function QuestionPreview({ question }: { question: QuizQuestion }) {
  switch (question.question_type) {
    case "single_choice": {
      const options: string[] = question.config?.options ?? [];
      const correctIndex = question.answer_key;
      return (
        <RadioGroup value={correctIndex}>
          {options.map((option, i) => (
            <FormControlLabel
              key={i}
              value={i}
              control={<Radio size="small" disabled checked={i === correctIndex} />}
              label={option}
            />
          ))}
        </RadioGroup>
      );
    }
    case "multiple_choice": {
      const options: string[] = question.config?.options ?? [];
      const correctIndexes: number[] = question.answer_key ?? [];
      return (
        <Stack>
          {options.map((option, i) => (
            <FormControlLabel
              key={i}
              control={<Checkbox size="small" disabled checked={correctIndexes.includes(i)} />}
              label={option}
            />
          ))}
        </Stack>
      );
    }
    case "one_word": {
      const accepted: string[] = question.answer_key?.accepted_answers ?? [];
      return (
        <Typography variant="body2" color="text.secondary">
          Accepted answers: {accepted.join(", ") || "-"}
        </Typography>
      );
    }
    case "number": {
      const expected = question.answer_key?.expected_value;
      const tolerance = question.answer_key?.tolerance;
      return (
        <Typography variant="body2" color="text.secondary">
          Expected answer: {expected}
          {tolerance ? ` (± ${tolerance})` : ""}
        </Typography>
      );
    }
    case "long_text":
      return (
        <Typography variant="body2" color="text.secondary">
          Free-form answer, up to {question.config?.max_length ?? 1000} characters - graded manually.
        </Typography>
      );
    default:
      return null;
  }
}

function QuestionDialog({
  open,
  onClose,
  entityId,
  quizId,
  templates,
  editingQuestion,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  entityId: string;
  quizId: string;
  templates: QuestionTemplate[];
  editingQuestion: QuizQuestion | null;
  onSaved: () => void;
}) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [questionType, setQuestionType] = React.useState<QuestionType | "">("");
  const [questionText, setQuestionText] = React.useState("");
  const [marks, setMarks] = React.useState("1");
  const [options, setOptions] = React.useState<string[]>(["", ""]);
  const [correctSingle, setCorrectSingle] = React.useState<number | null>(null);
  const [correctMultiple, setCorrectMultiple] = React.useState<number[]>([]);
  const [acceptedAnswers, setAcceptedAnswers] = React.useState<string[]>([]);
  const [acceptedAnswerInput, setAcceptedAnswerInput] = React.useState("");
  const [caseSensitive, setCaseSensitive] = React.useState(false);
  const [expectedValue, setExpectedValue] = React.useState("");
  const [tolerance, setTolerance] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const isEditing = !!editingQuestion;

  React.useEffect(() => {
    if (!open) return;
    setError("");
    if (editingQuestion) {
      setStep(2);
      setQuestionType(editingQuestion.question_type);
      setQuestionText(editingQuestion.question_text);
      setMarks(String(editingQuestion.marks));

      if (editingQuestion.question_type === "single_choice") {
        setOptions(editingQuestion.config?.options ?? ["", ""]);
        setCorrectSingle(editingQuestion.answer_key ?? null);
      } else if (editingQuestion.question_type === "multiple_choice") {
        setOptions(editingQuestion.config?.options ?? ["", ""]);
        setCorrectMultiple(editingQuestion.answer_key ?? []);
      } else if (editingQuestion.question_type === "one_word") {
        setAcceptedAnswers(editingQuestion.answer_key?.accepted_answers ?? []);
        setCaseSensitive(!!editingQuestion.answer_key?.case_sensitive);
      } else if (editingQuestion.question_type === "number") {
        setExpectedValue(String(editingQuestion.answer_key?.expected_value ?? ""));
        setTolerance(
          editingQuestion.answer_key?.tolerance !== undefined && editingQuestion.answer_key?.tolerance !== null
            ? String(editingQuestion.answer_key.tolerance)
            : ""
        );
      }
    } else {
      setStep(1);
      setQuestionType("");
      setQuestionText("");
      setMarks("1");
      setOptions(["", ""]);
      setCorrectSingle(null);
      setCorrectMultiple([]);
      setAcceptedAnswers([]);
      setAcceptedAnswerInput("");
      setCaseSensitive(false);
      setExpectedValue("");
      setTolerance("");
    }
  }, [open, editingQuestion]);

  const handlePickType = (type: QuestionType) => {
    setQuestionType(type);
    setStep(2);
  };

  const handleAddOption = () => setOptions((prev) => [...prev, ""]);
  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectSingle((prev) => (prev === index ? null : prev !== null && prev > index ? prev - 1 : prev));
    setCorrectMultiple((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };
  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const handleAddAcceptedAnswer = () => {
    const trimmed = acceptedAnswerInput.trim();
    if (!trimmed || acceptedAnswers.includes(trimmed)) return;
    setAcceptedAnswers((prev) => [...prev, trimmed]);
    setAcceptedAnswerInput("");
  };
  const handleRemoveAcceptedAnswer = (answer: string) => {
    setAcceptedAnswers((prev) => prev.filter((a) => a !== answer));
  };

  const handleSave = async () => {
    if (!questionType) return;
    const trimmedText = questionText.trim();
    const marksNumber = parseInt(marks, 10);

    if (!trimmedText) {
      setError("Please enter the question text");
      return;
    }
    if (!marksNumber || marksNumber < 1) {
      setError("Marks must be at least 1");
      return;
    }

    let config: any = {};
    let answerKey: any = null;

    if (questionType === "single_choice" || questionType === "multiple_choice") {
      const trimmedOptions = options.map((o) => o.trim());
      if (trimmedOptions.some((o) => !o) || trimmedOptions.length < 2) {
        setError("Please fill in at least 2 options");
        return;
      }
      config = { options: trimmedOptions };
      if (questionType === "single_choice") {
        if (correctSingle === null) {
          setError("Please mark the correct option");
          return;
        }
        answerKey = correctSingle;
      } else {
        if (correctMultiple.length === 0) {
          setError("Please mark at least one correct option");
          return;
        }
        answerKey = correctMultiple;
      }
    } else if (questionType === "one_word") {
      if (acceptedAnswers.length === 0) {
        setError("Please add at least one accepted answer");
        return;
      }
      answerKey = { accepted_answers: acceptedAnswers, case_sensitive: caseSensitive };
    } else if (questionType === "number") {
      const expected = parseFloat(expectedValue);
      if (Number.isNaN(expected)) {
        setError("Please enter a valid expected number");
        return;
      }
      answerKey = { expected_value: expected };
      if (tolerance.trim()) {
        const toleranceNumber = parseFloat(tolerance);
        if (Number.isNaN(toleranceNumber) || toleranceNumber < 0) {
          setError("Tolerance must be a non-negative number");
          return;
        }
        answerKey.tolerance = toleranceNumber;
      }
    } else if (questionType === "long_text") {
      config = { max_length: 1000 };
      answerKey = null;
    }

    const payload = {
      entity_id: entityId,
      quiz_id: quizId,
      question_type: questionType,
      question_text: trimmedText,
      marks: marksNumber,
      config,
      answer_key: answerKey,
    };

    setSaving(true);
    setError("");
    try {
      const res = isEditing
        ? await axios.patch(`${QUIZ_API}/question`, { ...payload, question_id: editingQuestion!.question_id })
        : await axios.post(`${QUIZ_API}/question`, payload);
      if (res.data.success) {
        onSaved();
        onClose();
      } else {
        setError(res.data.message || "Failed to save question");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Edit Question" : step === 1 ? "Choose a Question Type" : "Add Question"}</DialogTitle>
      <DialogContent>
        {step === 1 && (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {templates.map((template) => (
              <Paper
                key={template.template_code}
                variant="outlined"
                sx={{ p: 2, cursor: "pointer", "&:hover": { borderColor: "primary.main" } }}
                onClick={() => handlePickType(template.template_code)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={500}>{template.template_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={template.default_grading_mode === "auto" ? "Auto-graded" : "Manually graded"}
                    color={template.default_grading_mode === "auto" ? "success" : "warning"}
                    variant="outlined"
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {step === 2 && questionType && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={TYPE_LABELS[questionType]} />
              {questionType === "long_text" && (
                <Chip size="small" label="Graded manually" color="warning" variant="outlined" />
              )}
            </Stack>

            <TextField
              label="Question Text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              sx={{ maxWidth: 140 }}
              inputProps={{ min: 1 }}
            />

            {(questionType === "single_choice" || questionType === "multiple_choice") && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Options - mark the correct {questionType === "single_choice" ? "answer" : "answers"}
                </Typography>
                <Stack spacing={1}>
                  {options.map((option, index) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center">
                      {questionType === "single_choice" ? (
                        <Radio
                          checked={correctSingle === index}
                          onChange={() => setCorrectSingle(index)}
                          size="small"
                        />
                      ) : (
                        <Checkbox
                          checked={correctMultiple.includes(index)}
                          onChange={() =>
                            setCorrectMultiple((prev) =>
                              prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
                            )
                          }
                          size="small"
                        />
                      )}
                      <TextField
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveOption(index)}
                        disabled={options.length <= 2}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
                <Button size="small" startIcon={<AddIcon />} onClick={handleAddOption} sx={{ mt: 1 }}>
                  Add Option
                </Button>
              </Box>
            )}

            {questionType === "one_word" && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Accepted Answers
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}>
                  {acceptedAnswers.map((answer) => (
                    <Chip key={answer} label={answer} onDelete={() => handleRemoveAcceptedAnswer(answer)} />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Type an accepted answer and press Add"
                    value={acceptedAnswerInput}
                    onChange={(e) => setAcceptedAnswerInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAcceptedAnswer())}
                    fullWidth
                  />
                  <Button variant="outlined" onClick={handleAddAcceptedAnswer}>
                    Add
                  </Button>
                </Stack>
                <FormControlLabel
                  sx={{ mt: 1 }}
                  control={
                    <Switch checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
                  }
                  label="Case sensitive"
                />
              </Box>
            )}

            {questionType === "number" && (
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Expected Answer"
                  type="number"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Tolerance (optional)"
                  type="number"
                  value={tolerance}
                  onChange={(e) => setTolerance(e.target.value)}
                  sx={{ flex: 1 }}
                  inputProps={{ min: 0 }}
                />
              </Stack>
            )}

            {questionType === "long_text" && (
              <Typography variant="body2" color="text.secondary">
                Students will get a free-form text box (up to 1000 characters). This question type is
                always graded manually.
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        {step === 2 && (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={16} /> : isEditing ? "Save Changes" : "Add Question"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default function QuizBuilder() {
  const { entityId } = useSchoolContext();
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = React.useState<QuizDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [classStructure, setClassStructure] = React.useState<ClassData[]>([]);
  const [templates, setTemplates] = React.useState<QuestionTemplate[]>([]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<QuizQuestion | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<QuizQuestion | null>(null);

  const [saveOpen, setSaveOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [revertOpen, setRevertOpen] = React.useState(false);
  const [reverting, setReverting] = React.useState(false);

  const [publishOpen, setPublishOpen] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [scheduledStart, setScheduledStart] = React.useState("");
  const [publishError, setPublishError] = React.useState("");

  const [actionError, setActionError] = React.useState("");

  const fetchQuiz = React.useCallback(async () => {
    if (!entityId || !quizId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${QUIZ_API}/detail`, { params: { entity_id: entityId, quiz_id: quizId } });
      if (res.data.success) {
        setQuiz(res.data.data);
      } else {
        setError(res.data.message || "Failed to load quiz");
      }
    } catch {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [entityId, quizId]);

  React.useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  React.useEffect(() => {
    if (!entityId) return;
    axios.get(`${CLASS_STRUCTURE_API}/?entity_id=${entityId}`).then((res) => {
      if (res.data.success) setClassStructure(res.data.data ?? []);
    });
    axios.get(`${QUESTION_TEMPLATES_API}/`).then((res) => {
      if (res.data.success) setTemplates(res.data.data ?? []);
    });
  }, [entityId]);

  const classNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    classStructure.forEach((cls) => (map[cls.class_id] = cls.class_name));
    return map;
  }, [classStructure]);

  const sectionNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    classStructure.forEach((cls) => cls.sections.forEach((s) => (map[s.section_id] = s.section_name)));
    return map;
  }, [classStructure]);

  const questionCount = quiz?.questions.length ?? 0;
  const isDraft = quiz?.status === "draft";
  const isReady = quiz?.status === "ready";
  const isPublished = quiz?.status === "published";
  const canSave = isDraft && questionCount >= QUIZ_MIN_QUESTIONS && questionCount <= QUIZ_MAX_QUESTIONS;

  const handleDeleteQuestion = async () => {
    if (!deleteTarget || !quiz) return;
    setActionError("");
    try {
      const res = await axios.delete(`${QUIZ_API}/question`, {
        data: { entity_id: entityId, quiz_id: quiz.quiz_id, question_id: deleteTarget.question_id },
      });
      if (res.data.success) {
        setDeleteTarget(null);
        await fetchQuiz();
      } else {
        setActionError(res.data.message || "Failed to delete question");
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to delete question");
    }
  };

  const handleSave = async () => {
    if (!quiz) return;
    setSaving(true);
    setActionError("");
    try {
      const res = await axios.post(`${QUIZ_API}/save`, { entity_id: entityId, quiz_id: quiz.quiz_id });
      if (res.data.success) {
        setSaveOpen(false);
        await fetchQuiz();
      } else {
        setActionError(res.data.message || "Failed to save quiz");
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleRevertToDraft = async () => {
    if (!quiz) return;
    setReverting(true);
    setActionError("");
    try {
      const res = await axios.post(`${QUIZ_API}/revert-to-draft`, { entity_id: entityId, quiz_id: quiz.quiz_id });
      if (res.data.success) {
        setRevertOpen(false);
        await fetchQuiz();
      } else {
        setActionError(res.data.message || "Failed to move quiz back to draft");
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to move quiz back to draft");
    } finally {
      setReverting(false);
    }
  };

  const handleOpenPublish = () => {
    setScheduledStart("");
    setPublishError("");
    setPublishOpen(true);
  };

  const handlePublish = async () => {
    if (!quiz) return;
    if (!scheduledStart) {
      setPublishError("Please choose when this quiz should go live");
      return;
    }
    if (new Date(scheduledStart).getTime() <= Date.now()) {
      setPublishError("The start date/time must be in the future");
      return;
    }

    setPublishing(true);
    setPublishError("");
    try {
      const res = await axios.post(`${QUIZ_API}/publish`, {
        entity_id: entityId,
        quiz_id: quiz.quiz_id,
        scheduled_start: scheduledStart,
      });
      if (res.data.success) {
        setPublishOpen(false);
        await fetchQuiz();
      } else {
        setPublishError(res.data.message || "Failed to publish quiz");
      }
    } catch (err: any) {
      setPublishError(err?.response?.data?.message || "Failed to publish quiz");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !quiz) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Quiz not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/school/${entityId}/quizzes`)}
          sx={{ mb: 1 }}
        >
          Back to Quizzes
        </Button>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h4">{quiz.title}</Typography>
              <Chip {...STATUS_CHIP_PROPS[quiz.status]} />
            </Stack>
            {quiz.description && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {quiz.description}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {classNameById[quiz.class_id] ?? quiz.class_id} - {sectionNameById[quiz.section_id] ?? quiz.section_id}
            </Typography>
            {isPublished && quiz.scheduled_start && (
              <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                Live from {formatScheduledStart(quiz.scheduled_start)}
              </Typography>
            )}
          </Box>

          <Stack alignItems="flex-end" spacing={1}>
            <Typography variant="body2" color={questionCount > QUIZ_MAX_QUESTIONS ? "error" : "text.secondary"}>
              {questionCount} / {QUIZ_MAX_QUESTIONS} questions
            </Typography>
            {isDraft && (
              <Button variant="contained" disabled={!canSave} onClick={() => setSaveOpen(true)}>
                Save
              </Button>
            )}
            {isReady && (
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setRevertOpen(true)}>
                  Back to Draft
                </Button>
                <Button variant="contained" color="success" onClick={handleOpenPublish}>
                  Publish Quiz
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>

        {isDraft && questionCount < QUIZ_MIN_QUESTIONS && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Add at least {QUIZ_MIN_QUESTIONS - questionCount} more question
            {QUIZ_MIN_QUESTIONS - questionCount === 1 ? "" : "s"} to be able to save this quiz as ready.
          </Alert>
        )}
        {isReady && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This quiz is ready. Publish it with a start date/time to make it live for students, or move it
            back to draft to keep editing questions.
          </Alert>
        )}
      </Box>

      {actionError && <Alert severity="error">{actionError}</Alert>}

      <Stack spacing={2}>
        {quiz.questions.map((question, index) => (
          <Paper key={question.question_id} variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip size="small" label={`Q${index + 1}`} />
                <Chip size="small" label={TYPE_LABELS[question.question_type]} variant="outlined" />
                <Chip size="small" label={`${question.marks} mark${question.marks === 1 ? "" : "s"}`} variant="outlined" />
              </Stack>
              {isDraft && (
                <Stack direction="row">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingQuestion(question);
                      setDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleteTarget(question)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>

            <Typography sx={{ mt: 1.5, mb: 1 }}>{question.question_text}</Typography>
            <Divider sx={{ mb: 1.5 }} />
            <QuestionPreview question={question} />
          </Paper>
        ))}

        {quiz.questions.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No questions added yet. Click "Add Question" to get started.
          </Typography>
        )}
      </Stack>

      {isDraft && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={questionCount >= QUIZ_MAX_QUESTIONS}
            onClick={() => {
              setEditingQuestion(null);
              setDialogOpen(true);
            }}
          >
            Add Question
          </Button>
          {questionCount >= QUIZ_MAX_QUESTIONS && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This quiz has reached the maximum of {QUIZ_MAX_QUESTIONS} questions.
            </Typography>
          )}
        </Box>
      )}

      <QuestionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        entityId={entityId}
        quizId={quiz.quiz_id}
        templates={templates}
        editingQuestion={editingQuestion}
        onSaved={fetchQuiz}
      />

      {/* Delete question confirmation */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteQuestion}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save (mark ready) confirmation */}
      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Saving marks this quiz as ready and locks question editing. You can still move it back to
            draft later if you need to make changes. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={16} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Back to draft confirmation */}
      <Dialog open={revertOpen} onClose={() => setRevertOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Move Back to Draft</DialogTitle>
        <DialogContent>
          <Typography>This will unlock the quiz so you can add, edit, or delete questions again. Continue?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevertOpen(false)} disabled={reverting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRevertToDraft} disabled={reverting}>
            {reverting ? <CircularProgress size={16} /> : "Move to Draft"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish dialog - requires a start date/time */}
      <Dialog open={publishOpen} onClose={() => setPublishOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Publish Quiz</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {publishError && <Alert severity="error">{publishError}</Alert>}
            <Typography>
              Choose when this quiz should start and become available to students. Publishing is final -
              you won't be able to edit questions afterwards.
            </Typography>
            <TextField
              label="Start date & time"
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishOpen(false)} disabled={publishing}>
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={handlePublish} disabled={publishing}>
            {publishing ? <CircularProgress size={16} /> : "Publish"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
