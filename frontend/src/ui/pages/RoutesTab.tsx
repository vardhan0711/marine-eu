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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-gradient-primary mb-2">Routes</h2>
          <p className="text-slate-600 text-sm font-medium">Manage shipping routes and distances</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Route'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6 animate-slide-down">
          <div>
            <h3 className="text-2xl font-bold text-gradient-primary mb-2">Add New Route</h3>
            <p className="text-slate-600 text-sm">Enter route details to create a new shipping route</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
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
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createRoute.isPending}>
              {createRoute.isPending ? 'Creating...' : 'Create Route'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="card-elevated p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Route Filters</h3>
          <div className="flex gap-4">
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
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse text-slate-500 font-medium">Loading routes...</div>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl mb-4 animate-slide-down">
            <p className="text-red-700 font-semibold">
              Error loading routes: {error instanceof Error ? error.message : String(error)}
            </p>
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

