import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import DashboardCard from "@/components/DashboardCard";
import dashboardConfig from "@/config/dashboardConfig";
import { DashboardCategory } from "@/types/DashboardCategory";

export default function Dashboard() {
  const [search, setSearch] = useState<string>("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("dashboardOpenSections");
    return saved ? JSON.parse(saved) : {};
  });
  const [columns, setColumns] = useState<number>(() => {
    const savedCols = localStorage.getItem("dashboardColumns");
    return savedCols ? parseInt(savedCols) : 3;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("dashboardDarkMode") === "true";
  });
  const [recentItems, setRecentItems] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentDashboardItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("dashboardFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("dashboardColumns", columns.toString());
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("dashboardDarkMode", darkMode.toString());
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("dashboardOpenSections", JSON.stringify(openSections));
  }, [openSections]);

  useEffect(() => {
    localStorage.setItem("recentDashboardItems", JSON.stringify(recentItems));
  }, [recentItems]);

  useEffect(() => {
    localStorage.setItem("dashboardFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleFavorite = (path: string) => {
    setFavorites((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const getGridColsClass = (cols: number) =>
    cols === 1 ? "grid-cols-1" :
    cols === 2 ? "sm:grid-cols-2" :
    cols === 3 ? "sm:grid-cols-2 md:grid-cols-3" :
    "sm:grid-cols-2 md:grid-cols-4";

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-200">👑 Dashboard</h1>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards..."
              className="px-4 py-2 border rounded-lg dark:bg-purple-800 dark:text-white"
            />
            <select
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg dark:bg-purple-800 dark:text-white"
            >
              <option value={1}>1 col</option>
              <option value={2}>2 cols</option>
              <option value={3}>3 cols</option>
              <option value={4}>4 cols</option>
            </select>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 border rounded-lg dark:bg-purple-800 dark:text-white"
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {dashboardConfig.map((category: DashboardCategory) => {
            const filteredItems = category.items.filter((item) =>
              item.label.toLowerCase().includes(search.toLowerCase()) ||
              item.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={category.title} className="mb-10">
                <div
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() => toggleSection(category.title)}
                >
                  <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200">
                    {category.icon} {category.title}
                  </h2>
                  <span className="text-sm text-purple-600 dark:text-purple-300">
                    {openSections[category.title] === false ? "Show" : "Hide"}
                  </span>
                </div>

                {openSections[category.title] !== false && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`grid gap-6 ${getGridColsClass(columns)}`}
                  >
                    {filteredItems.map((card) => (
                      <DashboardCard
                        key={card.path}
                        path={card.path}
                        label={card.label}
                        subtitle={card.subtitle}
                        description={card.description}
                        image={card.image}
                        isFavorite={favorites.includes(card.path)}
                        onFavorite={() => toggleFavorite(card.path)}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
