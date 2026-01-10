/**
 * Initial Content Upload Helper
 * This utility helps populate all content sections in Firestore on first setup
 */

import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const initializeAllContent = async () => {
  try {
    // Why Choose Us Section
    const whyChooseUsContent = {
      heading: 'Why Choose Niklaus Solutions',
      subheading: 'Empowering Skills. Building Careers. Your success is our mission.',
      description:
        'We are committed to providing industry-leading training and career guidance to help you achieve your goals.',
      stats: [
        { number: '50+', label: 'Workshops Conducted' },
        { number: '1000+', label: 'Students Trained' },
        { number: '95%', label: 'Satisfaction Rate' },
        { number: '200+', label: 'Industry Partners' },
      ],
      features: [
        {
          id: 'feature_1',
          icon: 'briefcase',
          title: 'Industry Experts',
          description:
            'Learn from professionals with 10+ years of real-world experience in top tech companies',
        },
        {
          id: 'feature_2',
          icon: 'code',
          title: 'Hands-on Training',
          description:
            'Practice with real projects, live coding sessions, and industry-standard tools',
        },
        {
          id: 'feature_3',
          icon: 'award',
          title: 'Certificate Provided',
          description:
            'Receive industry-recognized certification upon successful completion of the workshop',
        },
        {
          id: 'feature_4',
          icon: 'briefcase',
          title: 'Internship Opportunities',
          description:
            'Get access to exclusive internship programs and job placement assistance',
        },
      ],
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'content', 'whyChooseUs'), whyChooseUsContent);

    // Free Trial Courses Section
    const freeTrialContent = {
      heading: 'Introducing Niklaus',
      description:
        'Free Trial For Courses\nNiklaus Free Trial is now live! Enjoy absolutely no fees during the trial period, with zero limits, zero barriers, and 100% full access. Stop waiting—start your free trial today!\n\nGet Free Trial Courses',
      trialButtonText: 'Get Free Trial Courses',
      courses: [
        { id: 'course_1', code: 'CEH', fullName: 'Certified Ethical Hacker', isFeatured: true },
        { id: 'course_2', code: 'BBH', fullName: 'Bug Bounty Hunting', isFeatured: false },
        { id: 'course_3', code: 'FSWD', fullName: 'Full Stack Web Development', isFeatured: false },
        { id: 'course_4', code: 'UI/UX', fullName: 'UI/UX Designing', isFeatured: false },
        { id: 'course_5', code: 'GenAI', fullName: 'Generative AI', isFeatured: false },
        { id: 'course_6', code: 'WD', fullName: 'WordPress Development', isFeatured: false },
      ],
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'content', 'freeTrialCourses'), freeTrialContent);

    // Key Features Section
    const keyFeaturesContent = {
      heading: 'Key Features Of Niklaus',
      subheading: 'Elevate Your Career with Guidance from Top Industry Mentors',
      features: [
        {
          id: 'keyfeature_1',
          title: 'Industry Expert',
          description: 'Learn from top professionals in the industry',
        },
        {
          id: 'keyfeature_2',
          title: 'Guaranteed Internship',
          description: 'Secure an internship opportunity after completion',
        },
        {
          id: 'keyfeature_3',
          title: 'Job Placement Assistance',
          description: 'Get help with job placement and career guidance',
        },
        {
          id: 'keyfeature_4',
          title: 'Resume Building',
          description: 'Professional resume building support',
        },
        {
          id: 'keyfeature_5',
          title: 'Career Guidance',
          description: 'Personalized career guidance and mentoring',
        },
        {
          id: 'keyfeature_6',
          title: 'Hackathons & Events',
          description: 'Participate in exclusive hackathons and events',
        },
        {
          id: 'keyfeature_7',
          title: 'Lifetime Access',
          description: 'Access course materials forever',
        },
        {
          id: 'keyfeature_8',
          title: 'Certification',
          description: 'Industry-recognized certification upon completion',
        },
      ],
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'content', 'keyFeatures'), keyFeaturesContent);

    // Scholarship Section
    const scholarshipContent = {
      heading: 'Scholarship',
      description:
        'Unlock Your Potential: Apply for a Niklaus Scholarship to Overcome Financial Barriers. Gain access to expert-led courses, dedicated support, and valuable certifications. Start your learning journey with us today!',
      highlights: [
        '100% Expert-Led Courses',
        'Dedicated Support & Mentoring',
        'Industry Recognized Certifications',
      ],
      applyButtonText: 'Apply Scholarship',
      whatsappLink: 'https://wa.me/YOUR_WHATSAPP_NUMBER', // Replace with actual WhatsApp link
      disclaimer:
        'Limited scholarships available. Apply now and transform your career!',
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'content', 'scholarship'), scholarshipContent);

    // Comparison Section
    const comparisonContent = {
      heading: 'Why Are We The Best',
      niklaausFeatures: [
        'Job Oriented Syllabus + Career Guidance',
        'Faster 1:1 Call & Chat Support',
        'Lifetime Access + Updates',
        'Guaranteed Internship',
        'Physical Certificate',
        'Hackathons & Competitions',
        'Industry Mentorship',
      ],
      features: [
        {
          feature: 'Job Oriented Syllabus + Career Guidance',
          niklaus: true,
          others: false,
        },
        {
          feature: 'Faster 1:1 Call & Chat Support',
          niklaus: true,
          others: false,
        },
        {
          feature: 'Lifetime Access + Updates',
          niklaus: true,
          others: false,
        },
        {
          feature: 'Guaranteed Internship',
          niklaus: true,
          others: false,
        },
        {
          feature: 'Physical Certificate',
          niklaus: true,
          others: false,
        },
        {
          feature: 'Hackathons & Competitions',
          niklaus: true,
          others: false,
        },
        {
          feature: 'Industry Mentorship',
          niklaus: true,
          others: false,
        },
      ],
      finalMessage:
        'Your dream role, faster and with confidence!\n⭐ NIKLAUS: 100% Features\nOthers: Average role, under-confident',
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'content', 'comparison'), comparisonContent);

    // Companies Section (empty initially, to be populated with logos)
    const companiesContent = {
      heading: 'Our Learners Work At',
      subheading: 'Join thousands of successful learners now working at leading companies worldwide',
      motivationalText:
        '🚀 Be part of this success story\n\nStart Your Journey Today',
      companies: [
        { id: 'company_tcs', name: 'TCS', logoUrl: '' },
        { id: 'company_zoho', name: 'Zoho', logoUrl: '' },
        { id: 'company_instamojo', name: 'Instamojo', logoUrl: '' },
        { id: 'company_amazon', name: 'Amazon', logoUrl: '' },
        { id: 'company_paypal', name: 'PayPal', logoUrl: '' },
        { id: 'company_wipro', name: 'Wipro', logoUrl: '' },
        { id: 'company_oracle', name: 'Oracle', logoUrl: '' },
        { id: 'company_flipkart', name: 'Flipkart', logoUrl: '' },
        { id: 'company_microsoft', name: 'Microsoft', logoUrl: '' },
        { id: 'company_capgemini', name: 'Capgemini', logoUrl: '' },
        { id: 'company_lenovo', name: 'Lenovo', logoUrl: '' },
        { id: 'company_paytm', name: 'Paytm', logoUrl: '' },
      ],
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'content', 'companies'), companiesContent);

    return {
      success: true,
      message: 'All content sections initialized successfully!',
    };
  } catch (error) {
    console.error('Error initializing content:', error);
    return {
      success: false,
      message: 'Error initializing content sections',
      error,
    };
  }
};

/**
 * Individual section initialization functions
 */

export const initializeWhyChooseUs = async () => {
  return await initializeAllContent();
};

export const initializeFreeTrialCourses = async () => {
  return await initializeAllContent();
};

export const initializeKeyFeatures = async () => {
  return await initializeAllContent();
};

export const initializeScholarship = async () => {
  return await initializeAllContent();
};

export const initializeComparison = async () => {
  return await initializeAllContent();
};

export const initializeCompanies = async () => {
  return await initializeAllContent();
};
