import type { Metadata } from 'next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import PublicPage from '@/components/site/PublicPage'
import { createPageMetadata, site } from '@/lib/site'
import { faqItems } from '@/lib/faq'
import BreadcrumbJsonLd from '@/components/site/BreadcrumbJsonLd'
import JsonLd from '@/components/site/JsonLd'

export const metadata: Metadata = createPageMetadata(
  'Frequently asked questions',
  `Answers about ${site.name} accounts, university approval, campus information and the AI assistant.`,
  '/faq'
)

export default function FaqPage() {
  return (
    <PublicPage>
      <BreadcrumbJsonLd name="FAQ" path="/faq" />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: { '@type': 'Answer', text: answer },
          })),
        }}
      />
      <article className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Answers about accounts, university information, and the campus assistant.
          </p>
        </header>

        <section aria-labelledby="common-questions-heading">
          <h2 id="common-questions-heading" className="sr-only">
            Common questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map(({ question, answer }, index) => (
              <AccordionItem key={question} value={`question-${index + 1}`}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </article>
    </PublicPage>
  )
}
