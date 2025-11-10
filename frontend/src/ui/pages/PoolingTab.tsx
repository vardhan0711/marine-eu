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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-gradient-primary mb-2">Pooling</h2>
          <p className="text-slate-600 text-sm font-medium">Create and manage compliance unit pools</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Pool'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6 animate-slide-down">
          <div>
            <h3 className="text-2xl font-bold text-gradient-accent mb-2">Create New Pool</h3>
            <p className="text-slate-600 text-sm">Set up a new compliance unit pool for sharing</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
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
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createPool.isPending}>
              {createPool.isPending ? 'Creating...' : 'Create Pool'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="card-elevated p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Pools</h3>
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

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse text-slate-500 font-medium">Loading pools...</div>
          </div>
        )}
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
        <div className="card-elevated p-8 animate-slide-down">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gradient-accent mb-2">Pool Members</h3>
              <p className="text-slate-600 text-sm">Manage members and allocations for this pool</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setSelectedPool(null)}>
                Close
              </Button>
              <Button onClick={() => setShowMemberForm(!showMemberForm)}>
                {showMemberForm ? 'Cancel' : '+ Add Member'}
              </Button>
            </div>
          </div>

          {showMemberForm && (
            <form onSubmit={handleAddMember} className="mb-6 p-6 bg-gradient-to-r from-primary-50/50 to-accent-50/30 rounded-xl space-y-4 border border-primary-200/50 animate-slide-down">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Add New Member</h4>
              <div className="grid grid-cols-2 gap-6">
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
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={addMember.isPending}>
                  {addMember.isPending ? 'Adding...' : 'Add Member'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowMemberForm(false)}>
                  Cancel
                </Button>
              </div>
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

