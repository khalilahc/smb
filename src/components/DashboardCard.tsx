import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface DashboardCardProps {
  path: string;
  label: string;
  subtitle?: string;
  description?: string;
  image?: string;
  onFavorite: () => void;
  isFavorite: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  path,
  label,
  subtitle,
  description,
  image,
  onFavorite,
  isFavorite,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("Clicked card:", path);
    if (path === "/shop") {
      window.location.href = "https://khalilahk-beautique.myshopify.com";
    } else {
      console.log("➡️ Navigating to:", path);
      navigate(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {image && (
        <img src={image} alt={label} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {label}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className="text-pink-500 hover:text-pink-600"
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
        {description && (
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
