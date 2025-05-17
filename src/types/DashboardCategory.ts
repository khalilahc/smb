// src/types/DashboardCategory.ts
import { DashboardItem } from "./DashboardItem";

export interface DashboardCategory {
  title: string;
  icon?: string;
  items: DashboardItem[];
}
