import React from 'react';
import {
  Hammer,
  Paintbrush,
  Wheat,
  PackageCheck,
  Wrench,
  Droplets,
  Zap,
  Home,
  Truck,
  Flower2,
  Flame,
  Users,
  Briefcase,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Paintbrush':
      return <Paintbrush className={className} />;
    case 'Wheat':
      return <Wheat className={className} />;
    case 'PackageCheck':
      return <PackageCheck className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Flower2':
      return <Flower2 className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Users':
      return <Users className={className} />;
    default:
      return <Briefcase className={className} />;
  }
};
