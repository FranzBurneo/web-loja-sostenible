import worldImage from '../../../images/world.png';
import { Box, Typography, IconButton } from "@mui/material";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#333',
        color: '#fff',
        padding: '10px 0', // Ajuste de padding más pequeño
        textAlign: 'center',
        mt: 'auto',
        fontSize: '0.875rem' // Tamaño de fuente más pequeño para compactar
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px', // Menor espacio entre los elementos
        }}
      >
        <img src={worldImage} alt="Logo Loja Sostenible" className="h-5 w-5" /> {/* Imagen más pequeña */}
        <Typography variant="body2" sx={{ color: '#ccc' }}>
          Copyright &copy; {currentYear} | Loja Sostenible
        </Typography>
      </Box>
      <Box>
        <IconButton
          aria-label="Facebook"
          href="https://facebook.com"
          target="_blank"
          sx={{ color: '#ccc', padding: '5px' }} // Iconos con menor padding
        >
          <FacebookIcon fontSize="small" /> {/* Iconos más pequeños */}
        </IconButton>
        <IconButton
          aria-label="Twitter"
          href="https://twitter.com"
          target="_blank"
          sx={{ color: '#ccc', padding: '5px' }}
        >
          <TwitterIcon fontSize="small" />
        </IconButton>
        <IconButton
          aria-label="LinkedIn"
          href="https://linkedin.com"
          target="_blank"
          sx={{ color: '#ccc', padding: '5px' }}
        >
          <LinkedInIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Footer;
