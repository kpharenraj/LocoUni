import { site, siteUrl } from '@/lib/site'
import JsonLd from '@/components/site/JsonLd'

export default function BreadcrumbJsonLd({
  name,
  path,
}: {
  name: string
  path: string
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: site.name,
            item: siteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name,
            item: siteUrl(path),
          },
        ],
      }}
    />
  )
}
