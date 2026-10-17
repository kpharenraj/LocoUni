import JsonLd from '@/components/site/JsonLd'
import { site, siteUrl } from '@/lib/site'
import OrganizationPersonStructuredData from '@/components/site/OrganizationPersonStructuredData'

export default function LandingStructuredData() {
  const organizationId = `${siteUrl('/')}#organization`

  return (
    <>
      <OrganizationPersonStructuredData />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
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
    </>
  )
}
