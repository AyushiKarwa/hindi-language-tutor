import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          Hindi Language Tutor - Learn Hindi with AI
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          &copy; {new Date().getFullYear()} Hindi Language Tutor. All rights reserved.
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          <Link href="#" color="inherit" sx={{ mx: 1 }}>Privacy Policy</Link>
          <Link href="#" color="inherit" sx={{ mx: 1 }}>Terms of Service</Link>
          <Link href="#" color="inherit" sx={{ mx: 1 }}>Contact Us</Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 