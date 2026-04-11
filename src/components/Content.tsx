import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import { SitemarkIcon } from './CustomIcons';

const items = [
  {
    icon: <DashboardCustomizeRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Comprehensive Student Performance Dashboard',
    description:
      'Provides real-time visual insights and detailed analytics on student progress across all exams and subjects.',
  },
  {
    icon: <ManageAccountsRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Smart User Management',
    description:
      'Enables secure role-based access and easy management of student and user data for teachers, parents, and students.',
  },
  {
    icon: <AnalyticsRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Section-Level Comparative Analytics',
    description:
      'Offers aggregated comparisons of academic performance between different sections within each class or grade.',
  },
  {
    icon: <HourglassBottomRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'More Features Coming Soon',
    description:
      'Continuously evolving platform with upcoming features designed to enhance school management and learning.',
  },
];

export default function Content() {
  return (
    <Stack
      sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}
    >
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <SitemarkIcon />
      </Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}