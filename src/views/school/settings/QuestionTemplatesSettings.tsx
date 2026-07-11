import * as React from "react";
import { Box } from "@mui/material";
import QuestionTemplateCatalog from "../../../components/QuestionTemplateCatalog";

export default function QuestionTemplatesSettings() {
  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3 }}>
      <QuestionTemplateCatalog
        description="These are the question types available for building quizzes in this school. Templates with objective answers (single/multiple choice, one word, number) are graded automatically; long text answers require manual review."
      />
    </Box>
  );
}
