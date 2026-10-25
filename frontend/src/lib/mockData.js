// All data below is fictional/demo content for a hackathon prototype.

export const USER = {
  name: "Piyush Plaban Pattjoshi",
  role: "Parent & Caregiver",
  initials: "PS",
  childName: "Arjun",
  childAge: 7,
  language: "English",
  location: "Bhubaneswar, Odisha",
};

export const LEARN_PROGRESS = 65;

export const TODAY_STATS = [
  { id: "res", value: 3, label: "new learning resources", icon: "BookOpen", color: "#D9A441", to: "/learn" },
  { id: "circle", value: 2, label: "care-circle updates", icon: "Users", color: "#E08A6E", to: "/connect" },
  { id: "prof", value: 4, label: "nearby professionals", icon: "MapPin", color: "#5E8B7E", to: "/navigate" },
  { id: "consult", value: 1, label: "upcoming consultation", icon: "CalendarClock", color: "#4F8A9E", to: "/support" },
];

export const HOW_HELPS = [
  {
    id: "geo",
    title: "Geo-Tagged Professional Matchmaking",
    desc: "Find the right professional based on your needs and location.",
    icon: "MapPinned",
    color: "#5E8B7E",
    to: "/navigate",
  },
  {
    id: "capacity",
    title: "Capacity Building at Home",
    desc: "Learn practical strategies that families can use every day.",
    icon: "HousePlus",
    color: "#D9A441",
    to: "/learn",
  },
  {
    id: "isolation",
    title: "Breaking the Chains of Isolation",
    desc: "Connect with families, mentors and supportive communities.",
    icon: "HeartHandshake",
    color: "#E08A6E",
    to: "/connect",
  },
  {
    id: "divide",
    title: "Bridging the Geographic Divide",
    desc: "Access resources and professional support even when specialists are far away.",
    icon: "Network",
    color: "#5FA07E",
    to: "/navigate",
  },
  {
    id: "voice",
    title: "Giving a Voice to the Non-Speaking",
    desc: "Communicate needs, feelings and choices through AAC.",
    icon: "Volume2",
    color: "#4F8A9E",
    to: "/support",
  },
];

