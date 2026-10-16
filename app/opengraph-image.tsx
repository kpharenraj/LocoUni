import { ImageResponse } from 'next/og'
import BrandImage from '@/components/site/BrandImage'
import { site } from '@/lib/site'

export const alt = `${site.name} campus guide by ${site.organization}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(<BrandImage />, size)
}
