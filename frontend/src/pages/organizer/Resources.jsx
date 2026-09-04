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
  Filter,
  Package,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Cpu,
  Tv,
  Wifi,
  Zap,
  Tag,
  ShieldCheck,
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

export const Resources = () => {
  const { events, activeEventId } = useOutletContext();
  const { showToast } = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
        showToast(`Resource '${formData.name}' created with pool of ${tot} units.`, 'success');
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
    if (isNaN(tot) || tot < selectedResource.allocated) {
      showToast(`Total quantity cannot be less than currently allocated units (${selectedResource.allocated})`, 'error');
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
        showToast(res.message || 'Resource updated successfully', 'success');
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

  const handleDeleteSubmit = async () => {
    if (!selectedResource) return;
    if (selectedResource.allocated > 0) {
      showToast(`Cannot delete resource while ${selectedResource.allocated} units are allocated to attendees.`, 'error');
      return;
    }

    try {
      const res = await api.deleteResource(selectedResource.id);
      if (res.success) {
        showToast('Resource deleted successfully', 'success');
        setIsDeleteOpen(false);
        fetchResources();
      } else {
        showToast(res.message || 'Failed to delete resource', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete resource', 'error');
    }
  };

  const handleQuickAllocate = async (resource, delta) => {
    try {
      setActionLoadingId(resource.id);
      const res = delta > 0 
        ? await api.allocateResource(resource.id, delta) 
        : await api.releaseResource(resource.id, Math.abs(delta));

      if (res.success) {
        showToast(res.message || (delta > 0 ? `Allocated unit` : `Released unit`), 'success');
        fetchResources();
      } else {
        showToast(res.message || 'Operation could not be completed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update allocation', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered list
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.category && res.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Aggregates
  const totalItems = resources.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalAllocated = resources.reduce((acc, r) => acc + (r.allocated || 0), 0);
  const totalAvailable = totalItems - totalAllocated;
  const utilizationRate = totalItems > 0 ? Math.round((totalAllocated / totalItems) * 100) : 0;

  const currentActiveEventObj = events.find(e => e.id === activeEventId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Boxes size={15} /> Auto-Synced Resource Pool
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
            Resource Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {currentActiveEventObj ? `Managing equipment & badge pools for ${currentActiveEventObj.title}` : 'All event assets, badges, and hardware pools across the platform'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
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
            <Plus size={16} /> Add Resource
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <StatCard
          title="Total Resource Units"
          value={totalItems}
          subtitle={`${resources.length} distinct resource pools`}
          icon={<Package size={20} />}
          color="primary"
        />
        <StatCard
          title="Allocated to Attendees"
          value={totalAllocated}
          subtitle={`${utilizationRate}% of total inventory allocated`}
          icon={<Layers size={20} />}
          color="warning"
        />
        <StatCard
          title="Available in Stock"
          value={totalAvailable}
          subtitle="Ready for incoming registrants"
          icon={<CheckCircle2 size={20} />}
          color="success"
        />
        <StatCard
          title="Auto-Sync Health"
          value={`${utilizationRate}%`}
          subtitle={utilizationRate >= 90 ? 'Near Capacity Buffer' : 'Optimal Inventory Buffer'}
          icon={<ShieldCheck size={20} />}
          color="secondary"
        />
      </div>

      {/* Search and Category Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)' }} />
            <input
              type="text"
              placeholder="Search resource name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, fontSize: '0.86rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '5px 12px', whiteSpace: 'nowrap' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Grid / Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spinner size={32} label="Loading resource inventory..." />
          </div>
        ) : filteredResources.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
            <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: 4 }}>
              No Resources Found
            </h3>
            <p style={{ fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 18px' }}>
              {searchQuery || selectedCategory !== 'All' 
                ? 'No items matched your current filter criteria.' 
                : 'No resources have been registered for this event yet.'}
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <Plus size={15} /> Add First Resource
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-main)', color: 'var(--ink-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>Resource Pool</th>
                  <th style={{ padding: '14px 20px' }}>Category</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Total Units</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Allocated</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Available</th>
                  <th style={{ padding: '14px 20px' }}>Utilization</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Quick Adjust</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((res) => {
                  const available = (res.total || 0) - (res.allocated || 0);
                  const pct = res.total > 0 ? Math.round((res.allocated / res.total) * 100) : 0;
                  const isExhausted = available <= 0;
                  const isBusy = actionLoadingId === res.id;

                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--ink-primary)', fontSize: '0.92rem' }}>
                          {res.name}
                        </div>
                        <span className="mono-font" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                          Resource #{res.id} • Event #{res.eventId}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span
                          className="mono-font"
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(79, 70, 229, 0.08)',
                            color: '#4f46e5',
                            border: '1px solid rgba(79, 70, 229, 0.2)',
                          }}
                        >
                          {res.category || 'General'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 800, color: 'var(--ink-primary)' }}>
                        {res.total}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span
                          className="mono-font"
                          style={{
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {res.allocated}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span
                          className="mono-font"
                          style={{
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: isExhausted ? '#fef2f2' : '#ecfdf5',
                            color: isExhausted ? '#dc2626' : '#059669',
                            border: `1px solid ${isExhausted ? '#fecaca' : '#a7f3d0'}`,
                          }}
                        >
                          {available}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', minWidth: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--ink-muted)' }}>{pct}% in use</span>
                        </div>
                        <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-main)' }}>
                          <div
                            style={{
                              height: '100%',
                              borderRadius: 'var(--radius-full)',
                              background: pct >= 90 ? 'var(--grad-ruby)' : pct >= 70 ? 'var(--grad-sunset)' : 'var(--grad-emerald)',
                              width: `${Math.min(100, pct)}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleQuickAllocate(res, 1)}
                            disabled={isBusy || available <= 0}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', fontWeight: 700, color: '#059669' }}
                            title="Allocate +1 Unit to Attendee"
                          >
                            +1 Allocate
                          </button>
                          <button
                            onClick={() => handleQuickAllocate(res, -1)}
                            disabled={isBusy || res.allocated <= 0}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', fontWeight: 700, color: '#dc2626' }}
                            title="Release -1 Unit back to Pool"
                          >
                            -1 Release
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleOpenEdit(res)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px' }}
                            title="Edit Resource"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedResource(res);
                              setIsDeleteOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px', color: '#dc2626' }}
                            title="Delete Resource"
                          >
                            <Trash2 size={13} />
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
          title="Add New Resource Pool"
          subtitle="Register badges, gear, or attendee supplies for this event."
        >
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Resource / Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. VIP Conference Badges & Kits, Microphones, Laptops"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Badging & Supplies">Badging & Supplies</option>
                  <option value="Audio/Visual">Audio/Visual</option>
                  <option value="Computing">Computing</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Furniture">Furniture</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Total Pool Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
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
                {formSubmitting ? 'Creating...' : 'Create Resource'}
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
          title={`Edit '${selectedResource.name}'`}
          subtitle="Adjust resource details and total pool quantity."
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Resource Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Badging & Supplies">Badging & Supplies</option>
                  <option value="Audio/Visual">Audio/Visual</option>
                  <option value="Computing">Computing</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Furniture">Furniture</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Total Pool Quantity *
                </label>
                <input
                  type="number"
                  min={selectedResource.allocated || 1}
                  max="10000"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              Currently allocated to attendees: <strong style={{ color: '#2563eb' }}>{selectedResource.allocated}</strong> units.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
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

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedResource && (
        <Modal
          isOpen={true}
          onClose={() => setIsDeleteOpen(false)}
          title="Delete Resource Pool"
          subtitle="Are you sure you want to permanently remove this resource?"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', margin: 0 }}>
              Deleting <strong>{selectedResource.name}</strong> will remove it from the event resource inventory.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
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
