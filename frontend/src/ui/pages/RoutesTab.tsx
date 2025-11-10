import { useState } from 'react';
import { useRoutes, useCreateRoute, useDeleteRoute } from '@/application/hooks/useRoutes';
import { Table } from '@/ui/components/Table';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Select } from '@/ui/components/Select';
import { Route } from '@/adapters/api/routes-api';

export function RoutesTab() {
  const [filters, setFilters] = useState({ originPort: '', destinationPort: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    originPort: '',
    destinationPort: '',
    distance: '',
    routeType: 'INTRA_EU' as 'INTRA_EU' | 'EXTRA_EU' | 'MIXED',
  });

  const { data: routes = [], isLoading, error } = useRoutes(
    filters.originPort || filters.destinationPort ? filters : undefined
  );
  const createRoute = useCreateRoute();
  const deleteRoute = useDeleteRoute();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoute.mutateAsync({
        ...formData,
        distance: Number(formData.distance),
      });
      setShowForm(false);
      setFormData({
        originPort: '',
        destinationPort: '',
        distance: '',
        routeType: 'INTRA_EU',
      });
    } catch (err) {
      console.error('Failed to create route:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete route:', err);
      }
    }
  };

  const columns = [
    { 
      key: 'originPort' as keyof Route, 
      header: 'Origin Port' 
    },
    { 
      key: 'destinationPort' as keyof Route, 
      header: 'Destination Port' 
    },
    { 
      key: 'distance' as keyof Route, 
      header: 'Distance (nm)',
      render: (value: Route[keyof Route]) => {
        return typeof value === 'number' ? value.toFixed(2) : value;
      }
    },
    { 
      key: 'routeType' as keyof Route, 
      header: 'Route Type' 
    },
    {
      key: 'id' as keyof Route,
      header: 'Actions',
      render: (_value: Route[keyof Route], row: Route) => (
        <Button variant="danger" onClick={() => handleDelete(row.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Routes</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Route'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Add New Route</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Origin Port"
              value={formData.originPort}
              onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
              required
            />
            <Input
              label="Destination Port"
              value={formData.destinationPort}
              onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
              required
            />
            <Input
              label="Distance (nautical miles)"
              type="number"
              step="0.01"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              required
            />
            <Select
              label="Route Type"
              value={formData.routeType}
              onChange={(e) =>
                setFormData({ ...formData, routeType: e.target.value as any })
              }
              options={[
                { value: 'INTRA_EU', label: 'Intra-EU' },
                { value: 'EXTRA_EU', label: 'Extra-EU' },
                { value: 'MIXED', label: 'Mixed' },
              ]}
            />
          </div>
          <Button type="submit" disabled={createRoute.isPending}>
            {createRoute.isPending ? 'Creating...' : 'Create Route'}
          </Button>
        </form>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Filter by origin port"
            value={filters.originPort}
            onChange={(e) => setFilters({ ...filters, originPort: e.target.value })}
            className="max-w-xs"
          />
          <Input
            placeholder="Filter by destination port"
            value={filters.destinationPort}
            onChange={(e) => setFilters({ ...filters, destinationPort: e.target.value })}
            className="max-w-xs"
          />
        </div>

        {isLoading && <div className="text-center py-8 text-gray-500">Loading...</div>}
        {error && (
          <div className="text-red-600 py-4 bg-red-50 border border-red-200 rounded-lg px-4">
            Error loading routes: {error instanceof Error ? error.message : String(error)}
          </div>
        )}
        {!isLoading && !error && (
          <Table 
            columns={columns} 
            data={routes} 
            getRowKey={(row) => row.id}
          />
        )}
      </div>
    </div>
  );
}

