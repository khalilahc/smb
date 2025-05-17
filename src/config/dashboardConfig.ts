import { DashboardCategory } from "@/types/DashboardCategory";

const dashboardConfig: DashboardCategory[] = [
  {
    title: "Spiritual",
    icon: "\ud83d\udcd6",
    items: [
      {
        path: "/bible-plan-tracker",
        label: "Bible Plan Tracker",
        subtitle: "Track your daily bible journey.",
        image: "/images/cards/bible-plan.jpg",
      },
      {
        path: "/prayers",
        label: "Prayer Requests",
        subtitle: "Submit and read prayer requests.",
        image: "/images/cards/prayers.jpg",
      },
      {
        path: "/prophetic-vault",
        label: "Prophetic Vault",
        subtitle: "Store your prophetic words.",
        image: "/images/cards/vault.jpg",
      },
      {
        path: "/daily-affirmations",
        label: "Daily Affirmations",
        subtitle: "Get daily encouragement.",
        image: "/images/cards/affirmations.jpg",
      },
      {
        path: "/books",
        label: "Books",
        subtitle: "Curated library for queens.",
        image: "/images/cards/books.jpg",
      },
    ],
  },
  {
    title: "Wellness",
    icon: "\ud83d\udc96",
    items: [
      {
        path: "/daily-log",
        label: "Daily Log",
        subtitle: "Log your thoughts and reflections.",
        image: "/images/cards/log.jpg",
      },
      {
        path: "/mood",
        label: "Mood Tracker",
        subtitle: "Track your emotional state.",
        image: "/images/cards/mood.jpg",
      },
      {
        path: "/breakthroughs",
        label: "Breakthroughs",
        subtitle: "Celebrate your spiritual wins.",
        image: "/images/cards/breakthrough.jpg",
      },
      {
        path: "/dashboard/vision-board",
        label: "Vision Board",
        subtitle: "Visualize your spiritual journey.",
        image: "/images/cards/vision-board.jpg",
      },
    ],
  },
  {
    title: "Community",
    icon: "\ud83c\udf0d",
    items: [
      {
        path: "/members",
        label: "Member Directory",
        subtitle: "Connect with fellow queens.",
        image: "/images/cards/directory.jpg",
      },
      {
        path: "/chatroom",
        label: "Chat Room",
        subtitle: "Join the royal conversation.",
        image: "/images/cards/chat.jpg",
      },
      {
        path: "/community",
        label: "Community",
        subtitle: "Uplifting messages from all.",
        image: "/images/cards/community.jpg",
      },
      {
        path: "/events",
        label: "Events",
        subtitle: "See what’s happening next.",
        image: "/images/cards/events.jpg",
      },
      {
        path: "/business",
        label: "Business Directory",
        subtitle: "Support faith-based businesses.",
        image: "/images/cards/business.jpg",
      },
      {
        path: "/live-room",
        label: "Live Audio Room",
        subtitle: "Join the live audio sessions.",
        image: "/images/cards/live-room.jpg",
      },
    ],
  },
  {
    title: "Rewards",
    icon: "\ud83c\udff1",
    items: [
      {
        path: "/journal",
        label: "Journal",
        subtitle: "Your personal spiritual journal.",
        image: "/images/cards/journal.jpg",
      },
      {
        path: "/responses",
        label: "Responses",
        subtitle: "See how prayers were answered.",
        image: "/images/cards/responses.jpg",
      },
      {
        path: "/rewards",
        label: "Rewards",
        subtitle: "Earn rewards as you grow.",
        image: "/images/cards/rewards.jpg",
      },
      {
        path: "/badges",
        label: "Badges",
        subtitle: "Show off your spiritual achievements.",
        image: "/images/cards/badges.jpg",
      },
    ],
  },
  {
    title: "Extras",
    icon: "\u2728",
    items: [
      {
        path: "/shop",
        label: "Queen's Shop",
        subtitle: "Divine items in the Queen's Shop.",
        image: "/images/cards/shop.jpg",
      },
    ],
  },
];

export default dashboardConfig;
