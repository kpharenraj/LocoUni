import { site } from '@/lib/site'

export const faqItems = [
  {
    question: `Is ${site.name} free to use?`,
    answer: `The app currently has no paid plans or payment flow. Your university may have its own requirements for students, and internet or device charges are outside ${site.name}.`,
  },
  {
    question: 'How are universities approved?',
    answer:
      'A newly registered university starts as pending and is not listed for students to join. It must be reviewed and marked approved by the site operator before it appears in search.',
  },
  {
    question: 'Who can see my account information?',
    answer:
      'Your profile is available to you through the app, and your role and joined university are used to provide the appropriate experience. Public university content such as locations, faculty entries, and notices can be read by visitors.',
  },
  {
    question: 'How accurate is the AI assistant?',
    answer: `The assistant uses campus information available in ${site.name}, but generated answers can be incomplete or wrong. Check important details with your university before relying on them.`,
  },
  {
    question: 'How can I report incorrect campus information?',
    answer: `Contact the ${site.name} team and include the university and the information that needs correction. For information published by a university, you can also contact its administration.`,
  },
  {
    question: 'Can I change my university after joining?',
    answer:
      'Yes. A signed-in student can choose another approved university through the Join University flow. Their profile is then associated with the newly selected university.',
  },
  {
    question: 'Do I need an account to use the assistant?',
    answer:
      'Yes. The campus assistant is available to signed-in student accounts that have joined a university. The assistant is limited to campus information available for that university.',
  },
  {
    question: 'Why can’t I find my university?',
    answer:
      'Only approved universities appear in the search results. If yours is not listed, it may not have been registered or approved yet; university administrators can submit it for review.',
  },
  {
    question: 'Who publishes faculty details, locations, and notices?',
    answer:
      'University administrators manage the campus locations, faculty information, and notices for their university. Contact the relevant university to confirm or update those details.',
  },
  {
    question: 'How do I request account or privacy help?',
    answer: `Email ${site.contactEmail} with your request. Do not include your password in the message.`,
  },
] as const
