import { ImageResponse } from 'next/og';
import { BrandMark, brandMarkColors } from '@/components/brand-mark';
import { shareColors } from '@/lib/seo';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Drawn at build, so no binary icon is committed (ADR-0035 decision 13).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: shareColors.ground,
        }}
      >
        <BrandMark colors={brandMarkColors.dark} size={148} />
      </div>
    ),
    size,
  );
}
