import * as React from "react";
import { Box } from "@mui/material";
import QuestionTemplateCatalog from "../components/QuestionTemplateCatalog";

export default function QuestionTemplates() {
  return (
    <Box sx={{ p: 3 }}>
      <QuestionTemplateCatalog />
    </Box>
  );
}
