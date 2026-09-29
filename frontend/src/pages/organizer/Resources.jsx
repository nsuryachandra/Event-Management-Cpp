import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Badge';
import { Spinner } from '../../components/Spinner';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import {
  Layers,
  Plus,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  RefreshCw,
  Cpu,
  Tv,
  Zap,
  Tag,
  Boxes
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Badging & Supplies',
  'Audio/Visual',
  'Computing',
  'Hardware',
  'Furniture',
  'General'
];

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Badging & Supplies':
      return <Tag size={15} style={{ color: '#4f46e5' }} />;
    case 'Audio/Visual':
      return <Tv size={15} style={{ color: '#0284c7' }} />;
    case 'Computing':
      return <Cpu size={15} style={{ color: '#7c3aed' }} />;
    case 'Hardware':
      return <Zap size={15} style={{ color: '#d97706' }} />;
    case 'Furniture':
      return <Layers size={15} style={{ color: '#059669' }} />;
    default:
      return <Package size={15} style={{ color: '#64748b' }} />;
  }
};

export const Resources = () => {
  const { events, activeEventId, activeEvent } = useOutletContext();
  const { showToast } = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Badging & Supplies',
    total: 50,
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.getResources(!activeEventId || activeEventId === 'all' || activeEventId === 0 ? null : activeEventId);
      if (res && res.success && Array.isArray(res.data)) {
        setResources(res.data);
      } else if (Array.isArray(res)) {
        setResources(res);
      } else {
        setResources([]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load resources', 'error');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [activeEventId]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Badging & Supplies',
      total: 50,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setSelectedResource(res);
    setFormData({
      name: res.name,
      category: res.category || 'General',
      total: res.total,
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Resource name is required', 'error');
      return;
    }
    const tot = parseInt(formData.total, 10);
    if (isNaN(tot) || tot < 1) {
      showToast('Total quantity must be at least 1', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      const targetEventId = (!activeEventId || activeEventId === 'all' || activeEventId === 0) 
        ? (events[0]?.id || 1) 
        : activeEventId;

      const res = await api.createResource({
        eventId: targetEventId,
        name: formData.name.trim(),
        category: formData.category,
        total: tot,
      });

      if (res.success) {
        showToast(`Resource '${formData.name}' created with ${tot} units.`, 'success');
        setIsAddModalOpen(false);
        fetchResources();
      } else {
        showToast(res.message || 'Failed to add resource', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add resource', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Resource name is required', 'error');
      return;
    }
    const tot = parseInt(formData.total, 10);
    if (isNaN(tot) || tot < (selectedResource?.allocated || 0)) {
      showToast(`Total quantity cannot be lower than allocated units (${selectedResource?.allocated || 0}).`, 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await api.updateResource(selectedResource.id, {
        name: formData.name.trim(),
        category: formData.category,
        total: tot,
      });

      if (res.success) {
        showToast(`Updated '${formData.name}'.`, 'success');
        setIsEditModalOpen(false);
        fetchResources();
      } else {
        showToast(res.message || 'Failed to update resource', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update resource', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleQuickRestock = async (resItem, delta) => {
    setActionLoadingId(resItem.id);
    const newTotal = resItem.total + delta;
    try {
      const res = await api.updateResource(resItem.id, {
        name: resItem.name,
        category: resItem.category || 'General',
        total: newTotal,
      });
      if (res.success) {
        showToast(`Added +${delta} units to ${resItem.name}. New total: ${newTotal}.`, 'success');
        fetchResources();
      } else {
        showToast(res.message || 'Failed to restock resource', 'error');
      }
    } catch (err) {
      showToast('Error updating stock', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.deleteResource(deleteTarget.id);
      if (res.success) {
        showToast(`Deleted ${deleteTarget.name}.`, 'success');
        setDeleteTarget(null);
        fetchResources();
      } else {
        showToast(res.message || 'Failed to delete resource', 'error');
      }
    } catch (err) {
      showToast('Failed to delete resource', 'error');
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesQuery = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const totalPoolUnits = resources.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalAllocated = resources.reduce((acc, r) => acc + (r.allocated || 0), 0);
  const totalAvailable = resources.reduce((acc, r) => acc + (r.available || 0), 0);
  const utilizationPct = totalPoolUnits > 0 ? Math.round((totalAllocated / totalPoolUnits) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap', 
          gap: 16,
          padding: '24px 28px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            >
              {activeEvent ? activeEvent.title : 'All Events'}
            </span>
          </div>

          <h1 
            style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: '#0f172a', 
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              margin: '0 0 6px 0',
            }}
          >
            Resources & Kit Inventory
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Manage badges, equipment assets, and delegate kits with real-time stock allocation and quick restocking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={fetchResources}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Add Resource
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard
          title="Total Stock Units"
          value={totalPoolUnits}
          subtitle="All equipment in catalog"
          icon={<Package size={18} />}
          color="primary"
          trend="Inventory"
        />
        <StatCard
          title="Allocated Units"
          value={totalAllocated}
          subtitle={`Distributed across confirmed guests`}
          icon={<CheckCircle2 size={18} />}
          color="emerald"
          trend={`${utilizationPct}% Assigned`}
        />
        <StatCard
          title="Available Reserve"
          value={totalAvailable}
          subtitle="Ready for walk-ins / queue"
          icon={<Boxes size={18} />}
          color={totalAvailable < 15 ? 'warning' : 'secondary'}
          trend={totalAvailable < 15 ? 'Low Buffer' : 'Healthy'}
        />
        <StatCard
          title="Active Resource Pools"
          value={resources.length}
          subtitle="Categories & kit bundles"
          icon={<Layers size={18} />}
          color="secondary"
          trend="Active"
        />
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 18px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: selectedCategory === cat ? 600 : 500,
                backgroundColor: selectedCategory === cat ? '#eef2ff' : '#ffffff',
                color: selectedCategory === cat ? '#4f46e5' : '#475569',
                border: selectedCategory === cat ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resource name..."
            style={{
              paddingLeft: '32px',
              paddingTop: '6px',
              paddingBottom: '6px',
              fontSize: '0.8125rem',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div 
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <Spinner size={32} label="Loading resources..." />
          </div>
        ) : filteredResources.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', marginBottom: 4 }}>
              No resources found
            </div>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {searchQuery ? 'No items match your search.' : 'Click "Add Resource" to create an inventory item.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px' }}>Resource Item</th>
                  <th style={{ padding: '12px 18px' }}>Category</th>
                  <th style={{ padding: '12px 18px' }}>Allocation Status</th>
                  <th style={{ padding: '12px 18px' }}>Available Units</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Quick Restock & Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((res) => {
                  const util = res.total > 0 ? Math.round((res.allocated / res.total) * 100) : 0;
                  const isLow = res.available <= 5;
                  const isBusy = actionLoadingId === res.id;

                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '8px',
                              backgroundColor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getCategoryIcon(res.category)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{res.name}</div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#64748b' }}>
                              RES-#{res.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#475569', fontSize: '0.8125rem' }}>
                        {res.category || 'General'}
                      </td>

                      <td style={{ padding: '14px 18px', width: '240px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                          <span style={{ color: '#64748b' }}>
                            {res.allocated} / {res.total} allocated
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: util >= 90 ? '#e11d48' : '#4f46e5' }}>
                            {util}%
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(util, 100)}%`,
                              height: '100%',
                              backgroundColor: util >= 90 ? '#e11d48' : util >= 75 ? '#f59e0b' : '#10b981',
                              borderRadius: '999px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: isLow ? '#fef2f2' : '#ecfdf5',
                            color: isLow ? '#991b1b' : '#065f46',
                            border: isLow ? '1px solid #fecaca' : '1px solid #a7f3d0',
                          }}
                        >
                          {res.available} Available
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => handleQuickRestock(res, 5)}
                            disabled={isBusy}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Add +5 units to stock pool"
                          >
                            +5 Units
                          </button>
                          <button
                            onClick={() => handleQuickRestock(res, 10)}
                            disabled={isBusy}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Add +10 units to stock pool"
                          >
                            +10 Units
                          </button>
                          <button
                            onClick={() => handleOpenEdit(res)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                            title="Edit Resource"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(res)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 7px', fontSize: '0.75rem', color: '#dc2626' }}
                            title="Delete Resource"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Resource Item"
          subtitle="Configure equipment, kit bundles, or badge assets."
        >
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Resource Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. VIP NFC Delegate Badge Pack"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Initial Stock Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="btn btn-primary"
              >
                {formSubmitting ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Resource Modal */}
      {isEditModalOpen && selectedResource && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit: ${selectedResource.name}`}
          subtitle={`Currently allocated: ${selectedResource.allocated} units.`}
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Resource Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Total Pool Units (Min: {selectedResource.allocated}) *
                </label>
                <input
                  type="number"
                  min={selectedResource.allocated}
                  max="10000"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="btn btn-primary"
              >
                {formSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          title="Delete Resource"
          subtitle={`Are you sure you want to delete '${deleteTarget.name}'?`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
              Deleting this resource will remove the stock pool from this event. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteResource}
                className="btn btn-danger"
              >
                Delete Resource
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Resources;
