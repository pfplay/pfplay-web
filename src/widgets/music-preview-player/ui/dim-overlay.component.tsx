type DimOverlayProps = {
  onClick: () => void;
  className?: string;
  zIndex?: number;
};

/**
 * 배경 Dim 효과 컴포넌트
 * 클릭 시 플레이어 종료
 * className으로 특정 영역 제외 가능
 */
export default function DimOverlay({ onClick, className, zIndex }: DimOverlayProps) {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-30 cursor-pointer ${
        zIndex === undefined ? 'z-20' : ''
      } ${className || ''}`}
      style={zIndex === undefined ? undefined : { zIndex }}
      onClick={onClick}
    />
  );
}
