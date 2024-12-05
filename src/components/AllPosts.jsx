import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views-react-18-fix';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Publications from './Publications';
import Forms from './Forms';
import Fab from '@mui/material/Fab';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AddIcon from '@mui/icons-material/Add';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function AllPosts({ onlyOwnPosts }) {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  // Función para manejar el clic en el botón
  const handleButtonClick = () => {
    // Redirigir al usuario a otra ruta
    navigate( value === 0 ? "/createPost" : "/createForm");
  };

  return (
    <Box sx={{ bgcolor: '#eaecf1', width: '100%', color: 'white', display:'flex', flexDirection: 'column' }}>
      {
        onlyOwnPosts ? 
          <AppBar position="static" className='flex w-full mx-auto max-w-min justify-center mt-4 '> 
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="secondary"
              textColor="inherit"
            >
              <Tab label={onlyOwnPosts ? "Publicaciones" : "Publicaciones"} {...a11yProps(0)}  />
              <Tab label={onlyOwnPosts ? "Encuestas" : "Encuestas"} {...a11yProps(1)} />
            </Tabs>
          </AppBar>
          : null
      }
      
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <Publications onlyOwnPosts={onlyOwnPosts}/>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <Forms onlyOwnPosts={onlyOwnPosts}/>
        </TabPanel>
      </SwipeableViews>
      
      {
        decodedToken && decodedToken.rol.includes("moderator") ? (
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 70, right: 16 }}
            onClick={handleButtonClick}
          >
            <AddIcon />
          </Fab>
        ) : null
      }      
    </Box>
  );
}
