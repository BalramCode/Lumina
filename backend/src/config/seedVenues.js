const { InclusiveVenue } = require("../models/InclusiveVenue");

const INITIAL_VENUES = [
  {
    name: "Sishu Bhawan Library",
    category: "Libraries",
    location: "Bhubaneswar",
    address: "Bapuji Nagar, Near Sishu Bhawan, Bhubaneswar",
    score: 92,
    rating: 4.8,
    sensory: ["Quiet Hours", "Low Lighting", "Sensory Space"],
    access: ["Wheelchair Accessible", "Staff Trained"],
    description: "Children's library featuring designated calm reading nooks, dimmed lighting sections, and weekly sensory-friendly story hours.",
    geo: {
      type: "Point",
      coordinates: [85.8245, 20.2705],
    },
    verified: true,
  },
  {
    name: "Green Leaf Café",
    category: "Restaurants",
    location: "Cuttack",
    address: "Cantonment Road, Cuttack",
    score: 86,
    rating: 4.6,
    sensory: ["Low Lighting", "Flexible Seating"],
    access: ["Staff Trained"],
    description: "Community café with sound-absorbing acoustic ceiling panels, quiet booth seating, and patient, allergen-aware staff.",
    geo: {
      type: "Point",
      coordinates: [85.875, 20.465],
    },
    verified: true,
  },
  {
    name: "Calm Cuts Salon",
    category: "Salons",
    location: "Bhubaneswar",
    address: "Saheed Nagar, Bhubaneswar",
    score: 78,
    rating: 4.4,
    sensory: ["Quiet Hours", "Sensory Space"],
    access: ["Flexible Seating"],
    description: "Hair salon offering silent haircut appointments with no background music, weighted lap pads, and visual timers.",
    geo: {
      type: "Point",
      coordinates: [85.835, 20.292],
    },
    verified: true,
  },
  {
    name: "Ekamra Kanan Park",
    category: "Parks",
    location: "Bhubaneswar",
    address: "Nayapalli, Bhubaneswar",
    score: 88,
    rating: 4.7,
    sensory: ["Quiet Hours", "Sensory Space"],
    access: ["Wheelchair Accessible"],
    description: "Expansive botanical park with shaded quiet walking loops, barrier-free paved trails, and a peaceful lake garden.",
    geo: {
      type: "Point",
      coordinates: [85.811, 20.306],
    },
    verified: true,
  },
  {
    name: "Harmony Community Centre",
    category: "Community Centers",
    location: "Rourkela",
    address: "Sector 4, Rourkela",
    score: 95,
    rating: 4.9,
    sensory: ["Quiet Hours", "Low Lighting", "Sensory Space"],
    access: ["Wheelchair Accessible", "Staff Trained", "Flexible Seating"],
    description: "Inclusive municipal hub equipped with tactile play equipment, soft-flooring relaxation zones, and accessibility navigators.",
    geo: {
      type: "Point",
      coordinates: [84.856, 22.253],
    },
    verified: true,
  },
  {
    name: "Utkal Shopping Arcade",
    category: "Shopping Spaces",
    location: "Cuttack",
    address: "Badambadi, Cuttack",
    score: 71,
    rating: 4.2,
    sensory: ["Low Lighting"],
    access: ["Wheelchair Accessible"],
    description: "Retail center providing step-free ramps, wide aisles, and sensory decompression benches on every level.",
    geo: {
      type: "Point",
      coordinates: [85.889, 20.458],
    },
    verified: true,
  },
];

async function seedVenuesData() {
  for (const item of INITIAL_VENUES) {
    await InclusiveVenue.findOneAndUpdate(
      { name: item.name },
      { $set: item },
      { upsert: true, returnDocument: "after" }
    );
  }
}

module.exports = {
  INITIAL_VENUES,
  seedVenuesData,
};
