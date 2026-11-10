import React from 'react';
import { TravelPackage } from '../../types';
import { DetailedAccommodation } from '../../data/accommodationsData';
import { DetailedPackage } from '../../data/packagesData';
import { HolidayBuilderModal } from './HolidayBuilderModal';

interface PlanHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: TravelPackage | DetailedPackage | null;
  preselectedActivity?: string | null;
  preselectedAccommodation?: DetailedAccommodation | null;
}

export const PlanHolidayModal: React.FC<PlanHolidayModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
  preselectedActivity,
  preselectedAccommodation,
}) => {
  return (
    <HolidayBuilderModal
      isOpen={isOpen}
      onClose={onClose}
      preselectedPackage={preselectedPackage}
      preselectedActivity={preselectedActivity}
      preselectedAccommodation={preselectedAccommodation}
    />
  );
};
