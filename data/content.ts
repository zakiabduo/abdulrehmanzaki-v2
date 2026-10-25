export const profile = {
  name: "Abdul Rehman Zaki",
  roles: ["AI/ML Intern", "MERN Full-Stack Developer", "UX/UI Designer"],
  bio: "AI/ML Trainee and Intern and Software Engineer with experience in MERN full-stack development and UX/UI design. Passionate about building user-focused digital solutions and exploring AI/ML technologies.",
  email: "abdulrehmanzaki007@gmail.com",
  location: "Pakistan",
  linkedin: "https://www.linkedin.com/in/abdulrehmanzaki/",
  github: "https://github.com/zakiabduo",
  cv: "Abdul_Rehman_Zaki_CV.pdf", // file lives in /public
  siteUrl: "https://abdulrehmanzaki-v2.vercel.app/",
};

export const stats = [
  { label: "Years studying software engineering", value: 4 },
  { label: "Projects built", value: 3 },
  { label: "Core disciplines", value: 3 },
];

export const skillGroups = [
  { title: "AI & Data", items: ["AI & Machine Learning", "Python", "Data Analysis & Visualization"] },
  { title: "Web development", items: ["MERN Stack Development", "React.js & JavaScript", "MongoDB & Express.js"] },
  { title: "Design & workflow", items: ["UI/UX Design", "Figma"] },
];

/** Short labels for the 3D skills orbit (derived from skillGroups). */
export const orbitSkills = [
  "Python", "Machine Learning", "Data Analysis", "React.js", "JavaScript",
  "Node.js", "Express.js", "MongoDB", "UI/UX Design", "Figma", "Git & GitHub", "Leadership",
];

/**
 * Self-assessed levels (0–5) for the radar chart. These are YOUR call:
 * edit the numbers so they reflect where you honestly are.
 */
export const radar = [
  { axis: "Frontend", value: 4 },
  { axis: "Backend", value: 4 },
  { axis: "Databases", value: 3.5 },
  { axis: "Data analysis", value: 3.5 },
  { axis: "AI / ML", value: 3.5},
  { axis: "UI/UX design", value: 3.5 }
];

export type Project = {
  title: string;
  description: string;
  tags: string[];
  category: "AI/ML" | "Web" | "Design";
  image?: string;
  live?: string;
  github?: string;
};

export const projects: Project[] = [
  {
    image: "/projects/Ai-mern-appointment-system.png",
    title: "MERN AI-powered doctor appointment system",
    description: "Production-ready full-stack healthcare platform featuring real-time consultations, payment gateway, and AI triage.",
    tags: ["React", "Node.js", "MongoDB", "Express.js", "Cloudinary"],
    category: "Web",
    live: "https://fyp-frontend-mu-flame.vercel.app/",
    github: "https://github.com/zakiabduo/FYP",
  },
  {
    image: "/projects/Screenshot 2026-10-01 143301.png",
    title: "Naive Bayes Classification End-to-End ML Pipeline",
    description: "Built an end-to-end machine learning pipeline using Naive Bayes Classification, covering data cleaning, missing-value imputation, categorical encoding, feature engineering, model training, evaluation, and model comparison using real-world-style data",
    tags: ["Python", "scikit-learn", "Pandas", "Numpy", "Matplotlib", "Seaborn", "Naive Bayes", "TF-IDF", "Data Preprocessing", "Feature Engineering", "Model Evaluation", "Model Comparison"],
    category: "AI/ML",
    github: "https://github.com/zakiabduo/NETSOL-ai-ml-learning-lab",
  },
  {
    image: "/projects/car_app_design.png",
    title: "Rental Car App",
    description: "A complete car rental mobile app design with prototyping.",
    tags: ["Figma", "Prototyping"],
    category: "Design",
  },
];

export const timeline = [
  { title: "AI/ML Intern", place: "NETSOL Technologies Pakistan", period: "2026 – Present" },
  { title: "BS Software Engineering", place: "University of Okara, Pakistan", period: "2022 – 2026" },
];

export const certifications = [
  { title: "Google Prompting Essentials", issuer: "Google · Coursera", href: "https://www.coursera.org/account/accomplishments/specialization/certificate/2T6PN6EED5TJ" },
  { title: "The Complete Full-Stack Web Development Bootcamp", issuer: "Udemy", href: "https://www.udemy.com/certificate/UC-3a153ed4-6661-413a-be18-ceda5d846231/" },
  // Verify the two links below point to the right certificates.
  { title: "Start the UX Design Process: Empathize, Define, and Ideate", issuer: "Google · Coursera", href: "https://www.coursera.org/account/accomplishments/verify/HJ5YNGSH5P1K" },
  { title: "Foundations of User Experience (UX) Design", issuer: "Google · Coursera", href: "https://www.coursera.org/account/accomplishments/verify/22R3U1TISIWT" },
];

export const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certificates" },
  { id: "contact", label: "Contact" },
];
