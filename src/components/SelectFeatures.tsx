import * as React from "react";
import {
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const features = {
  dashboard: {
    header: "Dashboard",
    description:
      "An overview of student performance and key progress indicators",
  },
  studyMaterialUpload: {
    header: "Study Material Upload",
    description: "Easily upload and share study materials with students",
  },
  oneToOneSessions: {
    header: "One-to-One Sessions",
    description: "Schedule private sessions for personalized student support",
  },
  parentTeacherMeeting: {
    header: "Parent Teacher Meeting",
    description: "Organize meetings to discuss student progress with parents",
  },
};
const featureKeys = Object.keys(features);

export default function SelectFeatures({ formData, setFormData }) {
  const handleCheckboxChange = (feature: string) => {
    const updatedSelected = formData.selectedFeatures.includes(feature)
      ? formData.selectedFeatures.filter((f) => f !== feature)
      : [...formData.selectedFeatures, feature];

    setFormData({ ...formData, selectedFeatures: updatedSelected });
  };

  return (
    <Grid container spacing={4}>
      <FormGrid size={{ xs: 12 }}>
        <FormGroup>
          {featureKeys.map((feature) => (
            <FormControlLabel
              key={feature}
              control={
                <Checkbox
                  checked={formData.selectedFeatures.includes(feature)}
                  onChange={() => handleCheckboxChange(feature)}
                />
              }
              label={
                <Typography variant="body1" fontWeight={500}>
                  {features[feature].header}{" "}
                  <span
                    style={{
                      fontStyle: "italic",
                      fontWeight: "normal",
                      color: "#666",
                    }}
                  >
                    ({features[feature].description})
                  </span>
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </FormGrid>
    </Grid>
  );
}
