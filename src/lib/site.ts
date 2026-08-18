export const SITE = {
  name: "ARK Finance Consultancy",
  shortName: "ARK Finance",
  tagline: "Solution to every financial problem",
  founded: 2026,
  founder: "Karan Joshi",
  founderTitle: "Founder & Principal Consultant (CAFC Qualified)",
  city: "Ahmedabad",
  state: "Gujarat",
  address: {
    line1: "302, RM Arcade",
    line2: "near Karnavati Cross Road, Takshshila School Road",
    area: "Vastral, Ahmedabad",
    region: "Gujarat, India",
  },
  phoneDisplay: "+91 63513 77101",
  phoneHref: "tel:+916351377101",
  whatsapp: "916351377101",
  email: "arkfinance211@gmail.com",
  hours: "Monday – Sunday, 9:00 AM – 9:00 PM",
  stats: [
    { value: "12", label: "Team members" },
    { value: "1,500+", label: "Clients served" },
    { value: "4", label: "Practice areas" },
    { value: "100%", label: "Founder-reviewed files" },
  ],
  process: [
    {
      step: "01",
      title: "Requirement Analysis",
      body: "We start by understanding your goal, timelines and constraints — not by pitching a product. Every engagement begins with a structured conversation.",
    },
    {
      step: "02",
      title: "Document Gathering",
      body: "Our team prepares a complete, lender-ready or filing-ready file, checks it for inconsistencies and handles the follow-ups on your behalf.",
    },
    {
      step: "03",
      title: "Finalization and support",
      body: "We negotiate terms, close the sanction or filing, and stay available afterwards for renewals, disbursements and compliance.",
    },
  ],
};

export const whatsappLink = (message = "Hello ARK Finance, I would like a consultation.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

export const SERVICE_OPTIONS = [
  "Loan Financing",
  "Insurance Services",
  "Tax Consultancy",
  "Financial Management",
  "Something else",
];
