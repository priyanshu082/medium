import Alert from '@mui/material/Alert';

interface message{
    message:string,
    type:any
}

export default function SimpleAlert({message,type} :message) {
  return (
    <Alert severity={type} >
      {message}
    </Alert>
  );
}
