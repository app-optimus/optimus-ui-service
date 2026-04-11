import * as React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

export default function EntityDetails({ formData, setFormData }) {
  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 0 }}>
          Basic Details
        </Typography>
      </Grid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="entity-name" required>
          School Name
        </FormLabel>
        <OutlinedInput
          id="entity-name"
          name="entity-name"
          type="name"
          placeholder="Delhi Public School"
          autoComplete="entity name"
          required
          size="small"
          value={formData.entityName}
          onChange={(e) =>
            setFormData({ ...formData, entityName: e.target.value })
          }
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="school-code" required>
          School Code
        </FormLabel>
        <OutlinedInput
          id="school-code"
          name="school-code"
          type="school-code"
          placeholder="DPS001"
          autoComplete="school code"
          required
          size="small"
          value={formData.schoolCode}
          onChange={(e) =>
            setFormData({ ...formData, schoolCode: e.target.value })
          }
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="address1" required>
          Address line 1
        </FormLabel>
        <OutlinedInput
          id="address1"
          name="address1"
          type="address1"
          placeholder="Street name and number"
          autoComplete="shipping address-line1"
          required
          size="small"
          value={formData.address1}
          onChange={(e) =>
            setFormData({ ...formData, address1: e.target.value })
          }
        />
      </FormGrid>
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="city" required>
          City
        </FormLabel>
        <OutlinedInput
          id="city"
          name="city"
          type="city"
          placeholder="New Delhi"
          autoComplete="City"
          required
          size="small"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
      </FormGrid>
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="state" required>
          State
        </FormLabel>
        <OutlinedInput
          id="state"
          name="state"
          type="state"
          placeholder="Delhi"
          autoComplete="State"
          required
          size="small"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        />
      </FormGrid>
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="zip" required>
          Zip / Postal code
        </FormLabel>
        <OutlinedInput
          id="zip"
          name="zip"
          type="zip"
          placeholder="110001"
          autoComplete="shipping postal-code"
          required
          size="small"
          value={formData.zip}
          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
        />
      </FormGrid>
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="country" required>
          Country
        </FormLabel>
        <OutlinedInput
          id="country"
          name="country"
          type="country"
          placeholder="India"
          autoComplete="shipping country"
          required
          size="small"
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
        />
      </FormGrid>
      <Grid size={{ xs: 12 }}>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 0 }}>
          Representative Details
        </Typography>
      </Grid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="head-name" required>
          School Head Name
        </FormLabel>
        <OutlinedInput
          id="head-name"
          name="head-name"
          type="name"
          placeholder="Mrs. Uma Tyagi"
          autoComplete="head name"
          required
          size="small"
          value={formData.headName}
          onChange={(e) =>
            setFormData({ ...formData, headName: e.target.value })
          }
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="head-email" required>
          School Head Email
        </FormLabel>
        <OutlinedInput
          id="head-email"
          name="head-email"
          type="head-email"
          placeholder="uma.tyagi@dps.com"
          autoComplete="head email"
          required
          size="small"
          value={formData.headEmail}
          onChange={(e) =>
            setFormData({ ...formData, headEmail: e.target.value })
          }
        />
      </FormGrid>
    </Grid>
  );
}