// ---------------- LEARN ----------------
export const LEARN_MODULES = [
  {
    id: "m1",
    category: "Understanding Autism",
    title: "Understanding Autism",
    desc: "A gentle introduction to how autistic children experience the world.",
    duration: "18 min",
    difficulty: "Beginner",
    language: "English",
    format: "Video",
    progress: 100,
    videoUrl: "https://www.youtube.com/embed/P5M-VPjRCgE",
    sourceOrg: "YouTube / Amazing Things Project",
    tagline: "Understanding autism is the first step toward acceptance.",
    about: "This lesson provides a foundational overview of autism spectrum disorder. You'll learn about neurodevelopmental differences, sensory variations, and how autism is a spectrum.",
    takeaways: [
      "Autism is a neurodevelopmental difference.",
      "Every autistic person is different.",
      "Communication and social interactions can take many forms.",
      "Support should be individualized.",
      "Acceptance is an important part of inclusion."
    ],
    isDiagnostic: false,
  },
  {
    id: "m2",
    category: "Early Signs",
    title: "Recognizing Early Signs",
    desc: "Learn about early developmental differences and how to seek support.",
    duration: "22 min",
    difficulty: "Beginner",
    language: "English",
    format: "Video",
    progress: 70,
    videoUrl: "https://www.youtube.com/embed/sWDvvOk6KvM",
    sourceOrg: "YouTube / Kennedy Krieger Institute",
    tagline: "Recognizing differences early can help families find support sooner.",
    about: "This video explains common developmental signs without presenting the video as a diagnostic tool. Understanding these signs can help you identify when to seek professional guidance.",
    takeaways: [
      "Early recognition leads to earlier support.",
      "Developmental milestones are guidelines, not rules.",
      "Differences in communication and play can be early indicators."
    ],
    isDiagnostic: true,
  },
  {
    id: "m3",
    category: "Communication",
    title: "Communication & AAC",
    desc: "Everyday ways to support and encourage communication.",
    duration: "15 min",
    difficulty: "Intermediate",
    language: "English",
    format: "Video",
    progress: 40,
    videoUrl: "https://www.youtube.com/embed/85SWfrZ8eiQ",
    sourceOrg: "YouTube / Speech and Language UK",
    tagline: "Every child deserves a way to communicate.",
    about: "Explore various communication differences and alternative methods like AAC (Augmentative and Alternative Communication). Learn how to support non-speaking or minimally speaking children without forcing speech.",
    takeaways: [
      "Communication is more than just spoken words.",
      "AAC systems empower children to express their needs and thoughts.",
      "Picture-based communication builds dignity and agency.",
      "Supporting communication means listening to all forms of expression."
    ],
    isDiagnostic: false,
  },
  {
    id: "m4",
    category: "Parent Training",
    title: "Parent-Mediated Support",
    desc: "Confidence-building skills for parents and caregivers.",
    duration: "20 min",
    difficulty: "Beginner",
    language: "English",
    format: "Video",
    progress: 0,
    videoUrl: "https://www.youtube.com/embed/DfYEUeUs5ag",
    sourceOrg: "YouTube / Autism Center",
    tagline: "Support can begin with everyday moments at home.",
    about: "Learn how to use everyday routines and play to support your child's development. This lesson focuses on evidence-informed home support strategies.",
    takeaways: [
      "Everyday interactions are powerful learning moments.",
      "Play is a natural way to build connection and skills.",
      "Routines provide comfort and predictability.",
      "Parent-led support complements, but does not replace, qualified therapy."
    ],
    isDiagnostic: false,
  },
  {
    id: "m5",
    category: "Sensory",
    title: "Sensory Differences",
    desc: "Recognise sensory needs and create calming spaces.",
    duration: "12 min",
    difficulty: "Beginner",
    language: "English",
    format: "Video",
    progress: 80,
    videoUrl: "https://www.youtube.com/embed/deY1uqtaZ6E",
    sourceOrg: "YouTube / National Autistic Society",
    tagline: "Different senses can mean a different experience of the world.",
    about: "This lesson explores sensory sensitivities and sensory seeking behaviors. Learn how sound, light, and touch can affect autistic individuals and how to create supportive environments.",
    takeaways: [
      "Sensory experiences can be overwhelming or under-stimulating.",
      "Sensory seeking is a natural way to regulate the nervous system.",
      "Creating sensory-friendly spaces reduces anxiety and stress.",
      "Understanding triggers helps in providing better support."
    ],
    isDiagnostic: false,
  },
  {
    id: "m6",
    category: "Inclusion",
    title: "Autism & Inclusion",
    desc: "Acceptance grows when communities make room for everyone.",
    duration: "25 min",
    difficulty: "Intermediate",
    language: "English",
    format: "Video",
    progress: 30,
    videoUrl: "https://www.youtube.com/embed/YrCwS1QS-78",
    sourceOrg: "YouTube / TEDx",
    tagline: "Acceptance grows when communities make room for everyone.",
    about: "Focusing on inclusion and acceptance, this video discusses reducing stigma, participating in school and community activities, and respecting the unique differences of autistic individuals.",
    takeaways: [
      "Inclusion means active participation, not just presence.",
      "Communities benefit from diverse minds and perspectives.",
      "Reducing stigma starts with understanding and empathy.",
      "Accommodations make environments accessible to everyone."
    ],
    isDiagnostic: false,
  },
];

export const LEARN_TABS = [
  "Parent Training",
  "Teacher & Inclusive Classroom",
  "Government Schemes",
  "Home Activities",
  "Communication",
];

export const GOV_SUPPORT = [
  { id: "udid", title: "UDID Card", desc: "Unique Disability ID — a single card for accessing disability benefits and schemes across India.", tag: "National" },
  { id: "cert", title: "Disability Certificate", desc: "Medical certification that enables access to reservations, scholarships and concessions.", tag: "Certification" },
  { id: "edu", title: "Education Support", desc: "Inclusive education rights, scholarships and school support under RPWD Act 2016.", tag: "Education" },
  { id: "scheme", title: "Government Schemes", desc: "Niramaya health insurance, ADIP aids & appliances, and state welfare schemes.", tag: "Welfare" },
];

