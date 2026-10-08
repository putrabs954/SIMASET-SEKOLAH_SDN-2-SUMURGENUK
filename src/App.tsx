import React, { useState, useEffect } from 'react';
import { ActivePage, Asset } from './types';
import { db } from './services/db';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';

import { DashboardView } from './components/dashboard/DashboardView';
import { AssetList } from './components/assets/AssetList';
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { AssetFormModal } from './components/assets/AssetFormModal';
import { AssetQrLabelModal } from './components/assets/AssetQrLabelModal';
import { ConsumableList } from './components/inventory/ConsumableList';
import { RoomList } from './components/rooms/RoomList';
import { BorrowingList } from './components/borrowings/BorrowingList';
import { MaintenanceList } from './components/maintenance/MaintenanceList';
import { MutationList } from './components/mutations/MutationList';
import { DisposalList } from './components/disposals/DisposalList';
import { SupplierList } from './components/suppliers/SupplierList';
import { DocumentList } from './components/documents/DocumentList';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { QRScannerView } from './components/scanner/QRScannerView';
import { UserList } from './components/users/UserList';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { SettingsView } from './components/settings/SettingsView';
import { ImportDataModal } from './components/import/ImportDataModal';
import { AssetAIAssistantModal } from './components/ai/AssetAIAssistantModal';
import { LoginView } from './components/auth/LoginView';
import { canAccessPage } from './services/auth';
import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => db.isLoggedIn());
  const [logoutMessage, setLogoutMessage] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<ActivePage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Asset Modals
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [createAssetOpen, setCreateAssetOpen] = useState(false);
  const [labelsToPrint, setLabelsToPrint] = useState<Asset[]>([]);
  const [filterConditionParam, setFilterConditionParam] = useState<string | undefined>();

  // Reactive DB subscription
  const [, setDbVersion] = useState(0);
  useEffect(() => {
    return db.subscribe(() => {
      setDbVersion(v => v + 1);
      setIsAuthenticated(db.isLoggedIn());
    });
  }, []);

  const handleLogout = () => {
    db.logout();
    setIsAuthenticated(false);
    setLogoutMessage(true);
  };

  const handleOpenDetail = (asset: Asset) => {
    setDetailAsset(asset);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditAsset(asset);
  };

  const handleOpenPrintLabel = (assets: Asset[]) => {
    setLabelsToPrint(assets);
  };

  const handleOpenBorrow = (asset: Asset) => {
    setCurrentPage('borrowings');
  };

  const handleOpenMutate = (asset: Asset) => {
    setCurrentPage('mutations');
  };

  const handleOpenMaintenance = (asset: Asset) => {
    setCurrentPage('maintenance');
  };

  const handleDeleteFromDetail = (asset: Asset) => {
    db.softDeleteAsset(asset.id, 'Penghapusan melalui rincian paspor aset');
    setDetailAsset(null);
  };

  const handleDashboardFilterCondition = (condition: string) => {
    setFilterConditionParam(condition);
    setCurrentPage('assets');
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setLogoutMessage(false);
        }}
        initialLogoutMessage={logoutMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-150">
      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={page => {
          setCurrentPage(page);
          if (page !== 'assets') setFilterConditionParam(undefined);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAI={() => setAiOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          onOpenAI={() => setAiOpen(true)}
          onNavigate={page => setCurrentPage(page)}
          onLogout={handleLogout}
        />

        {/* Security Warning: Default Password Banner */}
        {db.getCurrentUser()?.mustChangePassword && (
          <div className="bg-amber-500/15 dark:bg-amber-950/40 border-b border-amber-300 dark:border-amber-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <span className="font-bold">⚠️ Keamanan Akun:</span>
              <span>Akun Anda menggunakan kata sandi bawaan. Harap segera perbarui kata sandi demi keamanan data sekolah.</span>
            </div>
            <button
              onClick={() => setCurrentPage('settings')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0 transition"
            >
              Perbarui Sandi
            </button>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {!canAccessPage(currentPage) ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 my-8 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Akses Ditolak (Restricted)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Peran akun Anda tidak memiliki wewenang untuk membuka modul ini. Silakan hubungi Administrator sistem jika membutuhkan akses tambahan.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Kembali ke Dashboard
              </button>
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && (
            <DashboardView
              onNavigate={page => setCurrentPage(page)}
              onOpenNewAssetModal={() => setCreateAssetOpen(true)}
              onOpenStockInModal={() => setCurrentPage('inventory')}
              onOpenBorrowModal={() => setCurrentPage('borrowings')}
              onOpenMutationModal={() => setCurrentPage('mutations')}
              onOpenMaintenanceModal={() => setCurrentPage('maintenance')}
              onFilterCondition={handleDashboardFilterCondition}
            />
          )}

          {currentPage === 'assets' && (
            <AssetList
              onOpenDetail={handleOpenDetail}
              onOpenCreate={() => setCreateAssetOpen(true)}
              onOpenEdit={handleOpenEdit}
              onOpenPrintLabel={handleOpenPrintLabel}
              onOpenBorrow={handleOpenBorrow}
              onOpenMutate={handleOpenMutate}
              onOpenMaintenance={handleOpenMaintenance}
              initialConditionFilter={filterConditionParam}
            />
          )}

          {currentPage === 'inventory' && <ConsumableList />}

          {currentPage === 'rooms' && (
            <RoomList onSelectAsset={handleOpenDetail} />
          )}

          {currentPage === 'borrowings' && <BorrowingList />}

          {currentPage === 'maintenance' && <MaintenanceList />}

          {currentPage === 'mutations' && <MutationList />}

          {currentPage === 'disposals' && <DisposalList />}

          {currentPage === 'suppliers' && <SupplierList />}

          {currentPage === 'documents' && <DocumentList />}

          {currentPage === 'reports' && <ReportsCenter />}

          {currentPage === 'qr-scanner' && (
            <QRScannerView
              onOpenDetail={handleOpenDetail}
              onOpenEdit={handleOpenEdit}
              onOpenMutate={handleOpenMutate}
              onOpenBorrow={handleOpenBorrow}
              onOpenMaintenance={handleOpenMaintenance}
            />
          )}

          {currentPage === 'users' && <UserList />}

          {currentPage === 'audit-log' && <AuditLogViewer />}

          {currentPage === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {/* 1. Asset Passport Detail Modal */}
      <AssetDetailModal
        asset={detailAsset}
        isOpen={Boolean(detailAsset)}
        onClose={() => setDetailAsset(null)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteFromDetail}
        onBorrow={handleOpenBorrow}
        onMutate={handleOpenMutate}
        onMaintenance={handleOpenMaintenance}
        onPrintLabel={a => setLabelsToPrint([a])}
      />

      {/* 2. Asset Form (Create / Edit) */}
      <AssetFormModal
        isOpen={createAssetOpen || Boolean(editAsset)}
        assetToEdit={editAsset}
        onClose={() => {
          setCreateAssetOpen(false);
          setEditAsset(null);
        }}
        onSaved={saved => {
          setCreateAssetOpen(false);
          setEditAsset(null);
        }}
      />

      {/* 3. Printable QR Labels */}
      <AssetQrLabelModal
        assets={labelsToPrint}
        isOpen={labelsToPrint.length > 0}
        onClose={() => setLabelsToPrint([])}
      />

      {/* 4. Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={page => setCurrentPage(page)}
        onSelectAsset={handleOpenDetail}
      />

      {/* 5. Notification Drawer */}
      <NotificationDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigate={page => setCurrentPage(page)}
      />

      {/* 6. Import Data Modal */}
      <ImportDataModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => setCurrentPage('assets')}
      />

      {/* 7. ASSET AI ASSISTANT */}
      <AssetAIAssistantModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
      />
    </div>
  );
};

export default App;
