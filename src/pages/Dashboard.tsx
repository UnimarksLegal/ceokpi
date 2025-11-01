import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { DepartmentCard } from "@/components/DepartmentCard";
import { DeptWeightRow } from "@/components/DeptWeightRow";
import { DEFAULT_WEIGHTS, METRICS_MAP, INVERSE_KEYS, seedDepartmentScores } from "@/data/departments";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Briefcase, LogOut, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "unimarks-kra-kpi-v1";
const API_BASE = import.meta.env.VITE_API_URL;

const fmt = (n: number) => `${Math.round(n)}%`;
const clamp01 = (n: number) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [data, setData] = useState(seedDepartmentScores);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

 // 🔹 Load department summary from Flask API
useEffect(() => {
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/departments/summary`);
      if (!res.ok) throw new Error("Failed to fetch department summary");

      const json = await res.json();
      setWeights(json.weights || {});
      setData(json.data || {});
    } catch (err) {
      console.error("Error loading summary:", err);
      // fallback to localStorage if backend is down
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.weights && parsed?.data) {
            setWeights(parsed.weights);
            setData(parsed.data);
          }
        }
      } catch {}
    }
  };

  fetchSummary();
}, []);


  // 🔹 Persist state to localStorage (optional backup)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ weights, data }));
    } catch (err) {
      console.warn("Failed to save local state:", err);
    }
  }, [weights, data]);


  // 🔹 Average per department
  const departmentAverages = useMemo(() => {
  const out: Record<string, number> = {};

  for (const [dept, deptObj] of Object.entries(data)) {
    // If backend gives average directly (like {"average": 98})
    if (typeof deptObj === "object" && "average" in deptObj) {
      out[dept] = deptObj.average;
    } 
    // fallback (if structure is just metrics)
    else if (deptObj && typeof deptObj === "object") {
      const vals = Object.values(deptObj).map((v) => clamp01(Number(v)));
      out[dept] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
  }

  return out;
}, [data]);



// 🔹 Total weight across departments
const totalWeight = useMemo(() => {
  return Object.values(weights).reduce((a, b) => a + Number(b || 0), 0);
}, [weights]);

// 🔹 CEO KPI Index (weighted avg)
const ceoIndex = useMemo(() => {
  if (!totalWeight) return 0;

  return Object.entries(departmentAverages).reduce((sum, [dept, avg]) => {
    const w = Number(weights[dept as keyof typeof weights] || 0);
    return sum + (w / totalWeight) * avg;
  }, 0);
}, [departmentAverages, weights, totalWeight]);


  const radarData = useMemo(
    () =>
      Object.keys(METRICS_MAP).map((dept) => ({
        department: dept,
        score: Math.round(departmentAverages[dept] || 0),
      })),
    [departmentAverages]
  );

  const barData = useMemo(
    () =>
      Object.entries(departmentAverages).map(([dept, avg]) => ({
        department: dept,
        Average: Math.round(avg),
      })),
    [departmentAverages]
  );

const handleDownloadCSV = () => {
  try {
    const rows: string[] = [];
    rows.push("Department,Metric,Value");

    // Flatten nested metrics properly
    for (const [dept, details] of Object.entries(data)) {
      const deptData = details as { average?: number; metrics?: Record<string, number> };

      // Department average
      if (deptData.average !== undefined) {
        rows.push(`${dept},Average,${deptData.average}`);
      }

      // Department metrics
      if (deptData.metrics) {
        for (const [metric, value] of Object.entries(deptData.metrics)) {
          rows.push(`${dept},"${metric}",${value}`);
        }
      }
    }

    // Optional: append department weights
    rows.push("\nDepartment,Weight");
    for (const [dept, weight] of Object.entries(weights)) {
      rows.push(`${dept},${weight}`);
    }

    // Convert to CSV and download
    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "department_summary.csv";
    a.click();

    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Department summary downloaded as CSV",
    });
  } catch (err) {
    console.error("Error exporting CSV:", err);
    toast({
      title: "Export failed",
      description: "Could not generate CSV file",
      variant: "destructive",
    });
  }
};
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Briefcase className="w-8 h-8" />
                Unimarks KRA/KPI Dashboard
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Performance across departments → aggregated into CEO Index
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Welcome, {user?.username}</span>
              <Button
                onClick={handleDownloadCSV}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Download CSV
              </Button>
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* CEO Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="col-span-1 lg:col-span-1"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  CEO KRA/KPI Index
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-5xl font-bold text-primary">{fmt(ceoIndex)}</div>
                <CardDescription>
                  Weighted aggregate of department scores. Edits in this won't affect radar or Team Data.
                </CardDescription>
                {Object.keys(METRICS_MAP).map((dept) => (
                  <DeptWeightRow
                    key={dept}
                    dept={dept}
                    weight={weights[dept as keyof typeof weights]}
                    onChange={(v) => setWeights((w) => ({ ...w, [dept]: clamp01(v) }))}
                  />
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total Weight</span>
                  <span className="font-bold text-lg">{totalWeight}%</span>
                </div>
                {totalWeight !== 100 && (
                  <p className="text-xs text-muted-foreground">
                    Total Weight : 600%
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="col-span-1 lg:col-span-2"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Department Scores (Radar)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.45} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(METRICS_MAP).map((dept) => (
            <DepartmentCard
              key={dept}
              name={dept}
              score={departmentAverages[dept] || 0}
            />
          ))}
        </div>

        {/* Bar Chart */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Department Average Scores (Bar)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => fmt(v as number)} />
                  <Bar dataKey="Average" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              <b>UNIMARKS CEO KPI/KRA</b>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;