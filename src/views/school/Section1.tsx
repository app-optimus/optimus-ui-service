import * as React from "react";
import axios from "axios";
import { Box, Typography, Paper, CircularProgress, Alert, Grid, Stack, Divider } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import QuizIcon from "@mui/icons-material/Quiz";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSchoolContext } from "../../components/SchoolLayout";

const API_BASE = "http://localhost:8000/user/dashboard";

interface SectionCount {
  section_id: string;
  section_name: string;
  student_count: number;
}

interface ClassCount {
  class_id: string;
  class_name: string;
  sections: SectionCount[];
}

interface HeadcountSummary {
  student_count: number;
  teacher_count: number;
}

interface QuizSummary {
  draft_count: number;
  ready_count: number;
  published_count: number;
}

// A single stat within a dashboard card (e.g. "Students: 240").
interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
}

// Generic dashboard card shell so additional summary cards can be dropped
// into the same grid without re-building the layout each time.
function DashboardCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function StatRow({ stats }: { stats: StatItem[] }) {
  return (
    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={3}>
      {stats.map((stat) => (
        <Stack key={stat.label} spacing={0.5} alignItems="flex-start" sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            {stat.icon}
            <Typography variant="body2">{stat.label}</Typography>
          </Stack>
          <Typography variant="h4" fontWeight={600}>
            {stat.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function HeadcountSummaryCard() {
  const { entityId } = useSchoolContext();
  const [summary, setSummary] = React.useState<HeadcountSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!entityId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/headcount-summary`, {
          params: { entity_id: entityId },
        });
        if (res.data.success) {
          setSummary(res.data.data ?? { student_count: 0, teacher_count: 0 });
        } else {
          setError(res.data.message || "Failed to load headcount summary");
        }
      } catch {
        setError("Failed to load headcount summary");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <StatRow
      stats={[
        { label: "Students", value: summary?.student_count ?? 0, icon: <SchoolIcon fontSize="small" /> },
        {
          label: "Teachers",
          value: summary?.teacher_count ?? 0,
          icon: <GroupsIcon fontSize="small" />,
        },
      ]}
    />
  );
}

function QuizSummaryCard() {
  const { entityId } = useSchoolContext();
  const [summary, setSummary] = React.useState<QuizSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!entityId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/quiz-summary`, {
          params: { entity_id: entityId },
        });
        if (res.data.success) {
          setSummary(res.data.data ?? { draft_count: 0, ready_count: 0, published_count: 0 });
        } else {
          setError(res.data.message || "Failed to load quiz summary");
        }
      } catch {
        setError("Failed to load quiz summary");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <StatRow
      stats={[
        { label: "Draft", value: summary?.draft_count ?? 0, icon: <EditNoteIcon fontSize="small" /> },
        { label: "Ready", value: summary?.ready_count ?? 0, icon: <HourglassTopIcon fontSize="small" /> },
        {
          label: "Published",
          value: summary?.published_count ?? 0,
          icon: <CheckCircleIcon fontSize="small" />,
        },
      ]}
    />
  );
}

function StudentsBySectionChart() {
  const { entityId } = useSchoolContext();
  const [classes, setClasses] = React.useState<ClassCount[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!entityId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/student-section-counts`, {
          params: { entity_id: entityId },
        });
        if (res.data.success) {
          setClasses(res.data.data ?? []);
        } else {
          setError(res.data.message || "Failed to load dashboard data");
        }
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityId]);

  // Section names aren't guaranteed to line up across classes, so we build
  // the union of every section name seen and treat each one as its own
  // series, defaulting to 0 for classes that don't have that section.
  const { dataset, sectionNames } = React.useMemo(() => {
    const sectionNameSet = new Set<string>();
    classes.forEach((cls) =>
      cls.sections.forEach((section) => sectionNameSet.add(section.section_name))
    );
    const sectionNames = Array.from(sectionNameSet);

    const dataset = classes.map((cls) => {
      const row: Record<string, string | number> = { class_name: cls.class_name };
      sectionNames.forEach((name) => {
        row[name] = 0;
      });
      cls.sections.forEach((section) => {
        row[section.section_name] = section.student_count;
      });
      return row;
    });

    return { dataset, sectionNames };
  }, [classes]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (dataset.length === 0) {
    return (
      <Typography color="text.secondary">
        No classes found for this school yet. Add classes and sections from Settings to see this chart.
      </Typography>
    );
  }

  return (
    <BarChart
      dataset={dataset}
      xAxis={[{ scaleType: "band", dataKey: "class_name", label: "Class" }]}
      yAxis={[{ label: "Number of Students" }]}
      series={sectionNames.map((name) => ({
        dataKey: name,
        label: `${name}`,
      }))}
      height={400}
    />
  );
}

export default function Section1() {
  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        height: "100%",
        overflow: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Summary cards - add more Grid items here as new dashboards are built. */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard title="Head Count" icon={<PeopleAltIcon color="primary" />}>
            <HeadcountSummaryCard />
          </DashboardCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard title="Quizzes" icon={<QuizIcon color="primary" />}>
            <QuizSummaryCard />
          </DashboardCard>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Students per Class, by Section
        </Typography>
        <StudentsBySectionChart />
      </Paper>
    </Box>
  );
}
