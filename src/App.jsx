import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Filter, Trash2, Edit3, ExternalLink, AlertTriangle,
  CheckCircle2, Clock, Flame, BarChart3, LayoutDashboard, Download,
  Upload, Database, Link as LinkIcon, X, Calendar, Award, Wifi
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { db } from './firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch
} from 'firebase/firestore';

const MEMBERS = ['Chi', 'Mạnh', 'Hoàng Anh'];

const CATEGORIES = [
  { name: 'Thumbnail Sàn/Web', bg: '#EBD8C3', text: '#1F2937' },
  { name: 'Banner Sàn/Web', bg: '#FBC28B', text: '#1F2937' },
  { name: 'Ảnh sản phẩm', bg: '#E66400', text: '#FFFFFF' },
  { name: 'Gif Motion', bg: '#F5C2D7', text: '#1F2937' },
  { name: 'Hero Section', bg: '#D94B9A', text: '#FFFFFF' },
  { name: 'Info & Landing page', bg: '#AF1F72', text: '#FFFFFF' },
  { name: 'Artwork', bg: '#0D8AC4', text: '#FFFFFF' },
  { name: 'Back livestream', bg: '#6AE6D4', text: '#1F2937' },
  { name: 'Keyvisual', bg: '#2F9E44', text: '#FFFFFF' },
  { name: 'Social post', bg: '#C9EFC8', text: '#1F2937' },
  { name: 'Catalog/Brochure', bg: '#D9DCDE', text: '#1F2937' },
  { name: 'In ấn', bg: '#6C727A', text: '#FFFFFF' },
  { name: 'Khác', bg: '#343A40', text: '#FFFFFF' },
];

const PRIORITIES = [
  { level: 3, label: '3 - Cao (1-2 ngày)', short: 'P3 - Cao', bg: '#DC2626', text: '#FFFFFF' },
  { level: 2, label: '2 - Vừa (Tuần này)', short: 'P2 - Vừa', bg: '#F97316', text: '#FFFFFF' },
  { level: 1, label: '1 - Thấp (Tuần tới)', short: 'P1 - Thấp', bg: '#38BDF8', text: '#FFFFFF' },
  { level: 0, label: '0 - Pending', short: 'P0 - Pending', bg: '#000000', text: '#FFFFFF' },
];

const WORKLOADS = [
  { value: 1, label: 'Nhẹ (1đ)' },
  { value: 2, label: 'Trung bình (2đ)' },
  { value: 3, label: 'Nặng (3đ)' },
  { value: 5, label: 'Rất nặng (5đ)' },
];

const STATUSES = ['Chưa làm', 'Đang làm', 'Đã xong'];

