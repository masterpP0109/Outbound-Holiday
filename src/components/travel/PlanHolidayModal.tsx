import React from 'react';
import { TravelPackage } from '../../types';
import { HolidayBuilderModal } from './HolidayBuilderModal';

interface PlanHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: TravelPackage | null;
  preselectedActivity?: string | null;
}

export const PlanHolidayModal: React.FC<PlanHolidayModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
  preselectedActivity,
}) => {
  return (
    <HolidayBuilderModal
      isOpen={isOpen}
      onClose={onClose}
      preselectedPackage={preselectedPackage}
      preselectedActivity={preselectedActivity}
    />
  );
};
