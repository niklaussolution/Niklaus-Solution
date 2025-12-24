import { motion } from "motion/react";

interface Company {
  id: number;
  name: string;
  logo: string;
}

const companies: Company[] = [
  {
    id: 1,
    name: "TCS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/1200px-Tata_Consultancy_Services_Logo.svg.png",
  },
  {
    id: 2,
    name: "Zoho",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Zoho_logo.svg/1200px-Zoho_logo.svg.png",
  },
  {
    id: 3,
    name: "Instamojo",
    logo: "https://upload.wikimedia.org/wikipedia/en/3/30/Instamojo_logo.png",
  },
  {
    id: 4,
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
  },
  {
    id: 5,
    name: "PayPal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Paypal_2014_logo.png/1200px-Paypal_2014_logo.png",
  },
  {
    id: 6,
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Wipro_Logo.svg/1200px-Wipro_Logo.svg.png",
  },
  {
    id: 7,
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/1200px-Oracle_logo.svg.png",
  },
  {
    id: 8,
    name: "Flipkart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flipkart_logo.svg/1200px-Flipkart_logo.svg.png",
  },
  {
    id: 9,
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/1200px-Microsoft_logo_%282012%29.svg.png",
  },
  {
    id: 10,
    name: "Capgemini",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/c1/Capgemini_logo.png",
  },
  {
    id: 11,
    name: "Lenovo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Lenovo_logo_2015.svg/1200px-Lenovo_logo_2015.svg.png",
  },
  {
    id: 12,
    name: "Paytm",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Paytm_logo.svg/1200px-Paytm_logo.svg.png",
  },
];

export function CompaniesSection() {
  return (
    <section id="companies" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Learners Work At
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful learners now working at leading companies worldwide
          </p>
        </motion.div>

        {/* Companies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <div className="h-28 md:h-32 bg-white rounded-2xl border-2 border-teal-200 hover:border-orange-500 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center p-4 cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-teal-50">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-w-full max-h-20 object-contain grayscale group-hover:grayscale-0 transition-all duration-300 filter group-hover:drop-shadow-md"
                  title={company.name}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-block bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-6 py-3 mb-6">
            <p className="text-orange-700 font-semibold text-sm">
              🚀 Be part of this success story
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Start Your Journey Today
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
