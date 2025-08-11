export interface Sport {
  id: string;
  name: string;
  category: string;
  isPopular: boolean;
}

// Predefined sports options for court management
export const PREDEFINED_SPORTS: Sport[] = [
  {
    id: "basketball",
    name: "Basketball",
    category: "Indoor",
    isPopular: true,
  },
  {
    id: "tennis",
    name: "Tennis",
    category: "Outdoor",
    isPopular: true,
  },
  {
    id: "football",
    name: "Football/Soccer",
    category: "Outdoor",
    isPopular: true,
  },
  {
    id: "badminton",
    name: "Badminton",
    category: "Indoor",
    isPopular: true,
  },
  {
    id: "cricket",
    name: "Cricket",
    category: "Outdoor",
    isPopular: true,
  },
  {
    id: "swimming",
    name: "Swimming",
    category: "Aquatic",
    isPopular: false,
  },
  {
    id: "volleyball",
    name: "Volleyball",
    category: "Indoor/Outdoor",
    isPopular: false,
  },
  {
    id: "squash",
    name: "Squash",
    category: "Indoor",
    isPopular: false,
  },
  {
    id: "table-tennis",
    name: "Table Tennis",
    category: "Indoor",
    isPopular: false,
  },
  {
    id: "hockey",
    name: "Hockey",
    category: "Outdoor",
    isPopular: false,
  },
];

// Helper function to get sports sorted by popularity and name
export const getSortedSports = (): Sport[] => {
  return PREDEFINED_SPORTS.sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return a.name.localeCompare(b.name);
  });
};

// Helper function to get sport by ID
export const getSportById = (id: string): Sport | undefined => {
  return PREDEFINED_SPORTS.find(sport => sport.id === id);
};

// Helper function to get sports by category
export const getSportsByCategory = (category: string): Sport[] => {
  return PREDEFINED_SPORTS.filter(sport => sport.category === category);
};

// Helper function to get popular sports only
export const getPopularSports = (): Sport[] => {
  return PREDEFINED_SPORTS.filter(sport => sport.isPopular);
};
