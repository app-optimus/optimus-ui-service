import * as React from "react";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

interface ReviewProps {
  formData: {
    entityName: string;
    schoolCode: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    headName: string;
    headEmail: string;
    selectedFeatures: string[];
  };
}

const displayValue = (value: string | undefined) => {
  return value?.trim() ? value : "-";
};

const featureLabels: Record<string, string> = {
  dashboard: "Dashboard",
  studyMaterialUpload: "Study Material Upload",
  oneToOneSessions: "One-to-One Sessions",
  parentTeacherMeeting: "Parent Teacher Meeting",
};

export default function Review({ formData }: ReviewProps) {
  return (
    <Grid container spacing={4} height="100%" overflow="auto">
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2">Basic Details</Typography>
      </Grid>

      <FormGrid size={{ xs: 6, md: 5 }}>
        <Typography variant="caption">School Name</Typography>
        <Typography>{formData.entityName}</Typography>
      </FormGrid>

      <FormGrid size={{ xs: 4, md: 4 }}>
        <Typography variant="caption">School Code</Typography>
        <Typography>{displayValue(formData.schoolCode)}</Typography>
      </FormGrid>

      <Grid size={{ xs: 12 }}>
        <Divider />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2">School Address</Typography>
      </Grid>

      <FormGrid size={{ xs: 6, md: 5 }}>
        <Typography variant="caption">Address</Typography>
        <Typography>{displayValue(formData.address1)}</Typography>
      </FormGrid>

      <FormGrid size={{ xs: 4, md: 5 }}>
        <Typography variant="caption">City</Typography>
        <Typography>{displayValue(formData.city)}</Typography>
      </FormGrid>

      <FormGrid size={{ xs: 2 }}>
        <Typography variant="caption">State</Typography>
        <Typography>{displayValue(formData.state)}</Typography>
      </FormGrid>

      <FormGrid size={{ xs: 6, md: 5 }}>
        <Typography variant="caption">Zip</Typography>
        <Typography>{displayValue(formData.zip)}</Typography>
      </FormGrid>

      <FormGrid size={{ xs: 6, md: 5 }}>
        <Typography variant="caption">Country</Typography>
        <Typography>{displayValue(formData.country)}</Typography>
      </FormGrid>

      <Grid size={{ xs: 12 }}>
        <Divider />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2">Representative Details</Typography>
      </Grid>

      <FormGrid size={{ xs: 12, md: 5 }}>
        <Typography variant="caption">School Head Name</Typography>
        <Typography>{formData.headName}</Typography>
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 5 }}>
        <Typography variant="caption">School Head Email</Typography>
        <Typography>{formData.headEmail}</Typography>
      </FormGrid>

      <Grid size={{ xs: 12 }}>
        <Divider />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2">Selected Features</Typography>
        <Stack spacing={1} mt={1}>
          {formData.selectedFeatures.length > 0 ? (
            formData.selectedFeatures.map((featureKey) => (
              <Typography key={featureKey}>
                • {featureLabels[featureKey]}
              </Typography>
            ))
          ) : (
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              -
            </Typography>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
