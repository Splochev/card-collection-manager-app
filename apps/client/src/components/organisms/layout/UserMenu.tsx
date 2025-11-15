import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import ThemeSwitch from '../../atoms/ThemeSwitch';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setAccessToken } from '../../../stores/userSlice';
import type { RootState } from '../../../stores/store';
import { useLogto } from '@logto/react';
import { LOGTO_POST_LOGOUT_REDIRECT_URI } from '../../../constants';

const UserMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { signOut } = useLogto();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditUser = () => {
    // TODO: Implement edit user functionality
    console.log('Edit user clicked');
    handleClose();
  };

  const handleLogout = async () => {
    dispatch(setUser(null));
    dispatch(setAccessToken(null));
    handleClose();

    await signOut(LOGTO_POST_LOGOUT_REDIRECT_URI);
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="user menu"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Avatar>{user?.name?.[0]?.toUpperCase() || 'U'}</Avatar>
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'transparent',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleEditUser} sx={{ height: 48 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={(e) => e.stopPropagation()} sx={{ height: 48 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <ListItemText>Theme</ListItemText>
            <ThemeSwitch />
          </Box>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ height: 48 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
