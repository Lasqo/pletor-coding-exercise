const shimmerStyle = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

function SkeletonBox({
  height,
  width = '100%',
  borderRadius = 4,
}: {
  height: number | string;
  width?: number | string;
  borderRadius?: number;
}) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function ImageCardSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div
        style={{
          boxShadow: '0 4px 24px #0002',
          borderRadius: 16,
          padding: 0,
          background: '#fff',
          overflow: 'hidden',
          border: '1px solid #eee',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image placeholder - matches ImageCard aspect ratio */}
        <div style={{ width: '100%', aspectRatio: '4 / 3' }}>
          <SkeletonBox height="100%" borderRadius={0} />
        </div>

        <div
          style={{
            padding: 24,
            paddingTop: 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          {/* Title */}
          <SkeletonBox height={28} width="70%" borderRadius={6} />
          {/* By user */}
          <SkeletonBox height={20} width="40%" borderRadius={4} />
          {/* Users access */}
          <SkeletonBox height={16} width="50%" borderRadius={4} />
          {/* Created date */}
          <SkeletonBox height={16} width="45%" borderRadius={4} />
          {/* URL */}
          <SkeletonBox height={16} width="80%" borderRadius={4} />

          {/* Delete button placeholder */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, width: '100%' }}>
            <SkeletonBox height={40} width={100} borderRadius={6} />
          </div>
        </div>
      </div>
    </>
  );
}
