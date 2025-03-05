// src/data/memeData.js

// Countries list for meme origins
export const countries = [
  'United States',
  'United Kingdom',
  'Japan',
  'South Korea',
  'Russia',
  'Canada',
  'Australia',
  'Brazil',
  'India',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Mexico',
  'Sweden',
  'Poland',
  'Netherlands',
  'China',
  'Finland',
  'Global/Internet',
  'Other'
];

// Some popular meme categories to help with organization
export const memeCategories = [
  'Image Macros',
  'Reaction GIFs',
  'Video Memes',
  'Social Media Trends',
  'TV/Movie References',
  'Music Memes',
  'Gaming Memes',
  'Animal Memes',
  'Celebrity Memes',
  'Political Memes',
  'Viral Challenges',
  'Rage Comics',
  'Wholesome Memes',
  'Absurdist Memes',
  'Internet Culture'
];

// Example popular memes from the last 25 years to help with testing
export const popularMemes = [
  { name: "Dancing Baby", year: 1996, month: 10, country: "United States" },
  { name: "All Your Base Are Belong To Us", year: 1999, month: 2, country: "Japan" },
  { name: "Rickroll", year: 2007, month: 5, country: "United States" },
  { name: "Doge", year: 2013, month: 7, country: "Japan" },
  { name: "Distracted Boyfriend", year: 2017, month: 8, country: "Spain" },
  { name: "Tide Pod Challenge", year: 2018, month: 1, country: "United States" },
  { name: "Woman Yelling at Cat", year: 2019, month: 5, country: "United States" },
  { name: "Bernie Sanders Mittens", year: 2021, month: 1, country: "United States" },
  { name: "One Does Not Simply", year: 2011, month: 6, country: "United States" },
  { name: "Gangnam Style", year: 2012, month: 7, country: "South Korea" },
  { name: "Harlem Shake", year: 2013, month: 2, country: "United States" },
  { name: "Ice Bucket Challenge", year: 2014, month: 7, country: "United States" },
  { name: "The Dress", year: 2015, month: 2, country: "United Kingdom" },
  { name: "Harambe", year: 2016, month: 5, country: "United States" },
  { name: "Salt Bae", year: 2017, month: 1, country: "Turkey" },
  { name: "Baby Shark", year: 2018, month: 6, country: "South Korea" },
  { name: "Area 51 Raid", year: 2019, month: 7, country: "United States" },
  { name: "Tiger King", year: 2020, month: 3, country: "United States" },
  { name: "Sea Shanty TikTok", year: 2021, month: 1, country: "United Kingdom" },
  { name: "Everything Everywhere All at Once", year: 2022, month: 3, country: "United States" },
  { name: "Barbie vs Oppenheimer", year: 2023, month: 7, country: "United States" }
];

// Function to get all months for display
export function getMonths() {
  return [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];
}

// Function to get a month name from its number
export function getMonthName(monthNumber) {
  const months = getMonths();
  const month = months.find(m => m.value === monthNumber);
  return month ? month.label : "Unknown";
}

// Calculate score based on how close the guess is to the actual date
export function calculateDateScore(guessYear, guessMonth, actualYear, actualMonth) {
  // Convert years and months to total months for easier comparison
  const guessMonths = (guessYear * 12) + guessMonth;
  const actualMonths = (actualYear * 12) + actualMonth;
  
  // Calculate absolute difference in months
  const monthsDifference = Math.abs(guessMonths - actualMonths);
  
  // Scoring logic: 
  // Perfect: 50 points
  // Within 1 month: 30 points
  // Within 3 months: 20 points
  // Within 6 months: 15 points
  // Within 12 months: 10 points
  // Within 24 months: 5 points
  // More than 24 months: 0 points
  
  if (monthsDifference === 0) {
    return { score: 50, feedback: "Perfect date match! +50 points" };
  } else if (monthsDifference <= 1) {
    return { score: 30, feedback: "Just 1 month off! +30 points" };
  } else if (monthsDifference <= 3) {
    return { score: 20, feedback: "Within 3 months! +20 points" };
  } else if (monthsDifference <= 6) {
    return { score: 15, feedback: "Within 6 months! +15 points" };
  } else if (monthsDifference <= 12) {
    return { score: 10, feedback: "Within a year! +10 points" };
  } else if (monthsDifference <= 24) {
    return { score: 5, feedback: "Within 2 years! +5 points" };
  } else {
    return { score: 0, feedback: "More than 2 years off! +0 points" };
  }
}

// Calculate score for correct country
export function calculateCountryScore(guessCountry, actualCountry) {
  if (guessCountry === actualCountry) {
    return { score: 20, feedback: "Correct country! +20 points" };
  }
  return { score: 0, feedback: `Wrong country! The correct country was ${actualCountry}. +0 points` };
}

// Calculate score for correct meme name
export function calculateMemeNameScore(guessName, actualName) {
  // Case insensitive comparison
  if (guessName.toLowerCase() === actualName.toLowerCase()) {
    return { score: 30, feedback: "Correct meme name! +30 points" };
  }
  return { score: 0, feedback: `Wrong meme name! It was "${actualName}". +0 points` };
}
