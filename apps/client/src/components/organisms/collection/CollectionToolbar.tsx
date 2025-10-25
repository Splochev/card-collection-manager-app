import {
  Box,
  Select,
  MenuItem,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import {
  SwapVert as SwapVertIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../stores/store';
import {
  setGroupBy,
  setOrderBy,
  toggleSortType,
  setViewMode,
  type GroupByType,
  type OrderByType,
  type ViewMode,
} from '../../../stores/collectionSlice';

interface CollectionToolbarProps {
  onRefresh?: () => void;
}

const CollectionToolbar = ({ onRefresh }: CollectionToolbarProps) => {
  const dispatch = useDispatch();
  const { groupBy, orderBy, sortType, viewMode } = useSelector(
    (state: RootState) => state.collection
  );

  const handleGroupByChange = (event: SelectChangeEvent) => {
    dispatch(setGroupBy(event.target.value as GroupByType));
  };

  const handleOrderByChange = (event: SelectChangeEvent) => {
    dispatch(setOrderBy(event.target.value as OrderByType));
  };

  const handleSortToggle = () => {
    dispatch(toggleSortType());
  };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      dispatch(setViewMode(newMode));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        padding: { xs: 1.5, sm: 2 },
        gap: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5, md: 2 },
          flexWrap: 'nowrap',
          width: { xs: '100%', sm: 'auto' },
          flex: { sm: 1 },
        }}
      >
        <FormControl
          size="small"
          sx={{
            minWidth: { xs: 100, sm: 130, md: 150 },
            flex: { xs: 1, sm: '0 1 auto' },
          }}
        >
          <InputLabel id="group-by-label">Group by:</InputLabel>
          <Select
            labelId="group-by-label"
            value={groupBy}
            label="Group by:"
            onChange={handleGroupByChange}
          >
            <MenuItem value="cardName">Card Name</MenuItem>
            <MenuItem value="setName">Set Name</MenuItem>
            <MenuItem value="setCode">Set Code</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            minWidth: { xs: 100, sm: 130, md: 150 },
            flex: { xs: 1, sm: '0 1 auto' },
          }}
        >
          <InputLabel id="sort-by-label">Sort by:</InputLabel>
          <Select
            labelId="sort-by-label"
            value={orderBy}
            label="Sort by:"
            onChange={handleOrderByChange}
          >
            <MenuItem value="cardName">Card Name</MenuItem>
            <MenuItem value="setName">Set Name</MenuItem>
            <MenuItem value="setCode">Set Code</MenuItem>
            <MenuItem value="count">Count</MenuItem>
          </Select>
        </FormControl>

        <IconButton
          onClick={handleSortToggle}
          color="primary"
          size="small"
          sx={{
            transform: sortType === 'DESC' ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
            flexShrink: 0,
          }}
          aria-label={`Sort ${sortType === 'ASC' ? 'ascending' : 'descending'}`}
        >
          <SwapVertIcon />
        </IconButton>
      </Box>

      {/* Right Side */}
      <Box
        sx={{
          alignSelf: { xs: 'flex-end', sm: 'auto' },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {onRefresh && (
          <IconButton
            onClick={onRefresh}
            color="primary"
            size="small"
            aria-label="refresh collection"
          >
            <RefreshIcon />
          </IconButton>
        )}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default CollectionToolbar;
