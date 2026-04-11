import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function Section1() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Section 1
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This is a placeholder for Section 1 content.
      </Typography>
    </Box>
  );
}
