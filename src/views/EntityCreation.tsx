import * as React from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EntityDetails from "../components/EntityDetails";
import Typography from "@mui/material/Typography";
import SelectFeatures from "../components/SelectFeatures";
import Review from "../components/Review";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";

const API_BASE = "http://localhost:8000/user/entity";

const steps = ["School Details", "Select Features", "Review"];
const requiredFields = [
  { key: "entityName", label: "School Name" },
  { key: "schoolCode", label: "School Code" },
  { key: "address1", label: "Address Line 1" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip", label: "Zip / Postal code" },
  { key: "country", label: "Country" },
  { key: "headName", label: "School Head Name" },
  { key: "headEmail", label: "School Head Email" },
];
const defaultFormData = {
  entityName: "",
  schoolCode: "",
  address1: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  headName: "",
  headEmail: "",
  selectedFeatures: [],
};

export default function EntityCreation(props: {
  disableCustomTheme?: boolean;
}) {
  const [formData, setFormData] = React.useState(defaultFormData);

  const [activeStep, setActiveStep] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  function validate() {
    if (!formData.entityName) return "Please enter School Name";
    if (!formData.schoolCode) return "Please enter School Code";
    if (!formData.address1) return "Please enter Address line 1";
    if (!formData.city) return "Please enter City";
    if (!formData.state) return "Please enter State";
    if (!formData.zip) return "Please enter Zip / Postal code";
    if (!formData.country) return "Please enter Country";
    if (!formData.headName) return "Please enter School Head Name";
    if (!formData.headEmail) return "Please enter School Head Email";
    return "";
  }

  const handleSubmitEntity = async () => {
    setSubmitting(true);
    const payload = {
      name: formData.entityName,
      code: formData.schoolCode,
      address: formData.address1,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip,
      country: formData.country,
      head_name: formData.headName,
      head_email: formData.headEmail,
      selected_features: formData.selectedFeatures,
    };
    try {
      const res = await axios.post(API_BASE + "/", payload);
      if (res.data.success) {
        setSuccessMessage(res.data.message || "Entity created successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setActiveStep(0);
        setFormData(defaultFormData);
      } else {
        setErrorMessage(res.data.message || "Failed to create entity");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to create entity";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const error = validate();
      if (error) {
        setErrorMessage(error);
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }
    } else if (activeStep === steps.length - 1) {
      handleSubmitEntity();
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return <EntityDetails formData={formData} setFormData={setFormData} />;
      case 1:
        return <SelectFeatures formData={formData} setFormData={setFormData} />;
      case 2:
        return <Review formData={formData} />;
      default:
        throw new Error("Unknown step");
    }
  }

  return (
    <Stack>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // height: "100vh",
        }}
      >
        <AppTheme {...props}>
          <CssBaseline enableColorScheme />
          <Box sx={{ position: "fixed", top: "1rem", right: "1rem" }}>
            <ColorModeIconDropdown />
          </Box>

          <Stack direction="row" justifyContent="space-between">
            <Stack direction="column" spacing="16px" flexGrow={1}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { sm: "space-between", md: "flex-end" },
                  alignItems: "center",
                  width: "100%",
                  maxWidth: { sm: "100%", md: 600 },
                }}
              >
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexGrow: 1,
                  }}
                >
                  <Stepper
                    id="desktop-stepper"
                    activeStep={activeStep}
                    sx={{ width: "100%", height: 40 }}
                  >
                    {steps.map((label) => (
                      <Step
                        sx={{
                          ":first-child": { pl: 0 },
                          ":last-child": { pr: 0 },
                        }}
                        key={label}
                      >
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  width: "100%",
                  maxWidth: { sm: "100%", md: 600 },
                  maxHeight: "720px",
                  gap: { xs: 5, md: "none" },
                }}
              >
                {errorMessage && (
                  <Box
                    sx={{
                      position: "fixed",
                      top: 15,
                      left: "60%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#f44336",
                      color: "white",
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                      boxShadow: 3,
                      zIndex: 9999,
                      pointerEvents: "none",
                    }}
                  >
                    {errorMessage}
                  </Box>
                )}
                {successMessage && (
                  <Box
                    sx={{
                      position: "fixed",
                      top: 15,
                      left: "60%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#4caf50",
                      color: "white",
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                      boxShadow: 3,
                      zIndex: 9999,
                      pointerEvents: "none",
                    }}
                  >
                    {successMessage}
                  </Box>
                )}
                {activeStep === steps.length ? (
                  <Stack spacing={2} useFlexGap></Stack>
                ) : (
                  <React.Fragment>
                    {getStepContent(activeStep)}
                    <Stack
                      direction="row"
                      justifyContent={activeStep ? "space-between" : "flex-end"}
                      spacing="16px"
                    >
                      {activeStep !== 0 && (
                        <Button
                          startIcon={<ChevronLeftRoundedIcon />}
                          onClick={handleBack}
                          variant="text"
                          sx={{ display: { xs: "none", sm: "flex" } }}
                        >
                          Back
                        </Button>
                      )}
                      {activeStep !== 0 && (
                        <Button
                          startIcon={<ChevronLeftRoundedIcon />}
                          onClick={handleBack}
                          variant="outlined"
                          fullWidth
                          sx={{ display: { xs: "flex", sm: "none" } }}
                        >
                          Back
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ChevronRightRoundedIcon />}
                        onClick={handleNext}
                        disabled={submitting}
                        sx={{ width: { xs: "100%", sm: "fit-content" } }}
                      >
                        {activeStep === steps.length - 1 ? "Save" : "Next"}
                      </Button>
                    </Stack>
                  </React.Fragment>
                )}
              </Box>
            </Stack>
          </Stack>
        </AppTheme>
      </div>
    </Stack>
  );
}
