import React from 'react';
import { StatCards } from './StatCards';
import { DashboardCharts } from './DashboardCharts';
import { QuickActions } from './QuickActions';
import { SmartAlerts } from './SmartAlerts';
import { RecentActivity } from './RecentActivity';
import { ActivePage } from '../../types';

interface DashboardViewProps {
  onNavigate: (page: ActivePage) => void;
  onOpenNewAssetModal: () => void;
  onOpenStockInModal: () => void;
  onOpenBorrowModal: () => void;
  onOpenMutationModal: () => void;
  onOpenMaintenanceModal: () => void;
  onFilterCondition?: (condition: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewAssetModal,
  onOpenStockInModal,
  onOpenBorrowModal,
  onOpenMutationModal,
  onOpenMaintenanceModal,
  onFilterCondition,
}) => {
  return (
    <div className="space-y-6">
      {/* Smart Alerts at Top */}
      <SmartAlerts onNavigate={onNavigate} />

      {/* Main Stat Cards */}
      <StatCards onFilterCondition={onFilterCondition} />

      {/* Quick Action Shortcuts */}
      <QuickActions
        onNavigate={onNavigate}
        onOpenNewAssetModal={onOpenNewAssetModal}
        onOpenStockInModal={onOpenStockInModal}
        onOpenBorrowModal={onOpenBorrowModal}
        onOpenMutationModal={onOpenMutationModal}
        onOpenMaintenanceModal={onOpenMaintenanceModal}
      />

      {/* Charts Section */}
      <DashboardCharts />

      {/* Activity Timeline Feed */}
      <RecentActivity onNavigate={onNavigate} />
    </div>
  );
};