// ---------------- CONNECT ----------------
export const CARE_CIRCLE = {
  name: "Arjun's Care Circle",
  goal: "Consistent visual schedules across home and school",
  progress: 72,
  members: [
    { name: "Priya Sharma", role: "Parent", initials: "PS", color: "#E08A6E" },
    { name: "Dr. Meera Das", role: "Speech Therapist", initials: "MD", color: "#5E8B7E" },
    { name: "Ravi Patnaik", role: "Special Educator", initials: "RP", color: "#4F8A9E" },
    { name: "Sunita Nayak", role: "Teacher", initials: "SN", color: "#D9A441" },
  ],
  updates: [
    "Arjun used the visual schedule independently twice this week.",
    "Speech goals updated — focus on two-word requests.",
  ],
};

export const CARE_CHAT = [
  { id: 1, sender: "Parent", name: "Priya Sharma", initials: "PS", color: "#E08A6E", text: "Arjun tried the new visual schedule today.", time: "9:12 AM" },
  { id: 2, sender: "Therapist", name: "Dr. Meera Das", initials: "MD", color: "#5E8B7E", text: "That's great! Let's continue it for another week.", time: "9:20 AM" },
  { id: 3, sender: "Teacher", name: "Sunita Nayak", initials: "SN", color: "#D9A441", text: "I'll use the same schedule in class.", time: "9:34 AM" },
];

