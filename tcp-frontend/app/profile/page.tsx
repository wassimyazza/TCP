"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSave,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, setAuth, token } = useAuthStore();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setUsername(user?.username || "");
  }, [isAuthenticated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: any = {};
    if (username && username !== user?.username) body.username = username;
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword) {
        toast.error("Please enter your old password");
        return;
      }
      if (!newPassword) {
        toast.error("Please enter a new password");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      body.oldPassword = oldPassword;
      body.newPassword = newPassword;
    }
    if (Object.keys(body).length === 0) {
      toast.error("No changes to save");
      return;
    }
    setLoading(true);
    try {
      const res = await api.put("/users/me", body);
      const updatedUser = {
        id: user!.id,
        username: res.data.username,
        email: res.data.email,
        role: res.data.role,
      };
      setAuth(updatedUser, token!);
      toast.success("Profile updated!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="bg-sky-500 px-6 py-12">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1
                className="font-bold text-3xl text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {user?.username}
              </h1>
              <p className="text-sky-100 text-sm">{user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2
                className="text-gray-900 font-bold text-base"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Account Info
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-500 font-medium">
                  Username
                </label>
                <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-sky-400 focus-within:bg-white transition-all">
                  <FaUser className="text-gray-300 text-sm shrink-0" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength={3}
                    maxLength={20}
                    className="bg-transparent text-gray-900 text-sm outline-none w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-500 font-medium">
                  Email
                </label>
                <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 opacity-50">
                  <FaEnvelope className="text-gray-300 text-sm shrink-0" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-transparent text-gray-500 text-sm outline-none w-full cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-300">Email cannot be changed</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t-2 border-gray-50">
              <h2
                className="text-gray-900 font-bold text-base"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Change Password
              </h2>
              <p className="text-gray-400 text-xs">
                Leave empty if you don't want to change your password
              </p>

              {[
                {
                  label: "Current Password",
                  value: oldPassword,
                  setValue: setOldPassword,
                  show: showOld,
                  setShow: setShowOld,
                  placeholder: "Enter current password",
                },
                {
                  label: "New Password",
                  value: newPassword,
                  setValue: setNewPassword,
                  show: showNew,
                  setShow: setShowNew,
                  placeholder: "Enter new password",
                },
                {
                  label: "Confirm New Password",
                  value: confirmPassword,
                  setValue: setConfirmPassword,
                  show: showConfirm,
                  setShow: setShowConfirm,
                  placeholder: "Repeat new password",
                },
              ].map((field, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <label className="text-sm text-gray-500 font-medium">
                    {field.label}
                  </label>
                  <div
                    className={`flex items-center gap-3 bg-gray-50 border-2 rounded-2xl px-4 py-3 focus-within:border-sky-400 focus-within:bg-white transition-all ${
                      i === 2 && field.value && field.value !== newPassword
                        ? "border-red-200"
                        : "border-gray-100"
                    }`}
                  >
                    <FaLock className="text-gray-300 text-sm shrink-0" />
                    <input
                      type={field.show ? "text" : "password"}
                      value={field.value}
                      onChange={(e) => field.setValue(e.target.value)}
                      placeholder={field.placeholder}
                      className="bg-transparent text-gray-900 text-sm outline-none w-full placeholder-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => field.setShow(!field.show)}
                      className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none"
                    >
                      {field.show ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  </div>
                  {i === 2 && field.value && field.value !== newPassword && (
                    <p className="text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
                  {i === 2 &&
                    field.value &&
                    field.value === newPassword &&
                    newPassword && (
                      <p className="text-xs text-green-600">
                        Passwords match ✓
                      </p>
                    )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-3 font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-sky-200"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <FaSave />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
