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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Banking</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowBankForm(!showBankForm)}>
            {showBankForm ? 'Cancel' : 'Bank Surplus'}
          </Button>
          <Button variant="secondary" onClick={() => setShowApplyForm(!showApplyForm)}>
            {showApplyForm ? 'Cancel' : 'Apply Banked'}
          </Button>
        </div>
      </div>

      {showBankForm && (
        <form onSubmit={handleBankSurplus} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Bank Surplus Units</h3>
          <div className="grid grid-cols-2 gap-4">
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
          <Button type="submit" disabled={bankSurplus.isPending}>
            {bankSurplus.isPending ? 'Banking...' : 'Bank Surplus'}
          </Button>
        </form>
      )}

      {showApplyForm && (
        <form onSubmit={handleApplyBanked} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Apply Banked Units</h3>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="text-sm text-gray-600">
            Available banked units: {entries.filter((e) => new Date(e.expiryDate) >= new Date()).length}
          </div>
          <Button type="submit" disabled={applyBanked.isPending}>
            {applyBanked.isPending ? 'Applying...' : 'Apply Banked Units'}
          </Button>
        </form>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Bank Entries</h3>
        {isLoading && <div className="text-center py-8">Loading...</div>}
        {!isLoading && <Table columns={columns} data={entries} emptyText="No bank entries" />}
      </div>
    </div>
  );
}