export const COMMUNITY_CIRCLES = [
  {
    id: "c1",
    name: "First-Time Parents",
    members: 248,
    desc: "A warm space for parents new to the autism journey.",
    recent: "Sharing our first therapy experiences",
    announcement: "📌 Next Saturday's caregiver meet-up will be held at the local community center. Check the Events section for details.",
    location: "Global / Remote",
    messages: [
      { id: 101, senderRole: "Parent", name: "Ananya", initials: "A", color: "#E08A6E", text: "Has anyone found a good way to prepare their child for a new school environment?", time: "Yesterday" },
      { id: 102, senderRole: "Verified Special Educator", name: "Meera", initials: "M", color: "#4F8A9E", text: "Visual schedules can be helpful. You can introduce the routine gradually at home before the school starts.", time: "Yesterday" },
      { id: 103, senderRole: "Caregiver", name: "Rakesh", initials: "R", color: "#5E8B7E", text: "We started using pictures for the morning routine and it has made transitions easier for us.", time: "Today 9:12 AM" },
      { id: 104, senderRole: "Lumina Volunteer", name: "Volunteer Team", initials: "LV", color: "#D9A441", text: "Here is a resource from the Learn section on visual routines that might help!", time: "Today 9:15 AM" }
    ],
  },
  {
    id: "c2",
    name: "Sensory Support",
    members: 176,
    desc: "Tips and tools for sensory needs and calming.",
    recent: "What helps during loud festivals?",
    announcement: "📌 Please remember to protect children's privacy. Avoid sharing identifiable personal or medical information.",
    location: "Global / Remote",
    messages: [
      { id: 201, senderRole: "Parent", name: "Sunil", initials: "S", color: "#5E8B7E", text: "With Diwali coming up, does anyone have tips for managing loud firecracker noises?", time: "Yesterday" },
      { id: 202, senderRole: "Parent", name: "Priya", initials: "P", color: "#E08A6E", text: "Noise-cancelling headphones have been a lifesaver for Arjun.", time: "Yesterday" },
      { id: 203, senderRole: "Verified Occupational Therapist", name: "Kavya", initials: "K", color: "#4F8A9E", text: "In addition to headphones, creating a 'safe quiet corner' inside the house with heavy blankets and low light can give them a place to retreat when overwhelmed.", time: "Today 10:00 AM" },
    ],
  },
  {
    id: "c3",
    name: "Communication & AAC",
    members: 194,
    desc: "Everything about AAC and building communication.",
    recent: "Our favourite AAC starter words",
    announcement: null,
    location: "Global / Remote",
    messages: [
      { id: 301, senderRole: "Parent", name: "Ravi", initials: "R", color: "#5E8B7E", text: "We just got an AAC tablet. What words did you all start with?", time: "Monday" },
      { id: 302, senderRole: "Verified Speech Therapist", name: "Dr. Das", initials: "MD", color: "#4F8A9E", text: "Core words like 'More', 'Stop', 'Help', and 'Want' are usually great starting points because they apply to many different situations.", time: "Monday" },
      { id: 303, senderRole: "Parent", name: "Anita", initials: "A", color: "#E08A6E", text: "Yes! 'More' was our first. We used it during snack time and blowing bubbles.", time: "Today 8:30 AM" },
    ],
  },
  {
    id: "c4",
    name: "School Inclusion",
    members: 132,
    desc: "Working with schools for inclusive classrooms.",
    recent: "Meeting with the class teacher — advice?",
    announcement: "📌 Join our webinar this Friday on 'Advocating for your child at school'.",
    location: "Global / Remote",
    messages: [
      { id: 401, senderRole: "Parent", name: "Vikram", initials: "V", color: "#D9A441", text: "I have a meeting with the principal tomorrow to discuss classroom accommodations. Any advice?", time: "Yesterday" },
      { id: 402, senderRole: "Parent", name: "Nisha", initials: "N", color: "#E08A6E", text: "Bring a short 1-page profile of your child (like the Autism Passport). It really helps them see the child, not just the challenges.", time: "Yesterday" },
      { id: 403, senderRole: "Verified Special Educator", name: "Rupa", initials: "R", color: "#4F8A9E", text: "I completely agree with Nisha. Keep it collaborative. Ask them 'How can we work together to support him?'", time: "Today 11:00 AM" },
    ],
  },
  {
    id: "c5",
    name: "Parents in Odisha",
    members: 310,
    desc: "Local families across Odisha districts.",
    recent: "Bhubaneswar sensory-friendly park meetup",
    announcement: "📌 Sunday Meetup: Ekamra Kanan Park at 4:30 PM. Look for the Lumina banner near the rose garden!",
    location: "Odisha, India",
    messages: [
      { id: 501, senderRole: "Parent", name: "Manas", initials: "M", color: "#5E8B7E", text: "Is anyone planning to go to the park meetup this Sunday?", time: "Yesterday" },
      { id: 502, senderRole: "Caregiver", name: "Smita", initials: "S", color: "#E08A6E", text: "Yes, we are coming! It will be our first time.", time: "Today 8:00 AM" },
      { id: 503, senderRole: "Lumina Volunteer", name: "Aditya", initials: "A", color: "#D9A441", text: "Awesome! We will have some sensory tents set up if any kids need a quiet break.", time: "Today 8:45 AM" },
    ],
  },
  {
    id: "c6",
    name: "Fathers' Support Circle",
    members: 88,
    desc: "A supportive circle for fathers and caregivers.",
    recent: "Balancing work and caregiving",
    announcement: null,
    location: "Global / Remote",
    messages: [
      { id: 601, senderRole: "Parent", name: "Suresh", initials: "S", color: "#5E8B7E", text: "It's been tough balancing the new office hours with therapy drop-offs.", time: "Tuesday" },
      { id: 602, senderRole: "Parent", name: "Kiran", initials: "K", color: "#D9A441", text: "I hear you, man. I had to speak to my manager to shift my hours slightly. Most are understanding if you explain it.", time: "Tuesday" },
      { id: 603, senderRole: "Parent", name: "Amit", initials: "A", color: "#E08A6E", text: "We ended up finding a therapist closer to home to cut down the commute. Hang in there.", time: "Today 10:20 AM" },
    ],
  },
];

export const FORUM_CATEGORIES = ["Sensory Issues", "Communication", "Parenting", "School Support", "Diet & Routine", "Daily Activities"];

export const FORUM_POSTS = [
  { id: "p1", name: "Anjali M.", initials: "AM", color: "#E08A6E", title: "How do you handle transitions between activities?", category: "Daily Activities", tags: ["routines", "transitions"], replies: 14, time: "2h ago" },
  { id: "p2", name: "Rahul K.", initials: "RK", color: "#5E8B7E", title: "AAC apps that worked for your child?", category: "Communication", tags: ["AAC", "tools"], replies: 27, time: "5h ago" },
  { id: "p3", name: "Sneha P.", initials: "SP", color: "#4F8A9E", title: "Managing bright lights and loud sounds at malls", category: "Sensory Issues", tags: ["sensory", "outings"], replies: 9, time: "1d ago" },
  { id: "p4", name: "Vikram S.", initials: "VS", color: "#D9A441", title: "Tips for a smoother morning routine", category: "Daily Activities", tags: ["routines", "morning"], replies: 18, time: "1d ago" },
];

