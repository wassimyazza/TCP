"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheck,
  FaPlay,
  FaClock,
  FaChevronDown,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";

interface Championship {
  _id: string;
  name: string;
}
interface Group {
  _id: string;
  name: string;
  championship: any;
  scheduledAt: string;
  maxPlayers: number;
  players: any[];
  status: string;
  text: string;
}

export default function AdminGroupsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [championships, setChampionships] = useState<Championship[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    championship: "",
    scheduledAt: "",
    text: "",
    maxPlayers: 10,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    scheduledAt: "",
    text: "",
    maxPlayers: 10,
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [isAuthenticated, user]);

  async function fetchData() {
    try {
      const [champsRes, groupsRes] = await Promise.all([
        api.get("/championships"),
        api.get("/groups"),
      ]);
      setChampionships(champsRes.data);
      setGroups(groupsRes.data);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function createGroup() {
    if (!form.name || !form.championship || !form.scheduledAt || !form.text)
      return toast.error("All fields are required");
    setFormLoading(true);
    try {
      await api.post("/groups", form);
      toast.success("Group created");
      setForm({
        name: "",
        championship: "",
        scheduledAt: "",
        text: "",
        maxPlayers: 10,
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally {
      setFormLoading(false);
    }
  }

  async function saveEdit(id: string) {
    setEditLoading(true);
    try {
      await api.put(`/groups/${id}`, editForm);
      toast.success("Saved");
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setEditLoading(false);
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm("Delete this group?")) return;
    try {
      await api.delete(`/groups/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  }

  function openEdit(group: Group) {
    setEditingId(group._id);
    setEditForm({
      name: group.name,
      scheduledAt: group.scheduledAt.slice(0, 16),
      text: group.text,
      maxPlayers: group.maxPlayers,
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const waiting = groups.filter((g) => g.status === "waiting");
  const inProgress = groups.filter((g) => g.status === "in_progress");
  const finished = groups.filter((g) => g.status === "finished");

  const fieldClass =
    "bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all w-full";
  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wide";

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
            <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-2">
              Admin Panel
            </p>
            <h1
              className="font-bold text-gray-900"
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "2.2rem",
                lineHeight: 1.1,
              }}
            >
              Race Groups
            </h1>
          </div>
          <div className="flex items-center gap-8">
            {[
              {
                label: "Waiting",
                value: waiting.length,
                color: "text-amber-500",
              },
              {
                label: "Live",
                value: inProgress.length,
                color: "text-blue-500",
              },
              {
                label: "Finished",
                value: finished.length,
                color: "text-gray-400",
              },
              { label: "Total", value: groups.length, color: "text-gray-900" },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-8">
                <div className="text-center">
                  <p
                    className={`font-bold text-2xl ${s.color}`}
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 sticky top-24">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-sky-500 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-white text-sm" />
                  </div>
                  <div>
                    <h2
                      className="font-bold text-white text-base"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      New Group
                    </h2>
                    <p className="text-sky-100 text-xs mt-0.5">
                      Create a race group below
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    Group Name{" "}
                    <span className="text-red-400 normal-case tracking-normal font-normal">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Group A"
                    className={fieldClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    Championship{" "}
                    <span className="text-red-400 normal-case tracking-normal font-normal">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.championship}
                      onChange={(e) =>
                        setForm({ ...form, championship: e.target.value })
                      }
                      className={
                        fieldClass + " appearance-none cursor-pointer pr-10"
                      }
                    >
                      <option value="">Select championship</option>
                      {championships.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    Scheduled Date & Time{" "}
                    <span className="text-red-400 normal-case tracking-normal font-normal">
                      *
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) =>
                      setForm({ ...form, scheduledAt: e.target.value })
                    }
                    className={fieldClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    Race Text{" "}
                    <span className="text-red-400 normal-case tracking-normal font-normal">
                      *
                    </span>
                  </label>
                  <textarea
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    placeholder="The text players will type..."
                    rows={3}
                    className={fieldClass + " resize-none"}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Max Players</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={2}
                      max={50}
                      value={form.maxPlayers}
                      onChange={(e) =>
                        setForm({ ...form, maxPlayers: Number(e.target.value) })
                      }
                      className="flex-1 accent-sky-500"
                    />
                    <span className="w-10 text-center font-bold text-gray-900 text-sm bg-slate-50 border border-gray-200 rounded-lg py-1.5">
                      {form.maxPlayers}
                    </span>
                  </div>
                </div>

                <button
                  onClick={createGroup}
                  disabled={
                    formLoading ||
                    !form.name ||
                    !form.championship ||
                    !form.scheduledAt ||
                    !form.text
                  }
                  className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 font-bold text-sm transition-colors cursor-pointer border-none disabled:cursor-not-allowed shadow-md shadow-sky-100"
                >
                  <FaCheck className="text-xs" />
                  {formLoading ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            {groups.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-14 h-14 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-5">
                  <FaUsers className="text-gray-300 text-xl" />
                </div>
                <p
                  className="text-gray-700 font-bold text-lg mb-1"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  No groups yet
                </p>
                <p className="text-gray-400 text-sm">
                  Use the form on the left to create your first race group.
                </p>
              </div>
            ) : (
              <>
                {inProgress.length > 0 && (
                  <GroupSection
                    title="Live Now"
                    dot="bg-blue-500 animate-pulse"
                    titleColor="text-blue-600"
                    groups={inProgress}
                    editingId={editingId}
                    editForm={editForm}
                    editLoading={editLoading}
                    setEditForm={setEditForm}
                    onEdit={openEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onSave={saveEdit}
                    onDelete={deleteGroup}
                    onManage={(id) => router.push(`/race/${id}`)}
                    formatDate={formatDate}
                  />
                )}

                {waiting.length > 0 && (
                  <GroupSection
                    title="Waiting"
                    dot="bg-amber-400"
                    titleColor="text-amber-600"
                    groups={waiting}
                    editingId={editingId}
                    editForm={editForm}
                    editLoading={editLoading}
                    setEditForm={setEditForm}
                    onEdit={openEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onSave={saveEdit}
                    onDelete={deleteGroup}
                    onManage={(id) => router.push(`/race/${id}`)}
                    formatDate={formatDate}
                  />
                )}

                {finished.length > 0 && (
                  <GroupSection
                    title="Finished"
                    dot="bg-gray-300"
                    titleColor="text-gray-400"
                    groups={finished}
                    editingId={editingId}
                    editForm={editForm}
                    editLoading={editLoading}
                    setEditForm={setEditForm}
                    onEdit={openEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onSave={saveEdit}
                    onDelete={deleteGroup}
                    onManage={(id) => router.push(`/race/${id}`)}
                    formatDate={formatDate}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupSection({
  title,
  dot,
  titleColor,
  groups,
  editingId,
  editForm,
  editLoading,
  setEditForm,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onManage,
  formatDate,
}: {
  title: string;
  dot: string;
  titleColor: string;
  groups: Group[];
  editingId: string | null;
  editForm: any;
  editLoading: boolean;
  setEditForm: (f: any) => void;
  onEdit: (g: Group) => void;
  onCancelEdit: () => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onManage: (id: string) => void;
  formatDate: (d: string) => string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <p
          className={`text-xs font-bold uppercase tracking-wide ${titleColor}`}
        >
          {title}
        </p>
        <span className="text-gray-300 text-xs font-medium">
          ({groups.length})
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <GroupCard
            key={group._id}
            group={group}
            editingId={editingId}
            editForm={editForm}
            editLoading={editLoading}
            setEditForm={setEditForm}
            onEdit={onEdit}
            onCancelEdit={onCancelEdit}
            onSave={onSave}
            onDelete={onDelete}
            onManage={onManage}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  editingId,
  editForm,
  editLoading,
  setEditForm,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onManage,
  formatDate,
}: {
  group: Group;
  editingId: string | null;
  editForm: any;
  editLoading: boolean;
  setEditForm: (f: any) => void;
  onEdit: (g: Group) => void;
  onCancelEdit: () => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onManage: (id: string) => void;
  formatDate: (d: string) => string;
}) {
  const isEditing = editingId === group._id;
  const isWaiting = group.status === "waiting";
  const isLive = group.status === "in_progress";
  const capacity = Math.round((group.players.length / group.maxPlayers) * 100);

  const fieldClass =
    "bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all w-full";

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-sky-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 bg-sky-50 border-b border-sky-100">
          <p
            className="text-sky-700 font-bold text-sm"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Editing — {group.name}
          </p>
          <button
            onClick={onCancelEdit}
            className="w-7 h-7 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <FaTimes style={{ fontSize: "10px" }} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Group Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={editForm.scheduledAt}
              onChange={(e) =>
                setEditForm({ ...editForm, scheduledAt: e.target.value })
              }
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Max Players
            </label>
            <input
              type="number"
              value={editForm.maxPlayers}
              onChange={(e) =>
                setEditForm({ ...editForm, maxPlayers: Number(e.target.value) })
              }
              min={2}
              max={50}
              className={fieldClass}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Race Text
            </label>
            <textarea
              value={editForm.text}
              onChange={(e) =>
                setEditForm({ ...editForm, text: e.target.value })
              }
              rows={2}
              className={fieldClass + " resize-none"}
            />
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <button
              onClick={() => onSave(group._id)}
              disabled={editLoading}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2 font-bold text-sm transition-colors cursor-pointer border-none disabled:opacity-50"
            >
              <FaCheck style={{ fontSize: "10px" }} />
              {editLoading ? "Saving..." : "Save Changes"}
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
    <div
      className={`bg-white border rounded-2xl overflow-hidden hover:shadow-sm transition-all ${isLive ? "border-blue-200" : isWaiting ? "border-gray-100" : "border-gray-100 opacity-70"}`}
    >
      <div
        className={`px-5 py-2.5 flex items-center justify-between border-b ${isLive ? "bg-blue-50 border-blue-100" : isWaiting ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-blue-500 animate-pulse" : isWaiting ? "bg-amber-400" : "bg-gray-300"}`}
          />
          <span
            className={`text-xs font-bold ${isLive ? "text-blue-600" : isWaiting ? "text-amber-600" : "text-gray-400"}`}
          >
            {isLive ? "Racing Now" : isWaiting ? "Waiting" : "Finished"}
          </span>
        </div>
        <span className="text-gray-400 text-xs flex items-center gap-1.5">
          <FaClock style={{ fontSize: "10px" }} />
          {formatDate(group.scheduledAt)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3
              className="font-bold text-gray-900 text-base mb-0.5"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {group.name}
            </h3>
            <p className="text-gray-400 text-xs">
              {group.championship?.name || "—"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {group.status !== "finished" && (
              <button
                onClick={() => onManage(group._id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border-none cursor-pointer transition-colors ${isLive ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-sky-500 hover:bg-sky-600 text-white"}`}
              >
                <FaPlay style={{ fontSize: "9px" }} />
                {isLive ? "Monitor" : "Start"}
              </button>
            )}
            <button
              onClick={() => onEdit(group)}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-all"
              title="Edit"
            >
              <FaEdit style={{ fontSize: "11px" }} />
            </button>
            <button
              onClick={() => onDelete(group._id)}
              className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer transition-all"
              title="Delete"
            >
              <FaTrash style={{ fontSize: "10px" }} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-400 text-xs">
                {group.players.length} / {group.maxPlayers} players
              </span>
              <span className="text-gray-400 text-xs">{capacity}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${capacity >= 90 ? "bg-red-400" : capacity >= 60 ? "bg-amber-400" : "bg-sky-400"}`}
                style={{ width: `${capacity}%` }}
              />
            </div>
          </div>
        </div>

        {group.players.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {group.players.slice(0, 6).map((p: any) => (
              <span
                key={p._id || p}
                className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium"
              >
                {p.username || p}
              </span>
            ))}
            {group.players.length > 6 && (
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                +{group.players.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