const QUALITY_SCORES = [
  { value: 1, label: '1 - Chưa đạt' },
  { value: 2, label: '2 - Tuân thủ' },
  { value: 3, label: '3 - Đạt' },
  { value: 4, label: '4 - Vượt mong đợi' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

const offsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getSampleTasks = () => [
  {
    title: 'Keyvisual chiến dịch Sale 12.12',
    assignee: 'Chi',
    category: 'Keyvisual',
    priority: 3,
    workload: 5,
    assignedDate: offsetDate(-2),
    deadline: offsetDate(1),
    status: 'Đang làm',
    score: '',
    driveLink: '',
    completedDate: '',
  },
  {
    title: 'Bộ 6 Banner Sàn Shopee/Lazada',
    assignee: 'Chi',
    category: 'Banner Sàn/Web',
    priority: 2,
    workload: 3,
    assignedDate: offsetDate(-3),
    deadline: offsetDate(-1),
    status: 'Đã xong',
    score: 4,
    driveLink: 'https://drive.google.com',
    completedDate: offsetDate(-1),
  },
  {
    title: 'Hero Section trang chủ sản phẩm mới',
    assignee: 'Mạnh',
    category: 'Hero Section',
    priority: 3,
    workload: 3,
    assignedDate: offsetDate(-1),
    deadline: offsetDate(0),
    status: 'Đang làm',
    score: '',
    driveLink: '',
    completedDate: '',
  },
  {
    title: 'Ảnh sản phẩm bộ skincare (10 SKU)',
    assignee: 'Mạnh',
    category: 'Ảnh sản phẩm',
    priority: 3,
    workload: 5,
    assignedDate: offsetDate(-2),
    deadline: offsetDate(-1),
    status: 'Chưa làm',
    score: '',
    driveLink: '',
    completedDate: '',
  },
  {
    title: 'Gif Motion quảng cáo Flash Sale',
    assignee: 'Hoàng Anh',
    category: 'Gif Motion',
    priority: 2,
    workload: 3,
    assignedDate: offsetDate(-4),
    deadline: offsetDate(-2),
    status: 'Đã xong',
    score: 3,
    driveLink: 'https://drive.google.com',
    completedDate: offsetDate(-2),
  },
  {
    title: 'Back livestream phiên Mega Live tối T6',
    assignee: 'Hoàng Anh',
    category: 'Back livestream',
    priority: 3,
    workload: 2,
    assignedDate: todayStr(),
    deadline: offsetDate(1),
    status: 'Đang làm',
    score: '',
    driveLink: '',
    completedDate: '',
  },
  {
    title: 'Info & Landing page ra mắt dòng máy mới',
    assignee: 'Chi',
    category: 'Info & Landing page',
    priority: 2,
    workload: 5,
    assignedDate: offsetDate(-5),
    deadline: offsetDate(-1),
    status: 'Đã xong',
    score: 4,
    driveLink: 'https://drive.google.com',
    completedDate: offsetDate(-1),
  },
  {
    title: 'Social post minigame cuối tuần',
    assignee: 'Hoàng Anh',
    category: 'Social post',
    priority: 1,
    workload: 1,
    assignedDate: offsetDate(-1),
    deadline: offsetDate(4),
    status: 'Chưa làm',
    score: '',
    driveLink: '',
    completedDate: '',
  },
  {
    title: 'Catalog/Brochure đại lý Q1',
    assignee: 'Mạnh',
    category: 'Catalog/Brochure',
    priority: 0,
    workload: 5,
    assignedDate: offsetDate(-2),
    deadline: offsetDate(14),
    status: 'Chưa làm',
    score: '',
    driveLink: '',
    completedDate: '',
  },
  {
    title: 'Thumbnail Sàn/Web đợt hàng mới',
    assignee: 'Mạnh',
    category: 'Thumbnail Sàn/Web',
    priority: 2,
    workload: 2,
    assignedDate: offsetDate(-4),
    deadline: offsetDate(-2),
    status: 'Đã xong',
    score: 3,
    driveLink: 'https://drive.google.com',
    completedDate: offsetDate(-2),
  },
];

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: mon.toISOString().split('T')[0],
    end: sun.toISOString().split('T')[0],
  };
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [activeTab, setActiveTab] = useState('daily');

  // Filters
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    assignee: MEMBERS[0],
    category: CATEGORIES[0].name,
    priority: 2,
    workload: 2,
    assignedDate: todayStr(),
    deadline: offsetDate(2),
    status: 'Chưa làm',
    score: '',
    driveLink: '',
  });

  // Report state
  const [reportMode, setReportMode] = useState('week'); // 'week' | 'month'
  const [reportDate, setReportDate] = useState(todayStr());

  // Realtime Firestore Subscription
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tasks'),
      (snapshot) => {
        const liveTasks = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setTasks(liveTasks);
        setLoading(false);
        setSyncError('');
      },
      (error) => {
        console.error('Firestore sync error:', error);
        setSyncError('Không thể kết nối Firestore. Hãy kiểm tra lại tab Rules trong Firebase Console.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const isOverdue = (task) => {
    if (task.status === 'Đã xong' || !task.deadline) return false;
    return task.deadline < todayStr();
  };

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterMember !== 'ALL' && t.assignee !== filterMember) return false;
        if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
        if (filterPriority !== 'ALL' && Number(t.priority) !== Number(filterPriority)) return false;
        if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (Number(b.priority) !== Number(a.priority)) {
          return Number(b.priority) - Number(a.priority);
        }
        return (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31');
      });
  }, [tasks, search, filterMember, filterCategory, filterPriority, filterStatus]);

  // Realtime Dashboard Metrics
  const dashboardStats = useMemo(() => {
    const totalTasks = tasks.length;
    const totalWorkload = tasks.reduce((sum, t) => sum + Number(t.workload || 0), 0);
    const doneWorkload = tasks
      .filter((t) => t.status === 'Đã xong')
      .reduce((sum, t) => sum + Number(t.workload || 0), 0);
    const progressPct = totalWorkload > 0 ? Math.round((doneWorkload / totalWorkload) * 100) : 0;
    const urgentPending = tasks.filter((t) => Number(t.priority) === 3 && t.status !== 'Đã xong').length;
    const overdueCount = tasks.filter((t) => isOverdue(t)).length;

    const memberStats = MEMBERS.map((member) => {
      const mTasks = tasks.filter((t) => t.assignee === member);
      const done = mTasks.filter((t) => t.status === 'Đã xong');
      const notDone = mTasks.filter((t) => t.status !== 'Đã xong');
      const donePts = done.reduce((s, t) => s + Number(t.workload || 0), 0);
      // Exclude priority 0 (Pending) from active overload calculation
      const activeRemainingPts = notDone
        .filter((t) => Number(t.priority) > 0)
        .reduce((s, t) => s + Number(t.workload || 0), 0);
      const urgentCount = notDone.filter((t) => Number(t.priority) === 3).length;
      return {
        name: member,
        doneCount: done.length,
        notDoneCount: notDone.length,
        donePts,
        activeRemainingPts,
        urgentCount,
        isOverloaded: activeRemainingPts > 8,
      };
    });

    return { totalTasks, totalWorkload, doneWorkload, progressPct, urgentPending, overdueCount, memberStats };
  }, [tasks]);

  // Report Metrics (Weekly / Monthly)
  const reportData = useMemo(() => {
    let startStr = '';
    let endStr = '';
    if (reportMode === 'week') {
      const range = getWeekRange(reportDate);
      startStr = range.start;
      endStr = range.end;
    } else {
      const ym = reportDate.slice(0, 7);
      startStr = `${ym}-01`;
      endStr = `${ym}-31`;
    }

    const completedInRange = tasks.filter((t) => {
      if (t.status !== 'Đã xong') return false;
      const refDate = t.completedDate || t.deadline || t.assignedDate;
      return refDate >= startStr && refDate <= endStr;
    });

    const memberChart = MEMBERS.map((member) => {
      const mDone = completedInRange.filter((t) => t.assignee === member);
      const totalScore = mDone.reduce((s, t) => s + Number(t.score || 0), 0);
      const scoredTasks = mDone.filter((t) => Number(t.score) > 0);
      const avgScore = scoredTasks.length > 0 ? (totalScore / scoredTasks.length).toFixed(2) : '—';
      const workloadDone = mDone.reduce((s, t) => s + Number(t.workload || 0), 0);
      const onTimeCount = mDone.filter((t) => {
        if (!t.deadline) return true;
        const doneDate = t.completedDate || t.deadline;
        return doneDate <= t.deadline;
      }).length;
      const onTimePct = mDone.length > 0 ? Math.round((onTimeCount / mDone.length) * 100) : 0;

      return {
        name: member,
        completedTasks: mDone.length,
        totalScore,
        avgScore,
        workloadDone,
        onTimePct,
      };
    });

    const categoryChart = CATEGORIES.map((cat) => {
      const count = completedInRange.filter((t) => t.category === cat.name).length;
      return { name: cat.name, count, color: cat.bg };
    }).filter((c) => c.count > 0);

    return { startStr, endStr, completedInRange, memberChart, categoryChart };
  }, [tasks, reportMode, reportDate]);

  // CRUD Handlers
  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      assignee: MEMBERS[0],
      category: CATEGORIES[0].name,
      priority: 2,
      workload: 2,
      assignedDate: todayStr(),
      deadline: offsetDate(2),
      status: 'Chưa làm',
      score: '',
      driveLink: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      assignee: task.assignee || MEMBERS[0],
      category: task.category || CATEGORIES[0].name,
      priority: Number(task.priority ?? 2),
      workload: Number(task.workload ?? 2),
      assignedDate: task.assignedDate || todayStr(),
      deadline: task.deadline || todayStr(),
      status: task.status || 'Chưa làm',
      score: task.score || '',
      driveLink: task.driveLink || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const payload = {
      ...formData,
      priority: Number(formData.priority),
      workload: Number(formData.workload),
      score: formData.score === '' ? '' : Number(formData.score),
      completedDate: formData.status === 'Đã xong' ? (editingTask?.completedDate || todayStr()) : '',
    };

    try {
      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), payload);
      } else {
        await addDoc(collection(db, 'tasks'), payload);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      alert('Lỗi lưu dữ liệu lên Firebase: ' + err.message);
    }
  };

  const handleQuickUpdate = async (taskId, updates) => {
    try {
      if (updates.status === 'Đã xong') {
        updates.completedDate = todayStr();
      } else if (updates.status && updates.status !== 'Đã xong') {
        updates.completedDate = '';
      }
      await updateDoc(doc(db, 'tasks', taskId), updates);
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc muốn xóa task này?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      alert('Lỗi xóa task: ' + err.message);
    }
  };

  const handleSeedSamples = async () => {
    if (!window.confirm('Nạp 10 task mẫu vào Firebase Firestore?')) return;
    try {
      const batch = writeBatch(db);
      getSampleTasks().forEach((item) => {
        const ref = doc(collection(db, 'tasks'));
        batch.set(ref, item);
      });
      await batch.commit();
    } catch (err) {
      alert('Lỗi nạp dữ liệu mẫu: ' + err.message);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-daily-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('File JSON không hợp lệ');
        const batch = writeBatch(db);
        parsed.forEach((item) => {
          const { id, ...rest } = item;
          const ref = doc(collection(db, 'tasks'));
          batch.set(ref, rest);
        });
        await batch.commit();
        alert(`Đã nhập thành công ${parsed.length} task lên Firebase!`);
      } catch (err) {
        alert('Lỗi nhập JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getCategoryStyle = (catName) => {
    const found = CATEGORIES.find((c) => c.name === catName) || CATEGORIES[CATEGORIES.length - 1];
    return { backgroundColor: found.bg, color: found.text };
  };

  const getPriorityObj = (level) => {
    return PRIORITIES.find((p) => p.level === Number(level)) || PRIORITIES[3];
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#171717] font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base tracking-tight">Design Daily</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Wifi className="w-3 h-3" /> Realtime
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Team: Chi · Mạnh · Hoàng Anh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'daily'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Quản trị Daily
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'report'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Báo cáo & Biểu đồ
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              title="Export JSON"
              className="p-2 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title="Import JSON"
              className="p-2 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-black hover:bg-neutral-800 text-white text-xs font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Task</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {syncError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {activeTab === 'daily' ? (
          <>
            {/* Overview KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Tổng số Task</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold">{dashboardStats.totalTasks}</span>
                  <span className="text-xs text-neutral-500">
                    {dashboardStats.doneWorkload}/{dashboardStats.totalWorkload}đ độ nặng
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Tiến độ theo độ nặng</div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-2xl font-bold">{dashboardStats.progressPct}%</span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-300"
                      style={{ width: `${dashboardStats.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-600" /> Task khẩn cấp (P3) tồn
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-red-600">
                    {dashboardStats.urgentPending}
                  </span>
                  <span className="text-xs text-neutral-500">Cần xử lý 1-2 ngày</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Task trễ Deadline
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-amber-600">
                    {dashboardStats.overdueCount}
                  </span>
                  <span className="text-xs text-neutral-500">Chưa hoàn thành</span>
                </div>
              </div>
            </div>

            {/* Member Realtime Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardStats.memberStats.map((m) => (
                <div
                  key={m.name}
                  className={`bg-white p-4 rounded-xl border transition ${
                    m.isOverloaded ? 'border-red-300 ring-1 ring-red-100' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold">
                        {m.name.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{m.name}</h3>
                        <p className="text-[11px] text-neutral-500">
                          Xong {m.doneCount} · Còn {m.notDoneCount} task
                        </p>
                      </div>
                    </div>
                    {m.isOverloaded ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-600 text-white">
                        Quá tải (&gt;8đ)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ổn định
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 text-center">
                    <div>
                      <div className="text-[11px] text-neutral-500">Đã xong</div>
                      <div className="text-sm font-semibold text-emerald-600">{m.donePts}đ</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-500">Tồn (P1-P3)</div>
                      <div
                        className={`text-sm font-semibold ${
                          m.isOverloaded ? 'text-red-600' : 'text-neutral-900'
                        }`}
                      >
                        {m.activeRemainingPts}đ
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-500">Task P3</div>
                      <div className="text-sm font-semibold text-red-600">{m.urgentCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-xl border border-neutral-200 flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên task..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-black"
                />
              </div>

              <select
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white"
              >
                <option value="ALL">Tất cả thành viên</option>
                {MEMBERS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white"
              >
                <option value="ALL">Tất cả 13 phân loại</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white"
              >
                <option value="ALL">Tất cả ưu tiên</option>
                {PRIORITIES.map((p) => (
                  <option key={p.level} value={p.level}>{p.label}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {tasks.length === 0 && !loading && (
                <button
                  onClick={handleSeedSamples}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-700"
                >
                  <Database className="w-3.5 h-3.5" /> Nạp 10 task mẫu
                </button>
              )}
            </div>

            {/* Task Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500">
                      <th className="py-3 px-4 font-semibold">Ưu tiên</th>
                      <th className="py-3 px-4 font-semibold min-w-[220px]">Tên Task</th>
                      <th className="py-3 px-4 font-semibold">Phụ trách</th>
                      <th className="py-3 px-4 font-semibold">Phân loại</th>
                      <th className="py-3 px-4 font-semibold text-center">Độ nặng</th>
                      <th className="py-3 px-4 font-semibold">Deadline</th>
                      <th className="py-3 px-4 font-semibold">Trạng thái</th>
                      <th className="py-3 px-4 font-semibold">Điểm (1-4)</th>
                      <th className="py-3 px-4 font-semibold text-center">File Drive</th>
                      <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-neutral-400">
                          Đang đồng bộ dữ liệu realtime từ Firebase...
                        </td>
                      </tr>
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-neutral-400">
                          Chưa có task nào phù hợp bộ lọc. Bấm <strong>Thêm Task</strong> hoặc{' '}
                          <strong>Nạp 10 task mẫu</strong> để bắt đầu.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const pObj = getPriorityObj(task.priority);
                        const overdue = isOverdue(task);
                        return (
                          <tr key={task.id} className="hover:bg-neutral-50/80 transition">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={task.priority}
                                onChange={(e) =>
                                  handleQuickUpdate(task.id, { priority: Number(e.target.value) })
                                }
                                style={{ backgroundColor: pObj.bg, color: pObj.text }}
                                className="px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer focus:outline-none"
                              >
                                {PRIORITIES.map((p) => (
                                  <option
                                    key={p.level}
                                    value={p.level}
                                    className="bg-white text-black"
                                  >
                                    {p.short}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-4 font-medium text-neutral-900">
                              <div className={task.status === 'Đã xong' ? 'line-through text-neutral-400' : ''}>
                                {task.title}
                              </div>
                              <div className="text-[10px] text-neutral-400 mt-0.5">
                                Giao: {task.assignedDate || '—'}
                              </div>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap font-medium">
                              {task.assignee}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                style={getCategoryStyle(task.category)}
                                className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium"
                              >
                                {task.category}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-center whitespace-nowrap font-semibold">
                              {task.workload}đ
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className={overdue ? 'text-red-600 font-semibold' : 'text-neutral-700'}>
                                {task.deadline || '—'}
                              </div>
                              {overdue && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">
                                  Trễ hạn
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleQuickUpdate(task.id, { status: e.target.value })
                                }
                                className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                                  task.status === 'Đã xong'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : task.status === 'Đang làm'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                }`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={task.score ?? ''}
                                onChange={(e) =>
                                  handleQuickUpdate(task.id, {
                                    score: e.target.value === '' ? '' : Number(e.target.value),
                                  })
                                }
                                className="px-2 py-1 rounded-md text-[11px] border border-neutral-200 bg-white cursor-pointer"
                              >
                                <option value="">— Chấm —</option>
                                {QUALITY_SCORES.map((q) => (
                                  <option key={q.value} value={q.value}>
                                    {q.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              {task.driveLink ? (
                                <a
                                  href={task.driveLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium"
                                >
                                  <ExternalLink className="w-3 h-3" /> Drive
                                </a>
                              ) : (
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-black"
                                >
                                  <LinkIcon className="w-3 h-3" /> Gắn link
                                </button>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600"
                                  title="Chỉnh sửa"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1.5 rounded hover:bg-red-50 text-red-600"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* REPORTS & CHARTS TAB */
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReportMode('week')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                    reportMode === 'week'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  Theo Tuần
                </button>
                <button
                  onClick={() => setReportMode('month')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                    reportMode === 'month'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  Theo Tháng
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">
                  Khoảng: <strong>{reportData.startStr}</strong> → <strong>{reportData.endStr}</strong>
                </span>
                <input
                  type={reportMode === 'month' ? 'month' : 'date'}
                  value={reportMode === 'month' ? reportDate.slice(0, 7) : reportDate}
                  onChange={(e) =>
                    setReportDate(reportMode === 'month' ? `${e.target.value}-01` : e.target.value)
                  }
                  className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-neutral-200">
                <h3 className="text-sm font-semibold mb-4">
                  So sánh Task hoàn thành & Tổng điểm quy đổi (1-4)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.memberChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="completedTasks" name="Task hoàn thành" fill="#171717" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalScore" name="Tổng điểm quy đổi" fill="#0D8AC4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200">
                <h3 className="text-sm font-semibold mb-4">
                  Phân bổ Task hoàn thành theo Phân loại
                </h3>
                <div className="h-72">
                  {reportData.categoryChart.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                      Chưa có task hoàn thành trong khoảng thời gian này.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.categoryChart} layout="vertical" margin={{ left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Số task" radius={[0, 4, 4, 0]}>
                          {reportData.categoryChart.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* KPI Summary Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
                <Award className="w-4 h-4" />
                <h3 className="text-sm font-semibold">Bảng tổng hợp KPI thành viên</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px]">
                      <th className="py-3 px-5">Thành viên</th>
                      <th className="py-3 px-5 text-center">Task hoàn thành</th>
                      <th className="py-3 px-5 text-center">Độ nặng đã xử lý</th>
                      <th className="py-3 px-5 text-center">Tổng điểm quy đổi</th>
                      <th className="py-3 px-5 text-center">Điểm TB (/4.0)</th>
                      <th className="py-3 px-5 text-center">Đúng Deadline (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {reportData.memberChart.map((row) => (
                      <tr key={row.name} className="hover:bg-neutral-50">
                        <td className="py-3.5 px-5 font-semibold">{row.name}</td>
                        <td className="py-3.5 px-5 text-center font-medium">{row.completedTasks}</td>
                        <td className="py-3.5 px-5 text-center">{row.workloadDone}đ</td>
                        <td className="py-3.5 px-5 text-center font-semibold text-blue-600">
                          {row.totalScore}
                        </td>
                        <td className="py-3.5 px-5 text-center font-semibold">{row.avgScore}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                            {row.onTimePct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-neutral-200 w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                {editingTask ? 'Chỉnh sửa Task' : 'Thêm Task mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Tên Task *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Keyvisual chiến dịch Sale..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Người phụ trách</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-white"
                  >
                    {MEMBERS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Phân loại (13 loại)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Mức độ ưu tiên (0-3)</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.level} value={p.level}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Độ nặng</label>
                  <select
                    value={formData.workload}
                    onChange={(e) => setFormData({ ...formData, workload: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-white"
                  >
                    {WORKLOADS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Ngày giao</label>
                  <input
                    type="date"
                    value={formData.assignedDate}
                    onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Điểm chất lượng (1-4)</label>
                  <select
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-white"
                  >
                    <option value="">— Chưa chấm —</option>
                    {QUALITY_SCORES.map((q) => (
                      <option key={q.value} value={q.value}>{q.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Link file thiết kế (Google Drive)</label>
                <input
                  type="url"
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-neutral-200 hover:bg-neutral-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-black text-white hover:bg-neutral-800 font-medium"
                >
                  {editingTask ? 'Lưu thay đổi' : 'Tạo Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