export const PEERS = [
  { id: "pe1", name: "Meena Rout", role: "Parent · 2 children", initials: "MR", color: "#E08A6E", note: "Journey of 6 years · Bhubaneswar", langs: ["Odia", "English"] },
  { id: "pe2", name: "Aditya Sahoo", role: "Parent Mentor", initials: "AS", color: "#5E8B7E", note: "Loves sharing routine tips · Cuttack", langs: ["Hindi", "Odia"] },
  { id: "pe3", name: "Fatima Khan", role: "Parent", initials: "FK", color: "#4F8A9E", note: "AAC advocate · Rourkela", langs: ["Hindi", "English"] },
];

// ---------------- NAVIGATE ----------------
export const PROFESSIONALS = [
  { id: "d1", name: "Dr. Meera Das", type: "Speech Therapist", location: "Bhubaneswar", distance: 2.4, experience: 9, spec: "Early language & AAC", langs: ["Odia", "English"], rating: 4.9, availability: "Available today", initials: "MD", color: "#5E8B7E", top: 22, left: 30 },
  { id: "d2", name: "Dr. Arun Mishra", type: "Developmental Pediatrician", location: "Bhubaneswar", distance: 4.1, experience: 14, spec: "Early diagnosis", langs: ["Hindi", "English"], rating: 4.8, availability: "Next slot Fri", initials: "AM", color: "#4F8A9E", top: 48, left: 58 },
  { id: "d3", name: "Kavya Reddy", type: "Occupational Therapist", location: "Cuttack", distance: 12.6, experience: 7, spec: "Sensory integration", langs: ["English"], rating: 4.7, availability: "Available today", initials: "KR", color: "#D9A441", top: 68, left: 40 },
  { id: "d4", name: "Ravi Patnaik", type: "Special Educator", location: "Bhubaneswar", distance: 3.0, experience: 11, spec: "Inclusive learning", langs: ["Odia", "Hindi"], rating: 4.9, availability: "Next slot Mon", initials: "RP", color: "#C98474", top: 34, left: 72 },
  { id: "d5", name: "Dr. Nisha Verma", type: "Psychologist", location: "Cuttack", distance: 13.2, experience: 10, spec: "Behaviour & family", langs: ["Hindi", "English"], rating: 4.6, availability: "Available today", initials: "NV", color: "#5FA07E", top: 60, left: 20 },
  { id: "d6", name: "Sameer Joshi", type: "Behaviour Therapist", location: "Bhubaneswar", distance: 5.8, experience: 8, spec: "Positive behaviour support", langs: ["English", "Odia"], rating: 4.8, availability: "Next slot Wed", initials: "SJ", color: "#7A9E9F", top: 18, left: 55 },
];

export const PROF_TYPES = ["All", "Speech Therapist", "Occupational Therapist", "Developmental Pediatrician", "Special Educator", "Behaviour Therapist", "Psychologist"];
export const PROF_LANGS = ["All", "Odia", "Hindi", "English"];

export const DISTRICTS = [
  { name: "Kalahandi", professionals: 3, resources: 2 },
  { name: "Bhubaneswar", professionals: 18, resources: 11 },
  { name: "Cuttack", professionals: 12, resources: 6 },
  { name: "Sambalpur", professionals: 8, resources: 3 },
  { name: "Rourkela", professionals: 7, resources: 2 },
];

export const DIVIDE_STATS = [
  { value: "12", label: "Districts" },
  { value: "48", label: "Professionals" },
  { value: "24", label: "Inclusive Resources" },
];

