import React from 'react';
import {
  Bath,
  Check,
  Coffee,
  Laptop,
  Lock,
  ShowerHead,
  Sparkles,
  Sun,
  Trees,
  Tv,
  Utensils,
  Waves,
  Wifi,
  Wind,
  Wine,
} from 'lucide-react';
import type { RoomAmenityOption } from '../../utils/roomPricing';

export const RoomAmenityIcon: React.FC<{
  icon: RoomAmenityOption['icon'];
  className?: string;
}> = ({ icon, className = 'w-3.5 h-3.5 text-[#0B5E8E] shrink-0' }) => {
  switch (icon) {
    case 'wind':
      return <Wind className={className} aria-hidden="true" />;
    case 'wifi':
      return <Wifi className={className} aria-hidden="true" />;
    case 'tv':
      return <Tv className={className} aria-hidden="true" />;
    case 'bath':
      return <Bath className={className} aria-hidden="true" />;
    case 'shower':
      return <ShowerHead className={className} aria-hidden="true" />;
    case 'sun':
      return <Sun className={className} aria-hidden="true" />;
    case 'waves':
      return <Waves className={className} aria-hidden="true" />;
    case 'trees':
      return <Trees className={className} aria-hidden="true" />;
    case 'wine':
      return <Wine className={className} aria-hidden="true" />;
    case 'utensils':
      return <Utensils className={className} aria-hidden="true" />;
    case 'coffee':
      return <Coffee className={className} aria-hidden="true" />;
    case 'lock':
      return <Lock className={className} aria-hidden="true" />;
    case 'laptop':
      return <Laptop className={className} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    default:
      return <Check className={className} aria-hidden="true" />;
  }
};
