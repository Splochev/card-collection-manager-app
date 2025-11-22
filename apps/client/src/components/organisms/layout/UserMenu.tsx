import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import ThemeSwitch from '../../atoms/ThemeSwitch';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setAccessToken } from '../../../stores/userSlice';
import type { RootState } from '../../../stores/store';
import { useLogto } from '@logto/react';
import { LOGTO_POST_LOGOUT_REDIRECT_URI } from '../../../constants';

const STYLES = {
  menu: {
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
  },
  menuItem: { height: 48 },
  themeMenuItemBox: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: 2,
    justifyContent: 'start',
  },
  reverseRow: {
    flexDirection: 'row-reverse',
  },
};

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
    handleClose();
  };

  const handleLogout = async () => {
    dispatch(setUser(null));
    dispatch(setAccessToken(null));
    handleClose();

    await signOut(LOGTO_POST_LOGOUT_REDIRECT_URI);
  };

  const menuItems = [
    {
      icon: EditIcon,
      label: 'Edit User',
      onClick: handleEditUser,
    },
    {
      onClick: (e: React.MouseEvent<HTMLElement>) => e.stopPropagation(),
      isBox: true,
      label: 'Theme',
      icon: ThemeSwitch,
    },
    {
      icon: LogoutIcon,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

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
        slotProps={STYLES.menu}
      >
        {menuItems.map((item, index) => (
          <MenuItem key={index} onClick={item.onClick} sx={STYLES.menuItem}>
            <Box
              sx={{
                ...STYLES.themeMenuItemBox,
                ...(item.isBox ? STYLES.reverseRow : {}),
              }}
            >
              <item.icon />
              <Typography>{item.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default UserMenu;
