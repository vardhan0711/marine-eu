import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCompliance, useComputeCB, useComputeComparison, useCreateCompliance, useDeleteAllCompliance, useDeleteComplianceByStatus } from '@/application/hooks/useCompliance';
import { useRoutes } from '@/application/hooks/useRoutes';
import { Input } from '@/ui/components/Input';
import { Button } from '@/ui/components/Button';
import { Select } from '@/ui/components/Select';
import { ComputeCBResult, ComputeComparisonResult } from '@/adapters/api/compliance-api';

export function CompareTab() {
  const [ghgIntensity, setGhgIntensity] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [cbResult, setCbResult] = useState<ComputeCBResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComputeComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    shipId: '',
    routeId: '',
    voyageId: '',
    fuelType: 'MGO',
    fuelConsumption: '',
    energyContent: '',
    ghgIntensity: '',
    reportingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM format
  });

  const { data: compliance = [], isLoading } = useCompliance(
    filterStatus ? { status: filterStatus } : undefined
  );
  const { data: routes = [] } = useRoutes();
  const computeCB = useComputeCB();
  const computeComparison = useComputeComparison();
  const createCompliance = useCreateCompliance();
  const deleteAllCompliance = useDeleteAllCompliance();
  const deleteByStatus = useDeleteComplianceByStatus();

  const handleComputeCB = async () => {
    if (!ghgIntensity || !fuelConsumption) {
      setError('Please enter both GHG Intensity and Fuel Consumption values');
      setCbResult(null);
      setComparisonResult(null);
      return;
    }
    setError(null);
    setComparisonResult(null);
    try {
      const result = await computeCB.mutateAsync({
        actualGhgIntensity: Number(ghgIntensity),
        fuelConsumption: Number(fuelConsumption),
      });
      setCbResult(result);
    } catch (err: any) {
      console.error('Failed to compute CB:', err);
      setError(err?.message || 'Failed to compute Compliance Balance. Please check the console for details.');
      setCbResult(null);
    }
  };

  const handleComputeComparison = async () => {
    if (!ghgIntensity) {
      setError('Please enter GHG Intensity value');
      setCbResult(null);
      setComparisonResult(null);
      return;
    }
    setError(null);
    setCbResult(null);
    try {
      const result = await computeComparison.mutateAsync({
        actualGhgIntensity: Number(ghgIntensity),
      });
      setComparisonResult(result);
    } catch (err: any) {
      console.error('Failed to compute comparison:', err);
      setError(err?.message || 'Failed to compute comparison. Please check the console for details.');
      setComparisonResult(null);
    }
  };

  const handleAddCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createCompliance.mutateAsync({
        shipId: formData.shipId,
        routeId: formData.routeId,
        voyageId: formData.voyageId,
        fuelType: formData.fuelType,
        fuelConsumption: Number(formData.fuelConsumption),
        energyContent: Number(formData.energyContent),
        ghgIntensity: Number(formData.ghgIntensity),
        reportingPeriod: formData.reportingPeriod,
      });
      setShowAddForm(false);
      setFormData({
        shipId: '',
        routeId: '',
        voyageId: '',
        fuelType: 'MGO',
        fuelConsumption: '',
        energyContent: '',
        ghgIntensity: '',
        reportingPeriod: new Date().toISOString().slice(0, 7),
      });
    } catch (err: any) {
      console.error('Failed to create compliance:', err);
      setError(err?.message || 'Failed to create compliance record. Please check the console for details.');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL compliance data? This action cannot be undone.')) {
      setError(null);
      try {
        await deleteAllCompliance.mutateAsync();
        setCbResult(null);
        setComparisonResult(null);
      } catch (err: any) {
        console.error('Failed to delete all compliance:', err);
        setError(err?.message || 'Failed to delete all compliance records. Please check the console for details.');
      }
    }
  };

  // Prepare chart data
  const intensityData = compliance.map((c) => ({
    name: c.voyageId,
    actual: c.ghgIntensity,
    target: 89.3368,
  }));

  const cbData = compliance.map((c) => {
    const cb = (89.3368 - c.ghgIntensity) * c.fuelConsumption * 41000;
    return {
      name: c.voyageId,
      cb: cb,
    };
  });

  const statusDistribution = compliance.reduce((acc, c) => {
    acc[c.complianceStatus] = (acc[c.complianceStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-gradient-primary mb-2">Compare & Analyze</h2>
        <p className="text-slate-600 text-sm font-medium">Compute compliance balance and analyze GHG intensity data</p>
      </div>

      <div className="card-elevated p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Compute Compliance</h3>
          <p className="text-slate-600 text-sm">Calculate compliance balance and compare against targets</p>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Input
            label="GHG Intensity (gCO2eq/MJ)"
            type="number"
            step="0.01"
            value={ghgIntensity}
            onChange={(e) => setGhgIntensity(e.target.value)}
            placeholder="e.g., 80"
          />
          <Input
            label="Fuel Consumption (metric tons)"
            type="number"
            step="0.01"
            value={fuelConsumption}
            onChange={(e) => setFuelConsumption(e.target.value)}
            placeholder="e.g., 100"
          />
          <div className="flex items-end gap-2">
            <Button onClick={handleComputeCB} disabled={computeCB.isPending}>
              Compute CB
            </Button>
            <Button onClick={handleComputeComparison} disabled={computeComparison.isPending}>
              Compare
            </Button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {(cbResult || comparisonResult || error) && (
        <div className="card-elevated p-8 animate-slide-down">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gradient-accent mb-2">Computation Result</h3>
            <p className="text-slate-600 text-sm">Review the calculated compliance metrics</p>
          </div>
          
          {error && (
            <div className="mb-6 p-5 bg-red-50/80 border border-red-300 rounded-xl animate-slide-down">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {cbResult && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-primary-50/80 to-accent-50/50 rounded-xl border border-primary-200 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Compliance Balance:</span>
                  <span className="text-2xl font-bold text-blue-700">{cbResult.cb.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      cbResult.isSurplus
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {cbResult.isSurplus ? 'Surplus' : 'Deficit'}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Target GHG Intensity:</span>
                    <span className="ml-2 font-semibold text-gray-800">{cbResult.target.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Actual GHG Intensity:</span>
                    <span className="ml-2 font-semibold text-gray-800">{cbResult.actual.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fuel Consumption:</span>
                    <span className="ml-2 font-semibold text-gray-800">{cbResult.fuelConsumption.toFixed(2)} tons</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {comparisonResult && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-accent-50/80 to-pink-50/50 rounded-xl border border-accent-200 shadow-soft">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Actual GHG Intensity:</span>
                    <span className="ml-2 text-lg font-bold text-purple-700">{comparisonResult.actual.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Target GHG Intensity:</span>
                    <span className="ml-2 text-lg font-bold text-purple-700">{comparisonResult.target.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3 pt-3 border-t border-purple-200">
                  <span className="text-sm font-semibold text-gray-700">Difference:</span>
                  <span className={`text-xl font-bold ${comparisonResult.difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {comparisonResult.difference >= 0 ? '+' : ''}{comparisonResult.difference.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Compliance Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      comparisonResult.isCompliant
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {comparisonResult.isCompliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card-elevated p-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Compliance Data</h3>
            <p className="text-slate-600 text-sm">View and manage compliance records</p>
          </div>
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All' },
              { value: 'COMPLIANT', label: 'Compliant' },
              { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'UNDER_REVIEW', label: 'Under Review' },
            ]}
            className="max-w-xs"
          />
          <div className="flex gap-2">
            {compliance.length > 0 && (
              <Button
                onClick={handleDeleteAll}
                disabled={deleteAllCompliance.isPending}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                {deleteAllCompliance.isPending ? 'Deleting...' : '🗑️ Delete All Data'}
              </Button>
            )}
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {showAddForm ? 'Cancel' : '+ Add Compliance Data'}
            </Button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddCompliance} className="mb-6 p-8 bg-gradient-to-r from-primary-50/50 to-accent-50/30 rounded-xl border border-primary-200/50 space-y-6 animate-slide-down">
            <div>
              <h3 className="text-2xl font-bold text-gradient-primary mb-2">Add New Compliance Record</h3>
              <p className="text-slate-600 text-sm">Enter voyage compliance data for analysis</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Ship ID"
                type="text"
                value={formData.shipId}
                onChange={(e) => setFormData({ ...formData, shipId: e.target.value })}
                placeholder="e.g., SHIP-001"
                required
              />
              <Select
                label="Route"
                value={formData.routeId}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                options={[
                  { value: '', label: 'Select a route' },
                  ...routes.map((route) => ({
                    value: route.id,
                    label: `${route.originPort} → ${route.destinationPort}`,
                  })),
                ]}
                required
              />
              <Input
                label="Voyage ID"
                type="text"
                value={formData.voyageId}
                onChange={(e) => setFormData({ ...formData, voyageId: e.target.value })}
                placeholder="e.g., VOY-2024-001"
                required
              />
              <Select
                label="Fuel Type"
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                options={[
                  { value: 'MGO', label: 'MGO (Marine Gas Oil)' },
                  { value: 'MDO', label: 'MDO (Marine Diesel Oil)' },
                  { value: 'HFO', label: 'HFO (Heavy Fuel Oil)' },
                  { value: 'LNG', label: 'LNG (Liquefied Natural Gas)' },
                  { value: 'LPG', label: 'LPG (Liquefied Petroleum Gas)' },
                  { value: 'METHANOL', label: 'Methanol' },
                  { value: 'ETHANOL', label: 'Ethanol' },
                  { value: 'HYDROGEN', label: 'Hydrogen' },
                  { value: 'AMMONIA', label: 'Ammonia' },
                  { value: 'ELECTRICITY', label: 'Electricity' },
                  { value: 'BIOFUEL', label: 'Biofuel' },
                  { value: 'SYNTHETIC_FUEL', label: 'Synthetic Fuel' },
                ]}
                required
              />
              <Input
                label="Fuel Consumption (metric tons)"
                type="number"
                step="0.01"
                value={formData.fuelConsumption}
                onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
                placeholder="e.g., 100"
                required
              />
              <Input
                label="Energy Content (MJ)"
                type="number"
                step="0.01"
                value={formData.energyContent}
                onChange={(e) => setFormData({ ...formData, energyContent: e.target.value })}
                placeholder="e.g., 4100000"
                required
              />
              <Input
                label="GHG Intensity (gCO2eq/MJ)"
                type="number"
                step="0.01"
                value={formData.ghgIntensity}
                onChange={(e) => setFormData({ ...formData, ghgIntensity: e.target.value })}
                placeholder="e.g., 80"
                required
              />
              <Input
                label="Reporting Period"
                type="month"
                value={formData.reportingPeriod}
                onChange={(e) => setFormData({ ...formData, reportingPeriod: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createCompliance.isPending}>
                {createCompliance.isPending ? 'Adding...' : 'Add Compliance Data'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    shipId: '',
                    routeId: '',
                    voyageId: '',
                    fuelType: 'MGO',
                    fuelConsumption: '',
                    energyContent: '',
                    ghgIntensity: '',
                    reportingPeriod: new Date().toISOString().slice(0, 7),
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse text-slate-500 font-medium">Loading compliance data...</div>
          </div>
        )}

        {!isLoading && compliance.length > 0 && (
          <div className="space-y-8 mt-8">
            <div className="p-6 bg-gradient-to-r from-primary-50/50 to-accent-50/30 rounded-xl border border-primary-200/50 shadow-soft hover:shadow-medium transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 text-slate-800">GHG Intensity Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={intensityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target (89.34)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 bg-gradient-to-r from-accent-50/50 to-pink-50/30 rounded-xl border border-accent-200/50 shadow-soft hover:shadow-medium transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 text-slate-800">Compliance Balance by Voyage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cbData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cb" fill="#8884d8" name="Compliance Balance" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-xl border border-green-200/50 shadow-soft hover:shadow-medium transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 text-slate-800">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!isLoading && compliance.length === 0 && !showAddForm && (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <p className="text-slate-600 font-medium mb-2 text-lg">No compliance data available</p>
              <p className="text-slate-500 text-sm mb-6">Get started by adding your first compliance record</p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
            >
              + Add Your First Compliance Record
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

