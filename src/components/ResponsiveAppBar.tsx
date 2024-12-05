import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import worldImage from '../images/world.png';
import { jwtDecode } from 'jwt-decode';

type Funcionalidades = {
  name: string;
  url: string;
};

interface MyJwtPayload {
  rol: string[];
  profileImage: string;
  organization: string;
}

const pages = [
  { name: 'Inicio', path: '' },
  { name: 'ODS', path: 'objetives' },
  { name: 'Publicaciones', path: 'publicaciones' },
  { name: 'Eventos', path: 'eventos' },
  { name: 'Encuestas', path: 'encuestas' }
];

function ResponsiveAppBar({ profileImage }: { profileImage: string }) {
  const DEFAULT_PROFILE_IMAGE: string = process.env.REACT_APP_DEFAULT_PROFILE_IMAGE || '';
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode<MyJwtPayload>(token) : null;
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidades[]>([]);
  const [sourceImage, setSourceImage] = useState(profileImage ?? process.env.REACT_APP_DEFAULT_PROFILE_IMAGE);

  const [settings, setSettings] = useState<string[]>(() => {
    if (decodedToken) {
      const isSuperAdmin = decodedToken.rol.includes("admin") && decodedToken.organization === undefined;
      const isAdmin = decodedToken.rol.includes("admin");
      const isModerator = decodedToken.rol.includes("moderator");
      if (isSuperAdmin) {
        return ['Perfil', 'Admin usuarios', 'Admin organizaciones', 'Admin ODS', 'Cerrar Sesión'];
      } else if (isAdmin && isModerator) {
        return ['Perfil', 'Mis publicaciones', 'Admin usuarios', 'Cerrar Sesión'];
      } else if (isAdmin) {
        return ['Perfil', 'Admin usuarios', 'Cerrar Sesión'];
      } else if (isModerator) {
        return ['Perfil', 'Mis publicaciones', 'Cerrar Sesión'];
      } else {
        return ['Perfil', 'Cerrar Sesión'];
      }
    }
    return ['Iniciar Sesión'];
  });

  const authPages = [...pages];
  const finalPages = token ? authPages : pages;
  const navigate = useNavigate();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (setting: string) => {
    setAnchorElUser(null);
    switch (setting) {
      case 'Perfil':
        navigate(`/perfil`);
        break;
      case 'Mis publicaciones':
        navigate('/misPublicaciones');
        window.location.reload();
        break;
      case 'Admin usuarios':
        navigate('/usuarios');
        break;
      case 'Admin organizaciones':
        navigate('/Organizations');
        break;
      case 'Admin ODS':
        navigate('/adminOds');
        break;
      case 'Cerrar Sesión':
        localStorage.clear();
        setSourceImage(DEFAULT_PROFILE_IMAGE);
        navigate(`/login`);
        break;
      case 'Iniciar Sesión':
        navigate(`/login`);
        break;
      default:
    }
  };

  const handleNavClick = (path: string) => {
    handleCloseNavMenu();
    navigate(`/${path}`);
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(to right, #00796B, #004D40)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <img src={worldImage} alt="Logo Loja Sostenible" className='h-8 mx-4' />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              display: { xs: 'none', md: 'flex' },
              fontWeight: 600,
              fontSize: 20,
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '0.05rem',
            }}
          >
            Loja Sostenible
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: '30px' }}>
            {finalPages.map((page) => (
              <Button
                key={page.path}
                onClick={() => handleNavClick(page.path)}
                sx={{
                  my: 2,
                  color: '#ffffff',
                  display: 'block',
                  '&:hover': {
                    color: '#ffcc00',
                    borderBottom: '2px solid #ffcc00',
                  },
                  transition: 'color 0.3s ease, border-bottom 0.3s ease',
                }}
                component={Link}
                to={`/${page.path}`}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Abrir configuraciones">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt="ImagenPerfil"
                  src={sourceImage}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
