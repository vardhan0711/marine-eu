import { useState } from 'react';
import { usePools, useCreatePool, useDeletePool, usePoolMembers, useAddPoolMember } from '@/application/hooks/usePools';
import { Table } from '@/ui/components/Table';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Select } from '@/ui/components/Select';
import { Pool, PoolMember } from '@/adapters/api/pools-api';

export function PoolingTab() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    poolType: 'VOLUNTARY' as 'VOLUNTARY' | 'MANDATORY' | 'COMPANY' | 'FLEET',
    startDate: '',
    endDate: '',
    totalComplianceUnits: '',
    allocatedComplianceUnits: '',
  });
  const [memberFormData, setMemberFormData] = useState({
    shipId: '',
    units: '',
  });

  const { data: pools = [], isLoading } = usePools(filterStatus ? { status: filterStatus } : undefined);
  const { data: members = [] } = usePoolMembers(selectedPool);
  const createPool = useCreatePool();
  const deletePool = useDeletePool();
  const addMember = useAddPoolMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPool.mutateAsync({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        totalComplianceUnits: formData.totalComplianceUnits ? Number(formData.totalComplianceUnits) : undefined,
        allocatedComplianceUnits: formData.allocatedComplianceUnits ? Number(formData.allocatedComplianceUnits) : undefined,
      });
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        poolType: 'VOLUNTARY',
        startDate: '',
        endDate: '',
        totalComplianceUnits: '',
        allocatedComplianceUnits: '',
      });
    } catch (err) {
      console.error('Failed to create pool:', err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPool) return;
    try {
      await addMember.mutateAsync({
        id: selectedPool,
        shipId: memberFormData.shipId,
        units: Number(memberFormData.units),
      });
      setShowMemberForm(false);
      setMemberFormData({ shipId: '', units: '' });
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this pool?')) {
      try {
        await deletePool.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete pool:', err);
      }
    }
  };

  const poolColumns = [
    { 
      key: 'name' as keyof Pool, 
      header: 'Name' 
    },
    { 
      key: 'poolType' as keyof Pool, 
      header: 'Type' 
    },
    { 
      key: 'status' as keyof Pool, 
      header: 'Status' 
    },
    { 
      key: 'totalComplianceUnits' as keyof Pool, 
      header: 'Total Units',
      render: (value: Pool[keyof Pool]) => {
        return typeof value === 'number' ? value.toFixed(2) : value;
      }
    },
    { 
      key: 'allocatedComplianceUnits' as keyof Pool, 
      header: 'Allocated Units',
      render: (value: Pool[keyof Pool]) => {
        return typeof value === 'number' ? value.toFixed(2) : value;
      }
    },
    {
      key: 'id' as keyof Pool,
      header: 'Actions',
      render: (_value: Pool[keyof Pool], row: Pool) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelectedPool(row.id)}>
            View Members
          </Button>
          <Button variant="danger" onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const memberColumns = [
    { 
      key: 'shipId' as keyof PoolMember, 
      header: 'Ship ID' 
    },
    { 
      key: 'allocatedUnits' as keyof PoolMember, 
      header: 'Allocated Units',
      render: (value: PoolMember[keyof PoolMember]) => {
        return typeof value === 'number' ? value.toFixed(2) : value;
      }
    },
    { 
      key: 'contribution' as keyof PoolMember, 
      header: 'Contribution %',
      render: (value: PoolMember[keyof PoolMember]) => {
        return typeof value === 'number' ? `${value.toFixed(2)}%` : value;
      }
    },
    { 
      key: 'joinedAt' as keyof PoolMember, 
      header: 'Joined At',
      render: (value: PoolMember[keyof PoolMember]) => {
        return value instanceof Date 
          ? value.toLocaleDateString() 
          : typeof value === 'string' 
            ? new Date(value).toLocaleDateString() 
            : value;
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pooling</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Pool'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Create New Pool</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pool Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Pool Type"
              value={formData.poolType}
              onChange={(e) => setFormData({ ...formData, poolType: e.target.value as any })}
              options={[
                { value: 'VOLUNTARY', label: 'Voluntary' },
                { value: 'MANDATORY', label: 'Mandatory' },
                { value: 'COMPANY', label: 'Company' },
                { value: 'FLEET', label: 'Fleet' },
              ]}
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
            <Input
              label="Total Units"
              type="number"
              step="0.01"
              value={formData.totalComplianceUnits}
              onChange={(e) => setFormData({ ...formData, totalComplianceUnits: e.target.value })}
              required
            />
            <Input
              label="Allocated Units"
              type="number"
              step="0.01"
              value={formData.allocatedComplianceUnits}
              onChange={(e) => setFormData({ ...formData, allocatedComplianceUnits: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={createPool.isPending}>
            {createPool.isPending ? 'Creating...' : 'Create Pool'}
          </Button>
        </form>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div className="mb-4">
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'CLOSED', label: 'Closed' },
              { value: 'SUSPENDED', label: 'Suspended' },
            ]}
            className="max-w-xs"
          />
        </div>

        {isLoading && <div className="text-center py-8">Loading...</div>}
        {!isLoading && (
          <Table 
            columns={poolColumns} 
            data={pools} 
            emptyText="No pools available"
            getRowKey={(row) => row.id}
          />
        )}
      </div>

      {selectedPool && (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Pool Members</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setSelectedPool(null)}>
                Close
              </Button>
              <Button onClick={() => setShowMemberForm(!showMemberForm)}>
                {showMemberForm ? 'Cancel' : 'Add Member'}
              </Button>
            </div>
          </div>

          {showMemberForm && (
            <form onSubmit={handleAddMember} className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-gray-100 hover:to-blue-100 transition-all duration-300 space-y-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ship ID"
                  value={memberFormData.shipId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, shipId: e.target.value })}
                  required
                />
                <Input
                  label="Units"
                  type="number"
                  step="0.01"
                  value={memberFormData.units}
                  onChange={(e) => setMemberFormData({ ...memberFormData, units: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={addMember.isPending}>
                {addMember.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </form>
          )}

          <Table 
            columns={memberColumns} 
            data={members} 
            emptyText="No members in this pool"
            getRowKey={(row) => row.id}
          />
        </div>
      )}
    </div>
  );
}

