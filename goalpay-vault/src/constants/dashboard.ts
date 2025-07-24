
export const DASHBOARD_STATS = {
  totalSaved: "$12,500",
  earnedYield: "$485",
  activeGoals: 4,
  friends: 12
};

export const MONTHLY_SUMMARY = {
  saved: "$2,450",
  yieldEarned: "+$125",
  goalsReached: 2
};

export const MOCK_GOALS = [
  {
    id: 1,
    name: "Summer Vacation Fund 🏖️",
    goal: 5000,
    current: 3250,
    members: 4,
    daysLeft: 45,
    status: "active"
  },
  {
    id: 2,
    name: "New Gaming PC 💻",
    goal: 2000,
    current: 1800,
    members: 2,
    daysLeft: 15,
    status: "active"
  },
  {
    id: 3,
    name: "Emergency Fund 🚨",
    goal: 10000,
    current: 6700,
    members: 5,
    daysLeft: 90,
    status: "active"
  }
];

export const MOCK_ACTIVITY = [
  { id: 1, user: "Sarah", action: "contributed", amount: 200, timestamp: "2 hours ago" },
  { id: 2, user: "Mike", action: "joined", timestamp: "1 day ago" },
  { id: 3, user: "Alex", action: "contributed", amount: 150, timestamp: "2 days ago" },
  { id: 4, user: "Emma", action: "contributed", amount: 100, timestamp: "3 days ago" }
];
