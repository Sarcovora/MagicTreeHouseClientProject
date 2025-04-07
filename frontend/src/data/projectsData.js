/**
 * Mock project data for the application
 */
const projectsData = [
  {
    id: 1,
    name: "ABCD Park",
    landowner: "John Doe",
    location: "California",
    address: "123 Rio Grande St, Austin TX",
    canopyGrowth: "15% increase",
    biodiversity: "24 species",
    image: "/images/project-images/forest_revival.jpg",
    contact: {
      phone: "+1 234 567 8900",
      email: "john@example.com",
    },
    metrics: {
      canopyGrowth: "15% increase",
      biodiversity: "24 species",
      carbonOffset: "150 tons",
      treesSurvival: "92%",
    },
    description:
      "A comprehensive reforestation project aimed at restoring native woodland...",
    status: "Active",
    startDate: "2023-01-15",
    lastUpdated: "2024-01-20",
  },
  {
    id: 2,
    name: "Forest Revival",
    landowner: "Jane Smith",
    location: "Oregon",
    address: "123 Rio Grande St, Austin TX",
    canopyGrowth: "22% increase",
    biodiversity: "31 species",
    image: "/images/project-images/abcd_park.jpg",
    contact: {
      phone: "+1 345 678 9012",
      email: "jane@example.com",
    },
    metrics: {
      canopyGrowth: "22% increase",
      biodiversity: "31 species",
      carbonOffset: "180 tons",
      treesSurvival: "88%",
    },
    description:
      "A project focused on reviving forest ecosystems in the Pacific Northwest...",
    status: "Active",
    startDate: "2023-03-10",
    lastUpdated: "2024-02-15",
  },
  {
    id: 3,
    name: "Green Future",
    landowner: "Bob Wilson",
    location: "Washington",
    address: "123 Rio Grande St, Austin TX",
    canopyGrowth: "18% increase",
    biodiversity: "27 species",
    image: "/images/project-images/green_future.jpeg",
    contact: {
      phone: "+1 456 789 0123",
      email: "bob@example.com",
    },
    metrics: {
      canopyGrowth: "18% increase",
      biodiversity: "27 species",
      carbonOffset: "130 tons",
      treesSurvival: "95%",
    },
    description:
      "An innovative approach to urban reforestation in Washington state...",
    status: "Active",
    startDate: "2023-05-20",
    lastUpdated: "2024-01-30",
  },
];

export default projectsData;
