import React from 'react';
import { TravelPackage } from '../../types';
import { DetailedAccommodation } from '../../data/accommodationsData';
import { DetailedPackage } from '../../data/packagesData';
import { HolidayBuilderModal } from './HolidayBuilderModal';

export interface PreselectedStayDetails {
  roomId?: string;
  ratePlanId?: string;
  mealPlanId?: string;
  offerId?: string;
  arrivalDate?: string;
  departureDate?: string;
  adults?: number;
  childAgesYears?: number[];
}

interface PlanHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: TravelPackage | DetailedPackage | null;
  preselectedActivity?: string | null;
  preselectedAccommodation?: DetailedAccommodation | null;
  preselectedStayDetails?: PreselectedStayDetails | null;
  preselectedPromotion?: { id: number; name: string } | null;
}

export const PlanHolidayModal: React.FC<PlanHolidayModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
  preselectedActivity,
  preselectedAccommodation,
  preselectedStayDetails,
  preselectedPromotion,
}) => {
  return (
    <HolidayBuilderModal
      isOpen={isOpen}
      onClose={onClose}
      preselectedPackage={preselectedPackage}
      preselectedActivity={preselectedActivity}
      preselectedAccommodation={preselectedAccommodation}
      preselectedStayDetails={preselectedStayDetails}
      preselectedPromotion={preselectedPromotion}
    />
  );
};
