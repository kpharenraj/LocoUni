import JsonLd from '@/components/site/JsonLd'
import { site, siteUrl } from '@/lib/site'

export default function OrganizationPersonStructuredData() {
  const organizationId = `${siteUrl('/')}#organization`
  const personId = `${siteUrl('/')}#founder`
  const sameAs = Object.values(site.social).filter(Boolean)

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': organizationId,
            name: site.organization,
            description: site.organizationDescription,
            url: siteUrl('/'),
            logo: siteUrl('/icon.svg'),
            sameAs,
            founder: { '@id': personId },
          },
          {
            '@type': 'Person',
            '@id': personId,
            name: site.ownerName,
            url: site.social.portfolio,
            jobTitle: 'Founder',
            worksFor: { '@id': organizationId },
            sameAs,
          },
        ],
      }}
    />
  )
}