export const RESEARCH = [
  { id: "r1", title: "Early Intervention Outcomes in Rural India", institution: "Utkal University (demo)", category: "University Study", desc: "A demo study exploring outcomes of home-based early intervention in rural districts." },
  { id: "r2", title: "AAC Adoption Among Non-Speaking Children", institution: "National Institute (demo)", category: "Evidence Resource", desc: "Evidence-based overview of AAC adoption and family training approaches." },
  { id: "r3", title: "Sensory-Friendly Public Spaces", institution: "Design Lab (demo)", category: "Autism Research", desc: "Research on how inclusive design reduces sensory overload in public spaces." },
  { id: "r4", title: "Community Survey: Access to Therapy", institution: "Lumina Community (demo)", category: "Community Survey", desc: "A prototype survey capturing barriers families face in accessing therapy." },
];

// ---------------- SUPPORT ----------------
export const AAC_TILES = [
  { id: "want", label: "I want", icon: "Hand", color: "#5E8B7E" },
  { id: "food", label: "Food", icon: "Utensils", color: "#D9A441" },
  { id: "water", label: "Water", icon: "GlassWater", color: "#4F8A9E" },
  { id: "help", label: "Help", icon: "LifeBuoy", color: "#E08A6E" },
  { id: "break", label: "Break", icon: "Pause", color: "#7A9E9F" },
  { id: "bathroom", label: "Bathroom", icon: "DoorOpen", color: "#5FA07E" },
  { id: "yes", label: "Yes", icon: "Check", color: "#5E8B7E" },
  { id: "no", label: "No", icon: "X", color: "#C98474" },
  { id: "more", label: "More", icon: "Plus", color: "#D9A441" },
  { id: "stop", label: "Stop", icon: "OctagonX", color: "#C98474" },
  { id: "happy", label: "Happy", icon: "Smile", color: "#D9A441" },
  { id: "sad", label: "Sad", icon: "Frown", color: "#4F8A9E" },
  { id: "pain", label: "Pain", icon: "Zap", color: "#E08A6E" },
  { id: "play", label: "Play", icon: "Blocks", color: "#5FA07E" },
  { id: "sleep", label: "Sleep", icon: "Moon", color: "#7A9E9F" },
];

export const AAC_HISTORY = ["I want water.", "I need a break.", "I am happy."];

export const CONSULT_PROS = [
  { id: "cp1", name: "Dr. Meera Das", spec: "Speech Therapist", experience: 9, langs: ["Odia", "English"], slot: "Today 4:00 PM", initials: "MD", color: "#5E8B7E" },
  { id: "cp2", name: "Kavya Reddy", spec: "Occupational Therapist", experience: 7, langs: ["English"], slot: "Tomorrow 11:00 AM", initials: "KR", color: "#D9A441" },
  { id: "cp3", name: "Ravi Patnaik", spec: "Special Educator", experience: 11, langs: ["Odia", "Hindi"], slot: "Mon 5:30 PM", initials: "RP", color: "#4F8A9E" },
  { id: "cp4", name: "Dr. Arun Mishra", spec: "Developmental Specialist", experience: 14, langs: ["Hindi", "English"], slot: "Fri 3:00 PM", initials: "AM", color: "#C98474" },
];

// ---------------- INCLUDE ----------------
export const INCLUSIVE_CATEGORIES = ["All", "Restaurants", "Salons", "Libraries", "Parks", "Shopping Spaces", "Community Centers"];

export const INCLUSIVE_PLACES = [
  { id: "i1", name: "Sishu Bhawan Library", category: "Libraries", location: "Bhubaneswar", score: 92, rating: 4.8, sensory: ["Quiet Hours", "Low Lighting", "Sensory Space"], access: ["Wheelchair Accessible", "Staff Trained"] },
  { id: "i2", name: "Green Leaf Café", category: "Restaurants", location: "Cuttack", score: 86, rating: 4.6, sensory: ["Low Lighting", "Flexible Seating"], access: ["Staff Trained"] },
  { id: "i3", name: "Calm Cuts Salon", category: "Salons", location: "Bhubaneswar", score: 78, rating: 4.4, sensory: ["Quiet Hours", "Sensory Space"], access: ["Flexible Seating"] },
  { id: "i4", name: "Ekamra Kanan Park", category: "Parks", location: "Bhubaneswar", score: 88, rating: 4.7, sensory: ["Quiet Hours", "Sensory Space"], access: ["Wheelchair Accessible"] },
  { id: "i5", name: "Harmony Community Centre", category: "Community Centers", location: "Rourkela", score: 95, rating: 4.9, sensory: ["Quiet Hours", "Low Lighting", "Sensory Space"], access: ["Wheelchair Accessible", "Staff Trained", "Flexible Seating"] },
  { id: "i6", name: "Utkal Shopping Arcade", category: "Shopping Spaces", location: "Cuttack", score: 71, rating: 4.2, sensory: ["Low Lighting"], access: ["Wheelchair Accessible"] },
];

