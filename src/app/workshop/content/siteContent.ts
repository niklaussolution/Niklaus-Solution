/**
 * All landing page copy lives here so it can be tweaked quickly for
 * different ad campaigns without touching component code.
 */

export const siteContent = {
  brand: 'The Niklaus Solutions',

  hero: {
    eyebrow: '₹399 LIVE WORKSHOP · LIMITED SEATS',
    headline: 'Cyber Security Awareness Workshop',
    subheadline:
      'Join our live workshop and learn the exact framework The Niklaus Solutions uses to help you protect yourself from cyber threats. No technical background is needed.',
    bullets: [
      'Live, interactive session with real Q&A',
      'Practical safety checklist you can apply the same day',
      'Certificate of participation + resource kit included',
    ],
    stats: [
      { value: '5000+', label: 'Students Trained' },
      { value: '2+ yrs', label: 'Track Record' },
      { value: '4.9/5', label: 'Attendee Rating' },
    ],
    ctaText: 'Reserve My Seat for ₹399',
  },

  trustBadges: {
    heading: 'What You Can Expect',
    items: ['Live & Interactive', 'Beginner Friendly', 'Certificate Included', 'Expert-Led Training'],
  },

  whyAttend: {
    heading: 'Why You Should Attend',
    subheading: 'This isn’t another generic webinar. Here’s what makes it different.',
    points: [
      {
        title: 'Actionable, Not Theoretical',
        description: 'Walk away with a step-by-step safety checklist you can implement immediately, with no jargon.',
      },
      {
        title: 'Built From Real Incidents',
        description: 'Everything taught comes from real cyber attack case studies across industries.',
      },
      {
        title: 'Live Access to the Trainer',
        description: 'Ask your specific questions live and get direct, personalized answers.',
      },
      {
        title: 'Beginner Friendly',
        description: 'No technical or IT background is needed. It’s built for everyday professionals and business owners.',
      },
    ],
  },

  whatYouLearn: {
    heading: 'What You’ll Learn',
    subheading: 'By the end of this workshop, you will know how to:',
    items: [
      'Understand the basics of Android mobile security and ethical hacking',
      'Learn practical ways to protect yourself from common hacking techniques',
      'Discover methods to improve your chances of recovering a lost or compromised mobile device',
      'Build strong cyber awareness to recognize online threats and scams',
      'Develop the habit of **Think Before You Click** to stay safe from phishing, malicious links, and fake apps',
    ],
  },

  highlights: {
    heading: 'Workshop Highlights',
    items: [
      { title: '3 Hours', description: 'Live, packed with actionable content' },
      { title: '1-on-1 Q&A', description: 'Get your specific questions answered' },
      { title: 'Safety Toolkit', description: 'Downloadable checklist + resources' },
      { title: 'Certificate', description: 'Of participation for all attendees' },
    ],
  },

  trainer: {
    heading: 'Meet Your Trainer',
    name: 'Harish Ganesan',
    role: 'Master Ethical Hacker',
    bio: 'A seasoned cybersecurity professional and ethical hacker with over 10 years of experience in penetration testing, vulnerability assessment, digital forensics, and cyber defense. Honored with the title Master Ethical Hacker, Harish has trained thousands of learners through hands-on workshops and security awareness programs, helping individuals and organizations identify vulnerabilities and stay ahead of evolving cyber threats.',
    credentials: ['10+ Years Experience', '5000+ Students Trained', 'Certified Ethical Hacker'],
  },

  outcomes: {
    heading: 'What You’ll Walk Away With',
    subheading: 'This workshop is built around what you can actually do afterward, not just what you hear.',
    items: [
      {
        title: 'Hands-On Practice',
        description: 'Work through real techniques live, not just slides, so the skills actually stick.',
      },
      {
        title: 'Direct Access to an Expert',
        description: 'Get your specific questions answered live by a working cybersecurity professional.',
      },
      {
        title: 'Tools You Can Use Immediately',
        description: 'Leave with a checklist and toolkit you can apply to your own accounts and devices right away.',
      },
    ],
  },

  bonuses: {
    heading: 'Exclusive Bonuses for Attendees',
    subheading: 'Register today and these come free with your ₹399 seat.',
    totalValue: '₹84,997',
    workshopFee: '₹399',
    items: [
      { title: 'RAT Tool', value: '₹80,000' },
      { title: 'Password & Account Security Guide', value: '₹1,999' },
      { title: 'Private Community Access', value: '₹1,999' },
      { title: 'Recording + Certificates', value: '₹999' },
    ],
  },

  workshopDetails: {
    heading: 'Workshop Details',
    items: [
      { label: 'Date', value: 'Next Available Session' },
      { label: 'Time', value: '11:00 AM – 1:00 PM (IST)' },
      { label: 'Format', value: 'Live Google Meet (link shared after registration)' },
      { label: 'Cost', value: '₹399 per seat (Limited to first 30 registrations)' },
    ],
  },

  faqs: {
    heading: 'Frequently Asked Questions',
    items: [
      {
        question: 'How much does this workshop cost?',
        answer: 'This workshop is priced at ₹399 per seat, which includes live access, the resource kit, and a certificate of participation.',
      },
      {
        question: 'Will I get a recording if I can’t attend live?',
        answer: 'Yes, all registered attendees receive the recording and slides after the session.',
      },
      {
        question: 'Who is this workshop for?',
        answer: 'Students, working professionals, and anyone curious about ethical hacking and mobile security. It’s for anyone who wants to build real cybersecurity skills or simply learn how to stay safe from hackers, scams, and phishing attacks.',
      },
      {
        question: 'Do I need any technical or IT background?',
        answer: 'No prior experience is required. The workshop is designed to be simple and actionable for all levels.',
      },
      {
        question: 'How do I join after registering?',
        answer: 'Our team will contact you on WhatsApp or email to collect payment and confirm your seat, then send the live session link before the workshop begins.',
      },
    ],
  },

  finalCta: {
    heading: 'Reserve Your Seat Before They Run Out',
    subheading: 'Join hundreds of professionals learning to protect themselves and their business online.',
    ctaText: 'Reserve My Seat for ₹399',
    seatsTotal: 30,
  },

  footer: {
    tagline: 'Practical ethical hacking training to help you spot and stop real cyber threats.',
    contactEmail: 'niklaussolution@gmail.com',
  },
} as const;
