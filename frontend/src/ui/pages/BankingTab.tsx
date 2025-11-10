import { useState } from 'react';
import { useBankEntries, useBankSurplus, useApplyBanked, useDeleteBankEntry } from '@/application/hooks/useBanking';
import { Table } from '@/ui/components/Table';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { BankEntry } from '@/adapters/api/banking-api';

export function BankingTab() {
  const [showBankForm, setShowBankForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    surplusUnits: '',
    bankingDate: new Date().toISOString().split('T')[0],
    maxBankingCapacity: '',
    bankingValidityYears: '2',
    shipId: '',
  });
  const [applyFormData, setApplyFormData] = useState({
    deficit: '',
    applicationDate: new Date().toISOString().split('T')[0],
  });

  const { data: entries = [], isLoading } = useBankEntries();
  const bankSurplus = useBankSurplus();
  const applyBanked = useApplyBanked();
  const deleteEntry = useDeleteBankEntry();

  const handleBankSurplus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bankSurplus.mutateAsync({
        surplusUnits: Number(bankFormData.surplusUnits),
        bankingDate: new Date(bankFormData.bankingDate).toISOString(),
        maxBankingCapacity: bankFormData.maxBankingCapacity
          ? Number(bankFormData.maxBankingCapacity)
          : undefined,
        bankingValidityYears: Number(bankFormData.bankingValidityYears),
        shipId: bankFormData.shipId || undefined,
      });
      setShowBankForm(false);
      setBankFormData({
        surplusUnits: '',
        bankingDate: new Date().toISOString().split('T')[0],
        maxBankingCapacity: '',
        bankingValidityYears: '2',
        shipId: '',
      });
    } catch (err) {
      console.error('Failed to bank surplus:', err);
    }
  };

  const handleApplyBanked = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applyBanked.mutateAsync({
        deficit: Number(applyFormData.deficit),
        applicationDate: new Date(applyFormData.applicationDate).toISOString(),
        availableBankedUnits: entries.map((e) => ({
          id: e.id,
          units: e.units,
          bankedAt: e.bankedAt,
          expiryDate: e.expiryDate,
        })),
      });
      setShowApplyForm(false);
      setApplyFormData({
        deficit: '',
        applicationDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to apply banked units:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank entry?')) {
      try {
        await deleteEntry.mutateAsync(id);
        // Query will automatically refetch due to invalidation in the hook
      } catch (err) {
        console.error('Failed to delete bank entry:', err);
        alert('Failed to delete bank entry. Please try again.');
      }
    }
  };

  const columns = [
    { key: 'shipId' as keyof BankEntry, header: 'Ship ID' },
    { key: 'units' as keyof BankEntry, header: 'Units' },
    { key: 'bankedAt' as keyof BankEntry, header: 'Banked At' },
    {
      key: 'expiryDate' as keyof BankEntry,
      header: 'Expiry Date',
      render: (value: BankEntry[keyof BankEntry], row: BankEntry) => {
        const expiry = new Date(row.expiryDate);
        const isExpired = expiry < new Date();
        return (
          <span className={isExpired ? 'text-red-600 font-semibold' : 'text-gray-700'}>
            {expiry.toLocaleDateString()}
            {isExpired && ' (Expired)'}
          </span>
        );
      },
    },
    {
      key: 'id' as keyof BankEntry,
      header: 'Actions',
      render: (_value: BankEntry[keyof BankEntry], row: BankEntry) => (
        <Button
          variant="danger"
          onClick={() => handleDeleteEntry(row.id)}
          disabled={deleteEntry.isPending}
          className="text-sm"
        >
          {deleteEntry.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-gradient-primary mb-2">Banking</h2>
          <p className="text-slate-600 text-sm font-medium">Manage compliance unit banking and surplus allocation</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowBankForm(!showBankForm)}>
            {showBankForm ? 'Cancel' : '+ Bank Surplus'}
          </Button>
          <Button variant="secondary" onClick={() => setShowApplyForm(!showApplyForm)}>
            {showApplyForm ? 'Cancel' : 'Apply Banked'}
          </Button>
        </div>
      </div>

      {showBankForm && (
        <form onSubmit={handleBankSurplus} className="card-elevated p-8 space-y-6 animate-slide-down">
          <div>
            <h3 className="text-2xl font-bold text-gradient-accent mb-2">Bank Surplus Units</h3>
            <p className="text-slate-600 text-sm">Store surplus compliance units for future use</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Ship ID"
              type="text"
              value={bankFormData.shipId}
              onChange={(e) => setBankFormData({ ...bankFormData, shipId: e.target.value })}
              required
            />
            <Input
              label="Surplus Units"
              type="number"
              step="0.01"
              value={bankFormData.surplusUnits}
              onChange={(e) => setBankFormData({ ...bankFormData, surplusUnits: e.target.value })}
              required
            />
            <Input
              label="Banking Date"
              type="date"
              value={bankFormData.bankingDate}
              onChange={(e) => setBankFormData({ ...bankFormData, bankingDate: e.target.value })}
              required
            />
            <Input
              label="Max Banking Capacity (optional)"
              type="number"
              step="0.01"
              value={bankFormData.maxBankingCapacity}
              onChange={(e) =>
                setBankFormData({ ...bankFormData, maxBankingCapacity: e.target.value })
              }
            />
            <Input
              label="Validity Years"
              type="number"
              min="1"
              max="10"
              value={bankFormData.bankingValidityYears}
              onChange={(e) =>
                setBankFormData({ ...bankFormData, bankingValidityYears: e.target.value })
              }
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={bankSurplus.isPending}>
              {bankSurplus.isPending ? 'Banking...' : 'Bank Surplus'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowBankForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {showApplyForm && (
        <form onSubmit={handleApplyBanked} className="card-elevated p-8 space-y-6 animate-slide-down">
          <div>
            <h3 className="text-2xl font-bold text-gradient-primary mb-2">Apply Banked Units</h3>
            <p className="text-slate-600 text-sm">Use stored compliance units to cover deficits</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Deficit"
              type="number"
              step="0.01"
              value={applyFormData.deficit}
              onChange={(e) => setApplyFormData({ ...applyFormData, deficit: e.target.value })}
              required
            />
            <Input
              label="Application Date"
              type="date"
              value={applyFormData.applicationDate}
              onChange={(e) =>
                setApplyFormData({ ...applyFormData, applicationDate: e.target.value })
              }
              required
            />
          </div>
          <div className="p-4 bg-primary-50/50 border border-primary-200 rounded-xl">
            <p className="text-sm font-semibold text-primary-700">
              Available banked units: <span className="text-primary-900 text-lg">{entries.filter((e) => new Date(e.expiryDate) >= new Date()).length}</span>
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={applyBanked.isPending}>
              {applyBanked.isPending ? 'Applying...' : 'Apply Banked Units'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowApplyForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="card-elevated p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Bank Entries</h3>
          <p className="text-slate-600 text-sm">View all stored compliance units and their expiry dates</p>
        </div>
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse text-slate-500 font-medium">Loading bank entries...</div>
          </div>
        )}
        {!isLoading && <Table columns={columns} data={entries} emptyText="No bank entries" />}
      </div>
    </div>
  );
}

