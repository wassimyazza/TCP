'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaTrophy, FaTrash, FaEdit, FaTimes, FaCheck, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Championship {
  _id: string;
  name: string;
  description: string;
  status: string;
}

export default function AdminChampionshipsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchChampionships();
  }, [isAuthenticated, user]);

  async function fetchChampionships() {
    try {
      const res = await api.get('/championships');
      setChampionships(res.data);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!form.name.trim()) return toast.error('Name is required');
    setFormLoading(true);
    try {
      await api.post('/championships', form);
      toast.success('Championship created');
      setForm({ name: '', description: '' });
      fetchChampionships();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setFormLoading(false);
    }
  }

  async function saveEdit(id: string) {
    setEditLoading(true);
    try {
      await api.put(`/championships/${id}`, editForm);
      toast.success('Saved');
      setEditingId(null);
      fetchChampionships();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setEditLoading(false);
    }
  }

  async function toggleStatus(champ: Championship) {
    try {
      await api.put(`/championships/${champ._id}`, {
        status: champ.status === 'active' ? 'finished' : 'active',
      });
      fetchChampionships();
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function deleteChampionship(id: string) {
    if (!confirm('Delete this championship?')) return;
    try {
      await api.delete(`/championships/${id}`);
      toast.success('Deleted');
      fetchChampionships();
    } catch {
      toast.error('Failed to delete');
    }
  }

  function openEdit(champ: Championship) {
    setEditingId(champ._id);
    setEditForm({ name: champ.name, description: champ.description });
  }

  const active = championships.filter((c) => c.status === 'active');
  const finished = championships.filter((c) => c.status === 'finished');

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="w-7 h-7 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">

      <div className="bg-white border-b border-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-2">Admin Panel</p>
            <h1
              className="font-bold text-gray-900"
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', lineHeight: 1.1 }}
            >
              Championships
            </h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="font-bold text-2xl text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{active.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Active</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="font-bold text-2xl text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{finished.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Finished</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="font-bold text-2xl text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{championships.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm sticky top-24">
              <div className="bg-sky-500 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaTrophy className="text-white text-sm" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                      New Championship
                    </h2>
                    <p className="text-sky-100 text-xs mt-0.5">Fill in the details below</p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Name <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && create()}
                    placeholder="e.g. Spring Speed Cup"
                    className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Description
                    <span className="text-gray-400 normal-case tracking-normal font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Shown to players on the championship page"
                    rows={3}
                    className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  onClick={create}
                  disabled={formLoading || !form.name.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 font-bold text-sm transition-colors cursor-pointer border-none disabled:cursor-not-allowed shadow-md shadow-sky-100"
                >
                  <FaCheck className="text-xs" />
                  {formLoading ? 'Creating...' : 'Create Championship'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">

            {championships.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-14 h-14 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-5">
                  <FaTrophy className="text-gray-300 text-xl" />
                </div>
                <p className="text-gray-700 font-bold text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  No championships yet
                </p>
                <p className="text-gray-400 text-sm">
                  Use the form on the left to create your first competition.
                </p>
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active</p>
                    </div>
                    {active.map((champ) => (
                      <ChampCard
                        key={champ._id}
                        champ={champ}
                        editingId={editingId}
                        editForm={editForm}
                        editLoading={editLoading}
                        setEditForm={setEditForm}
                        onEdit={openEdit}
                        onCancelEdit={() => setEditingId(null)}
                        onSave={saveEdit}
                        onToggle={toggleStatus}
                        onDelete={deleteChampionship}
                      />
                    ))}
                  </div>
                )}

                {finished.length > 0 && (
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Finished</p>
                    </div>
                    {finished.map((champ) => (
                      <ChampCard
                        key={champ._id}
                        champ={champ}
                        editingId={editingId}
                        editForm={editForm}
                        editLoading={editLoading}
                        setEditForm={setEditForm}
                        onEdit={openEdit}
                        onCancelEdit={() => setEditingId(null)}
                        onSave={saveEdit}
                        onToggle={toggleStatus}
                        onDelete={deleteChampionship}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChampCard({
  champ, editingId, editForm, editLoading, setEditForm,
  onEdit, onCancelEdit, onSave, onToggle, onDelete,
}: {
  champ: Championship;
  editingId: string | null;
  editForm: { name: string; description: string };
  editLoading: boolean;
  setEditForm: (f: { name: string; description: string }) => void;
  onEdit: (c: Championship) => void;
  onCancelEdit: () => void;
  onSave: (id: string) => void;
  onToggle: (c: Championship) => void;
  onDelete: (id: string) => void;
}) {
  const isEditing = editingId === champ._id;
  const isActive = champ.status === 'active';

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-sky-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 bg-sky-50 border-b border-sky-100">
          <p className="text-sky-700 font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
            Editing — {champ.name}
          </p>
          <button
            onClick={onCancelEdit}
            className="w-7 h-7 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <FaTimes style={{ fontSize: '10px' }} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all"
            placeholder="Championship name"
          />
          <input
            type="text"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all"
            placeholder="Description (optional)"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(champ._id)}
              disabled={editLoading}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2 font-bold text-sm transition-colors cursor-pointer border-none disabled:opacity-50"
            >
              <FaCheck style={{ fontSize: '10px' }} />
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onCancelEdit}
              className="text-gray-400 hover:text-gray-700 text-sm font-medium cursor-pointer bg-transparent border-none transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-2xl transition-all hover:shadow-sm ${isActive ? 'border-gray-100' : 'border-gray-100 opacity-75'}`}>
      <div className="flex items-start gap-4 p-5">

        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? 'bg-sky-50 border border-sky-100' : 'bg-gray-100 border border-gray-200'}`}>
          <FaTrophy className={isActive ? 'text-sky-500' : 'text-gray-400'} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              {champ.name}
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              isActive
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}>
              {isActive ? 'Active' : 'Finished'}
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            {champ.description || <span className="italic text-gray-300">No description</span>}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(champ)}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-all"
            title="Edit"
          >
            <FaEdit style={{ fontSize: '11px' }} />
          </button>
          <button
            onClick={() => onToggle(champ)}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
              isActive
                ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-600'
                : 'bg-slate-50 hover:bg-gray-100 border-gray-200 text-gray-400'
            }`}
            title={isActive ? 'Mark as finished' : 'Reactivate'}
          >
            {isActive ? <FaToggleOn style={{ fontSize: '13px' }} /> : <FaToggleOff style={{ fontSize: '13px' }} />}
          </button>
          <button
            onClick={() => onDelete(champ._id)}
            className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer transition-all"
            title="Delete"
          >
            <FaTrash style={{ fontSize: '10px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}