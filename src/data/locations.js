// World clock locations. Temperatures are representative static values;
// swap in a weather API here if live data is ever wanted.
export const locations = [
  {
    id: "berkeley",
    name: "Berkeley, California",
    timezone: "America/Los_Angeles",
    dotClass: "bg-blue-500", // UC Berkeley blue
    temp: 68,
    unit: "°F",
  },
  {
    id: "wellington",
    name: "Wellington, New Zealand",
    timezone: "Pacific/Auckland",
    dotClass: "bg-black", // New Zealand All Blacks
    temp: 16,
    unit: "°C",
  },
  {
    id: "rochester",
    name: "Rochester, New York",
    timezone: "America/New_York",
    dotClass: "bg-yellow-500", // University of Rochester yellow
    temp: 38,
    unit: "°F",
  },
  {
    id: "sydney",
    name: "Sydney, Australia",
    timezone: "Australia/Sydney",
    dotClass: "bg-orange-500", // Sydney Harbour Bridge orange
    temp: 22,
    unit: "°C",
  },
];
