import React from 'react';
import {
  Vote,
  ClipboardList,
  BarChart3,
  Scale,
  Building2,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { ElectionCategory } from '../types';

interface CategoryIconProps {
  category?: ElectionCategory | string;
  className?: string;
  size?: number;
}

const ICONS: Record<string, LucideIcon> = {
  election: Vote,
  survey: ClipboardList,
  poll: BarChart3,
  referendum: Scale,
  governance: Building2,
  other: Sparkles,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category = 'election',
  className = 'w-4 h-4',
  size = 16,
}) => {
  const Icon = ICONS[category.toLowerCase()] ?? Vote;
  return <Icon className={className} size={size} />;
};

export default CategoryIcon;
