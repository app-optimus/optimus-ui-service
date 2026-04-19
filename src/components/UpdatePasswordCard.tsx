import * as React from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
//import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';





const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function UpdatePasswordCard() {
  const navigate = useNavigate();  
  const { email } = useAuth();
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const [apiMessage, setApiMessage] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState<boolean | null>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const oldPassword = data.get('oldPassword');
    const newPassword = data.get('newPassword');

    const url = `http://localhost:8000/user/password`;
    const payload = {
        user_email: email,
        old_password: oldPassword,
        new_password: newPassword
    };
    try {
      const responseData = await axios.patch(url, payload);
      setIsSuccess(true);
      setApiMessage(responseData.data.message || 'Password updated successfully!');
      navigate('/');
    } catch (error) {
      setIsSuccess(false);
      const response = error?.["response"]
      setApiMessage(response?.["data"]["message"] || "something went wrong!");
    }
  };

  const validateInputs = () => {
    const oldPassword = document.getElementById('old-password') as HTMLInputElement;
    const newPassword = document.getElementById('new-password') as HTMLInputElement;

    let isValid = true;

    if (!oldPassword.value) {
        setPasswordError(true);
        setPasswordErrorMessage('Please enter your old password')
        isValid = false;
    }
    else if (!newPassword.value || newPassword.value.length < 6) {
        setPasswordError(true);
        setPasswordErrorMessage('New Password must be at least 6 characters long.');
        isValid = false;
    }
    else if (oldPassword.value === newPassword.value){
        setPasswordError(true);
        setPasswordErrorMessage('Old and new passwords cannot be same.');
        isValid = false;
    }
     else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <Card variant="outlined">
      {apiMessage && (
        <Box
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 'bold',
            color: isSuccess ? 'success.main' : 'error.main',
          }}
        >
          {apiMessage}
        </Box>
      )}
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >
        Update Password
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            id="email"
            type="email"
            name="email"
            defaultValue={email}
            autoFocus
            disabled
            fullWidth
            variant="outlined"
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Old Password</FormLabel>
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="oldPassword"
            placeholder="••••••"
            type="password"
            id="old-password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">New Password</FormLabel>
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="newPassword"
            placeholder="••••••"
            type="password"
            id="new-password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
          />
        </FormControl>
        <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
          Update
        </Button>
      </Box>
    </Card>
  );
}