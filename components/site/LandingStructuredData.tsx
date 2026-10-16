import JsonLd from '@/components/site/JsonLd'
import { site, siteUrl } from '@/lib/site'

export default function LandingStructuredData() {
  const organizationId = `${siteUrl('/')}#organization`
  const organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: site.organization,
    url: siteUrl('/'),
    logo: siteUrl('/icon.svg'),
    sameAs: Object.values(site.social).filter(Boolean),
    founder: {
      '@type': 'Person',
      name: site.ownerName,
    },
  }

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          organization,
          {
            '@type': 'WebSite',
            '@id': `${siteUrl('/')}#website`,
            name: site.name,
            url: siteUrl('/'),
            publisher: { '@id': organizationId },
          },
          {
            '@type': 'WebApplication',
            name: site.name,
            description: site.description,
            url: siteUrl('/'),
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: 0,
              priceCurrency: 'INR',
            },
            creator: { '@id': organizationId },
          },
        ],
      }}
    />
  )
}
