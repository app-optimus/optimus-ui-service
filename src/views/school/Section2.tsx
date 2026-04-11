import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function Section2() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Section 2
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This is a placeholder for Section 2 content.
      </Typography>
    </Box>
  );
}
