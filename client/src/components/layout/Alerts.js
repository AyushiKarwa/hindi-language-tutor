import React, { useContext } from 'react';
import AlertContext from '../../context/alert/alertContext';
import { Alert, Snackbar, Stack } from '@mui/material';

const Alerts = () => {
  const alertContext = useContext(AlertContext);
  const { alerts } = alertContext;

  return (
    <Stack sx={{ width: '100%', position: 'fixed', top: 20, zIndex: 9999 }}>
      {alerts.length > 0 &&
        alerts.map(alert => (
          <Snackbar
            key={alert.id}
            open={true}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              severity={alert.type} 
              variant="filled"
              sx={{ width: '100%', mb: 1 }}
            >
              {alert.msg}
            </Alert>
          </Snackbar>
        ))}
    </Stack>
  );
};

export default Alerts; 