export const INCLUSIVE_REVIEWS = [
  { id: "rv1", place: "Sishu Bhawan Library", name: "Meena R.", initials: "MR", color: "#E08A6E", stars: 5, text: "Quiet hours in the morning made it so easy for my son to enjoy books.", time: "3d ago" },
  { id: "rv2", place: "Harmony Community Centre", name: "Aditya S.", initials: "AS", color: "#5E8B7E", stars: 5, text: "Staff were trained and patient. A truly welcoming space.", time: "1w ago" },
];

// ---------------- EMPOWER ----------------
export const PASSPORT = {
  name: "Arjun Sharma",
  age: 7,
  communicationType: "Uses visual communication and simple verbal prompts.",
  communicationNeeds: "Responds best to short sentences and visual cues. Give extra time to reply.",
  triggers: ["Loud noises", "Crowded environments", "Bright lights"],
  strategies: ["Give transition warnings", "Use visual schedules", "Provide a quiet space", "Use simple instructions"],
  emergency: "If overwhelmed, move to a quiet area and offer his blue fidget toy. Emergency contact: Priya Sharma (Parent).",
};

export const MENTORS = [
  { id: "me1", name: "Lata Behera", role: "Parent Mentor", experience: 12, langs: ["Odia", "English"], interests: ["Routines", "School inclusion"], availability: "Weekends", initials: "LB", color: "#5E8B7E" },
  { id: "me2", name: "Sanjay Das", role: "Community Mentor", experience: 8, langs: ["Hindi", "Odia"], interests: ["AAC", "Sensory support"], availability: "Weekday evenings", initials: "SD", color: "#D9A441" },
  { id: "me3", name: "Rupa Mohanty", role: "Special Educator Mentor", experience: 15, langs: ["Odia", "English"], interests: ["Learning", "Behaviour"], availability: "Flexible", initials: "RM", color: "#4F8A9E" },
];

// ---------------- NOTIFICATIONS ----------------
export const NOTIFICATIONS = [
  { id: "n1", text: "Your therapist sent an update.", time: "10 min ago", icon: "MessageSquare" },
  { id: "n2", text: "New resource available.", time: "1h ago", icon: "BookOpen" },
  { id: "n3", text: "Your consultation is tomorrow.", time: "3h ago", icon: "CalendarClock" },
  { id: "n4", text: "Someone replied to your forum post.", time: "1d ago", icon: "Users" },
];

// ---------------- GLOBAL SEARCH INDEX ----------------
export const SEARCH_INDEX = [
  ...LEARN_MODULES.map((m) => ({ label: m.title, type: "Learning resource", to: "/learn" })),
  ...PROFESSIONALS.map((p) => ({ label: `${p.name} · ${p.type}`, type: "Professional", to: "/navigate" })),
  ...INCLUSIVE_PLACES.map((p) => ({ label: p.name, type: "Inclusive place", to: "/include" })),
  ...FORUM_POSTS.map((p) => ({ label: p.title, type: "Community post", to: "/connect" })),
  ...MENTORS.map((m) => ({ label: `${m.name} · ${m.role}`, type: "Mentor", to: "/empower" })),
  { label: "AAC Communication Board", type: "Tool", to: "/support" },
  { label: "My Autism Passport", type: "Profile", to: "/empower" },
];

export const ONBOARD_ROLES = [
  { id: "parent", label: "I'm a Parent", icon: "Heart" },
  { id: "therapist", label: "I'm a Therapist", icon: "Stethoscope" },
  { id: "educator", label: "I'm an Educator", icon: "GraduationCap" },
  { id: "mentor", label: "I'm a Mentor", icon: "HandHeart" },
];
