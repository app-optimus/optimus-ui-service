import * as React from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Stack,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  TextField,
} from "@mui/material";

const API_BASE = "http://localhost:8000/user/question-templates";

type GradingMode = "auto" | "manual";

interface QuestionTemplate {
  template_id: string;
  template_code: string;
  template_name: string;
  description: string;
  default_grading_mode: GradingMode;
  config_schema: Record<string, unknown>;
  sample_question: {
    question_text: string;
    options?: string[];
    answer?: string | number | string[] | null;
  };
  display_order: number;
}

// Renders the sample question using the same input control a student would
// see for that template, so the catalog doubles as a live preview.
function SamplePreview({ template }: { template: QuestionTemplate }) {
  const { sample_question: sample } = template;

  switch (template.template_code) {
    case "single_choice":
      return (
        <RadioGroup value={sample.answer ?? ""}>
          {(sample.options ?? []).map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio size="small" disabled checked={option === sample.answer} />}
              label={option}
            />
          ))}
        </RadioGroup>
      );

    case "multiple_choice": {
      const selected = Array.isArray(sample.answer) ? sample.answer : [];
      return (
        <Stack>
          {(sample.options ?? []).map((option) => (
            <FormControlLabel
              key={option}
              control={<Checkbox size="small" disabled checked={selected.includes(option)} />}
              label={option}
            />
          ))}
        </Stack>
      );
    }

    case "one_word":
      return (
        <TextField
          size="small"
          value={sample.answer ?? ""}
          disabled
          fullWidth
          placeholder="Student's one word answer"
        />
      );

    case "number":
      return (
        <TextField
          type="number"
          size="small"
          value={sample.answer ?? ""}
          disabled
          fullWidth
          placeholder="Student's numeric answer"
        />
      );

    case "long_text":
      return (
        <TextField
          size="small"
          value=""
          disabled
          fullWidth
          multiline
          minRows={3}
          placeholder="Student's free-form answer"
          helperText="Max 1000 characters - graded manually"
        />
      );

    default:
      return null;
  }
}

function TemplateCard({ template }: { template: QuestionTemplate }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Stack spacing={1.5} sx={{ height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography variant="h6">{template.template_name}</Typography>
          <Chip
            size="small"
            label={template.default_grading_mode === "auto" ? "Auto-graded" : "Manually graded"}
            color={template.default_grading_mode === "auto" ? "success" : "warning"}
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {template.description}
        </Typography>

        <Divider />

        <Typography variant="subtitle2">Sample question</Typography>
        <Typography variant="body2">{template.sample_question.question_text}</Typography>

        <Box sx={{ pt: 0.5 }}>
          <SamplePreview template={template} />
        </Box>
      </Stack>
    </Paper>
  );
}

/**
 * Fetches and renders the global catalog of quiz question templates. Used
 * both by the global "Question Templates" page and the entity-level
 * Settings > Question Templates page - the catalog itself isn't school
 * specific, so both call sites simply render the same list for reference.
 */
export default function QuestionTemplateCatalog({
  title = "Question Templates",
  description = "These are the question types currently supported for building quizzes. Templates with objective answers (single/multiple choice, one word, number) are graded automatically; long text answers require manual review.",
}: {
  title?: string;
  description?: string;
}) {
  const [templates, setTemplates] = React.useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/`);
        if (res.data.success) {
          setTemplates(res.data.data ?? []);
        } else {
          setError(res.data.message || "Failed to load question templates");
        }
      } catch {
        setError("Failed to load question templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && templates.length === 0 && (
        <Typography color="text.secondary">No question templates have been configured yet.</Typography>
      )}

      {!loading && !error && templates.length > 0 && (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid key={template.template_id} size={{ xs: 12, sm: 6, md: 4 }}>
              <TemplateCard template={template} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
