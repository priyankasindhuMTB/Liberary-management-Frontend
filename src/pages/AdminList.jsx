import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Loader2,
  AlertCircle,
  Edit2,
  X,
  UserPlus,
  User,
  Mail,
  Lock,
  Library,
  Calendar,
  Plus,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  MoreVertical,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("accessEndDate");
  const [sortOrder, setSortOrder] = useState("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const initialFormState = {
    name: "",
    email: "",
    password: "",
    libraryName: "",
    accessStartDate: todayStr,
    accessEndDate: "",
  };
  const [form, setForm] = useState(initialFormState);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        status: statusFilter,
        sortField,
        sortOrder,
      });

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await axios.get(
        `${API_URL}/api/admin/all?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (Array.isArray(res.data)) {
        setAdmins(res.data);
        setTotalAdmins(res.data.length);
        setTotalPages(1);
      } else {
        setAdmins(res.data.admins || []);
        setTotalAdmins(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
        setPage(res.data.page || 1);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to load admins directory";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const adminData = JSON.parse(localStorage.getItem("admin"));
      if (adminData?.role === "super_admin") setIsSuperAdmin(true);
    } catch (err) {
      console.error(err);
    }

    if (!token) {
      setError("No token found. Please login again.");
      toast.error("Authentication token missing!");
      return;
    }

    fetchAdmins();
  }, [API_URL, token]);

  useEffect(() => {
    if (!token) return;
    fetchAdmins();
  }, [page, limit, statusFilter, sortField, sortOrder]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedAdminId(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (adm) => {
    setModalMode("edit");
    setSelectedAdminId(adm._id);

    const startDate = adm.accessStartDate
      ? new Date(adm.accessStartDate).toISOString().split("T")[0]
      : todayStr;
    const endDate = adm.accessEndDate
      ? new Date(adm.accessEndDate).toISOString().split("T")[0]
      : "";

    setForm({
      name: adm.name || "",
      email: adm.email || "",
      password: "",
      libraryName: adm.libraryId?.name || "Library Branch",
      accessStartDate: startDate,
      accessEndDate: endDate,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (
      form.accessEndDate &&
      new Date(form.accessStartDate) >= new Date(form.accessEndDate)
    ) {
      toast.error("Access End Date must be after the Start Date.");
      return;
    }

    const toastLoadingId = toast.loading(
      modalMode === "create"
        ? "Provisioning new account..."
        : "Updating admin profile..."
    );

    try {
      setModalLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

       // ✅ Save form values BEFORE any async operation
    const currentName = form.name;
    const currentLibrary = form.libraryName;

      if (modalMode === "create") {
        console.log("📤 Sending form data:", form); // ← Add this
        const res = await axios.post(
          `${API_URL}/api/admin/create-direct`,
          form,
          { headers }
        );
        // ✅ Save name BEFORE resetting form
       
        setForm(initialFormState);
        // Success
  toast.success(
    `${registeredName} has been successfully registered under "${registeredLibrary}".`,
    { id: toastLoadingId }
  )
      } else {
        const res = await axios.put(
          `${API_URL}/api/admin/update-direct/${selectedAdminId}`,
          {
            name: form.name,
            email: form.email,
            libraryName: form.libraryName,
            accessStartDate: form.accessStartDate,
            accessEndDate: form.accessEndDate,
          },
          { headers }
        );
      toast.success(
        res.data.message ||
        `${currentName}'s profile has been updated successfully.`,
        { id: toastLoadingId }
      );
    }

      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      console.log("❌ Error during modal submission:", err.response?.data || err);
      const fallbackErr = err.response?.data?.message || "Operation failed.";
      toast.error(fallbackErr, { id: toastLoadingId });
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const statusToastId = toast.loading(`Updating status to ${nextStatus}...`);

    try {
      await axios.put(
        `${API_URL}/api/admin/toggle-status/${id}`,
        { status: nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAdmins((prev) =>
        prev.map((adm) =>
          adm._id === id ? { ...adm, status: nextStatus } : adm
        )
      );
      toast.success(`Account status is now ${nextStatus}!`, {
        id: statusToastId,
      });
    } catch (err) {
      const apiErr = err.response?.data?.message || "Status update failed";
      toast.error(apiErr, { id: statusToastId });
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    fetchAdmins();
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "Not Set";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const checkIsExpired = (endDateString) => {
    if (!endDateString) return false;
    const expiryDate = new Date(endDateString);
    const today = new Date();
    return expiryDate < today;
  };

  const getDaysRemaining = (endDateString) => {
    if (!endDateString) return null;
    const expiry = new Date(endDateString);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      "from-indigo-500 to-purple-500",
      "from-pink-500 to-rose-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-violet-500 to-fuchsia-500",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  // Stats calculations
  const activeCount = admins.filter(
    (a) => a.status !== "Inactive" && !checkIsExpired(a.accessEndDate)
  ).length;
  const expiredCount = admins.filter((a) => checkIsExpired(a.accessEndDate)).length;
  const inactiveCount = admins.filter((a) => a.status === "Inactive").length;

  if (loading && admins.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Loader2 className="animate-spin relative text-indigo-600" size={44} />
        </div>
        <p className="font-semibold text-sm mt-4">Loading Administration Grid...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-indigo-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-xl">
                  <Users size={24} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Library Admins
                  </h1>
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                    {totalAdmins} Total
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Manage operational scopes, timeline allocations, and profiles.
                </p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className={`group flex items-center justify-center gap-2 text-sm font-bold text-white px-5 py-3 rounded-2xl transition-all active:scale-[0.98] shadow-lg hover:shadow-xl w-full lg:w-auto ${isSuperAdmin
                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30"
                }`}
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              Add New Admin
              <Sparkles size={14} className="opacity-70" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="Total Admins"
            value={totalAdmins}
            icon={<Users size={18} />}
            gradient="from-indigo-500 to-purple-600"
            bgLight="bg-indigo-50"
            textColor="text-indigo-600"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={<CheckCircle2 size={18} />}
            gradient="from-emerald-500 to-teal-600"
            bgLight="bg-emerald-50"
            textColor="text-emerald-600"
          />
          <StatCard
            label="Expired"
            value={expiredCount}
            icon={<ShieldAlert size={18} />}
            gradient="from-red-500 to-rose-600"
            bgLight="bg-red-50"
            textColor="text-red-600"
          />
          <StatCard
            label="Inactive"
            value={inactiveCount}
            icon={<XCircle size={18} />}
            gradient="from-slate-400 to-slate-600"
            bgLight="bg-slate-100"
            textColor="text-slate-600"
          />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                {["All", "Active", "Inactive"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${statusFilter === s
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {[10, 20, 30, 50].map((v) => (
                  <option key={v} value={v}>
                    {v} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <div className="p-4 bg-red-50 rounded-xl text-red-700 flex items-center gap-3 text-sm font-semibold">
              <AlertCircle size={18} /> {error}
            </div>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-16 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Users size={32} className="text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-bold mb-1">No admins found</h3>
            <p className="text-sm text-slate-500">
              Try adjusting your filters or add a new administrator.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        Administrator
                      </th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        Library Node
                      </th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        Access Timeline
                      </th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {admins.map((adm) => {
                      const expired = checkIsExpired(adm.accessEndDate);
                      const isActive = adm.status !== "Inactive";
                      const daysLeft = getDaysRemaining(adm.accessEndDate);

                      return (
                        <tr
                          key={adm._id}
                          className={`transition-all group ${expired
                            ? "bg-red-50/30 hover:bg-red-50/60"
                            : "hover:bg-indigo-50/30"
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(
                                  adm.name
                                )} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                              >
                                {getInitials(adm.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">
                                  {adm.name}
                                </div>
                                <div className="text-xs text-slate-500 font-medium truncate">
                                  {adm.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs">
                              <Library size={12} />
                              {adm.libraryId?.name ||
                                adm.libraryName ||
                                "Library Branch"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                <span className="text-slate-400 text-[10px] font-bold uppercase">
                                  Start:
                                </span>
                                <span className="text-slate-600 font-medium">
                                  {formatDateLabel(adm.accessStartDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${expired ? "bg-red-500" : "bg-emerald-400"
                                    }`}
                                ></div>
                                <span
                                  className={`text-[10px] font-bold uppercase ${expired ? "text-red-400" : "text-slate-400"
                                    }`}
                                >
                                  Expiry:
                                </span>
                                <span
                                  className={`font-medium ${expired
                                    ? "text-red-600 font-bold"
                                    : "text-slate-600"
                                    }`}
                                >
                                  {formatDateLabel(adm.accessEndDate)}
                                </span>
                                {!expired && daysLeft !== null && daysLeft <= 30 && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded uppercase">
                                    {daysLeft}d left
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {expired ? (
                              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide border border-red-200 shadow-sm">
                                <ShieldAlert size={12} /> Expired
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(
                                    adm._id,
                                    adm.status || "Active"
                                  )
                                }
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide border transition-all active:scale-95 hover:shadow-md ${isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                  }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${isActive
                                    ? "bg-emerald-500 animate-pulse"
                                    : "bg-slate-400"
                                    }`}
                                ></span>
                                {adm.status || "Active"}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openEditModal(adm)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all text-xs font-semibold"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {admins.map((adm) => {
                const expired = checkIsExpired(adm.accessEndDate);
                const isActive = adm.status !== "Inactive";
                const daysLeft = getDaysRemaining(adm.accessEndDate);

                return (
                  <div
                    key={adm._id}
                    className={`bg-white rounded-2xl shadow-sm border p-4 transition-all ${expired
                      ? "border-red-200 bg-red-50/30"
                      : "border-slate-200/70 hover:border-indigo-200 hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(
                          adm.name
                        )} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                      >
                        {getInitials(adm.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 truncate">
                              {adm.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">
                              {adm.email}
                            </p>
                          </div>
                          <button
                            onClick={() => openEditModal(adm)}
                            className="flex-shrink-0 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-[11px]">
                        <Library size={11} />
                        {adm.libraryId?.name ||
                          adm.libraryName ||
                          "Library Branch"}
                      </div>
                      {expired ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-black border border-red-200">
                          <ShieldAlert size={10} /> Expired
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleStatus(adm._id, adm.status || "Active")
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                          ></span>
                          {adm.status || "Active"}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5">
                          Start
                        </p>
                        <p className="text-xs font-semibold text-slate-700">
                          {formatDateLabel(adm.accessStartDate)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[9px] font-black uppercase tracking-wide mb-0.5 ${expired ? "text-red-400" : "text-slate-400"
                            }`}
                        >
                          Expiry
                        </p>
                        <p
                          className={`text-xs font-semibold ${expired ? "text-red-600" : "text-slate-700"
                            }`}
                        >
                          {formatDateLabel(adm.accessEndDate)}
                          {!expired &&
                            daysLeft !== null &&
                            daysLeft <= 30 && (
                              <span className="ml-1 text-amber-600">
                                ({daysLeft}d)
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200/70 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Showing <strong className="text-slate-900">{admins.length}</strong>{" "}
                  of <strong className="text-slate-900">{totalAdmins}</strong> admins
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <div className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-bold">
                    {page} <span className="text-indigo-400">/</span> {totalPages}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scaleIn max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div
              className={`relative p-6 text-white overflow-hidden ${isSuperAdmin
                ? "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600"
                : "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"
                }`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-lg">
                      {modalMode === "create"
                        ? "Add New Administrator"
                        : "Modify Admin Account"}
                    </h2>
                    <p className="text-xs text-white/80 mt-0.5">
                      {modalMode === "create"
                        ? "Create a new admin profile"
                        : "Update admin information"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              {/* Personal Info Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Personal Info
                  </span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="space-y-3">
                  <FormInput
                    label="Full Name"
                    name="name"
                    icon={<User size={16} />}
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={<Mail size={16} />}
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="admin@domain.com"
                    required
                  />
                  {modalMode === "create" && (
                    <FormInput
                      label="Account Password"
                      name="password"
                      type="password"
                      icon={<Lock size={16} />}
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  )}
                </div>
              </div>

              {/* Library Access Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Library & Access
                  </span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="space-y-3">
                  <FormInput
                    label="Library Node Name"
                    name="libraryName"
                    icon={<Library size={16} />}
                    value={form.libraryName}
                    onChange={handleInputChange}
                    placeholder="e.g. Core Public Hub"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="Start Date"
                      name="accessStartDate"
                      type="date"
                      icon={<Calendar size={16} />}
                      value={form.accessStartDate}
                      onChange={handleInputChange}
                      min={modalMode === "create" ? todayStr : ""}
                      required
                    />
                    <FormInput
                      label="End Date"
                      name="accessEndDate"
                      type="date"
                      icon={<Calendar size={16} />}
                      value={form.accessEndDate}
                      onChange={handleInputChange}
                      min={form.accessStartDate || todayStr}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={modalLoading}
                  type="submit"
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isSuperAdmin
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30"
                    }`}
                >
                  {modalLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : modalMode === "create" ? (
                    <>
                      <Sparkles size={16} /> Provision Account
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ label, value, icon, gradient, bgLight, textColor }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-4 hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 ${bgLight} ${textColor} rounded-xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <TrendingUp size={14} className="text-slate-300" />
    </div>
    <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">
      {value}
    </div>
    <div className="text-xs font-semibold text-slate-500">{label}</div>
  </div>
);

// Reusable Form Input Component
const FormInput = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl text-sm outline-none transition-all text-slate-800 placeholder:text-slate-400"
      />
    </div>
  </div>
);

export default AdminList;