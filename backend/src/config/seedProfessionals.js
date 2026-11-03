const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { ProfessionalProfile } = require("../models/ProfessionalProfile");

const INITIAL_PROFESSIONALS = [
  {
    email: "meera.das@lumina.test",
    name: "Dr. Meera Das",
    role: "therapist",
    isVerified: true,
    profile: {
      professionalType: "Speech Therapist",
      specialization: "Early language & AAC",
      bio: "Over 9 years of clinical speech and language therapy experience, focusing on non-speaking and minimally speaking children using augmentative communication systems.",
      city: "Bhubaneswar",
      languages: ["Odia", "English"],
      yearsExperience: 9,
      availability: "accepting_clients",
      rating: 4.9,
      reviewCount: 38,
      location: {
        type: "Point",
        coordinates: [85.8245, 20.2961],
        address: "Saheed Nagar, Bhubaneswar",
        district: "Khordha",
      },
    },
  },
  {
    email: "arun.mishra@lumina.test",
    name: "Dr. Arun Mishra",
    role: "therapist",
    isVerified: true,
    profile: {
      professionalType: "Developmental Pediatrician",
      specialization: "Early diagnosis & neurodevelopment",
      bio: "14 years of pediatric developmental assessments, guiding families through gentle, neurodiversity-affirming early intervention pathways.",
      city: "Bhubaneswar",
      languages: ["Hindi", "English"],
      yearsExperience: 14,
      availability: "waitlist",
      rating: 4.8,
      reviewCount: 52,
      location: {
        type: "Point",
        coordinates: [85.815, 20.305],
        address: "Jayadev Vihar, Bhubaneswar",
        district: "Khordha",
      },
    },
  },
  {
    email: "kavya.reddy@lumina.test",
    name: "Kavya Reddy",
    role: "therapist",
    isVerified: true,
    profile: {
      professionalType: "Occupational Therapist",
      specialization: "Sensory integration & motor skills",
      bio: "Specializing in sensory diets, calming room setups, and building practical everyday motor independence for children at home and in school.",
      city: "Cuttack",
      languages: ["English", "Odia"],
      yearsExperience: 7,
      availability: "accepting_clients",
      rating: 4.7,
      reviewCount: 29,
      location: {
        type: "Point",
        coordinates: [85.8828, 20.4625],
        address: "Badambadi, Cuttack",
        district: "Cuttack",
      },
    },
  },
  {
    email: "ravi.patnaik@lumina.test",
    name: "Ravi Patnaik",
    role: "therapist",
    isVerified: true,
    profile: {
      professionalType: "Special Educator",
      specialization: "Inclusive classrooms & IEPs",
      bio: "11 years designing individualized education programs (IEPs), classroom sensory accommodations, and collaborative educator training.",
      city: "Bhubaneswar",
      languages: ["Odia", "Hindi", "English"],
      yearsExperience: 11,
      availability: "accepting_clients",
      rating: 4.9,
      reviewCount: 44,
      location: {
        type: "Point",
        coordinates: [85.835, 20.285],
        address: "Bapuji Nagar, Bhubaneswar",
        district: "Khordha",
      },
    },
  },
  {
    email: "nisha.verma@lumina.test",
    name: "Dr. Nisha Verma",
    role: "therapist",
    isVerified: true,
    profile: {
      professionalType: "Psychologist",
      specialization: "Behaviour & caregiver counseling",
      bio: "10 years supporting families with compassionate behavioral psychology, caregiver stress relief, and sibling neurodiversity understanding.",
      city: "Cuttack",
      languages: ["Hindi", "English"],
      yearsExperience: 10,
      availability: "accepting_clients",
      rating: 4.6,
      reviewCount: 21,
      location: {
        type: "Point",
        coordinates: [85.87, 20.45],
        address: "Cantonment Road, Cuttack",
        district: "Cuttack",
      },
    },
  },
  {
    email: "sameer.joshi@lumina.test",
    name: "Sameer Joshi",
    role: "therapist",
    isVerified: true,
    profile: {
      professionalType: "Behaviour Therapist",
      specialization: "Positive behaviour support",
      bio: "Empowering families and classrooms with positive behavioral supports, reducing sensory overwhelm, and building communicative autonomy.",
      city: "Bhubaneswar",
      languages: ["English", "Odia"],
      yearsExperience: 8,
      availability: "waitlist",
      rating: 4.8,
      reviewCount: 33,
      location: {
        type: "Point",
        coordinates: [85.82, 20.292],
        address: "Khandagiri, Bhubaneswar",
        district: "Khordha",
      },
    },
  },
];

async function seedProfessionalsData() {
  const passwordHash = await bcrypt.hash("SafeProPassword123!", 10);

  for (const item of INITIAL_PROFESSIONALS) {
    let user = await User.findOne({ email: item.email });
    if (!user) {
      user = await User.create({
        name: item.name,
        email: item.email,
        passwordHash,
        role: item.role,
        isVerified: item.isVerified,
        guardianConsent: true,
        status: "active",
      });
    }

    const existingProfile = await ProfessionalProfile.findOne({ userId: user._id });
    if (!existingProfile) {
      await ProfessionalProfile.create({
        userId: user._id,
        ...item.profile,
      });
    }
  }
}

module.exports = {
  seedProfessionalsData,
  INITIAL_PROFESSIONALS,
};
