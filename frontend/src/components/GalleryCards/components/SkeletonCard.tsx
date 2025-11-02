import { Box, Skeleton } from '@mui/material';

export const SkeletonCard = () => {
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 2,
        boxShadow: '0 4px 24px #0002',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Skeleton
        variant="rectangular"
        height={300}
        sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      />
      <Box sx={{ p: 3, flex: 1 }}>
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="30%" />
      </Box>
    </Box>
  );
};