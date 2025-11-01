import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { MetricSlider } from "@/components/MetricSlider";
import { MiniBar } from "@/components/MiniBar";
import { METRICS_MAP, INVERSE_KEYS, seedDepartmentScores } from "@/data/departments";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast"

const STORAGE_KEY = "unimarks-kra-kpi-v1";
const clamp01 = (n: number) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
const API_BASE = import.meta.env.VITE_API_URL;

const DepartmentDetail = () => {
  const { departmentName } = useParams<{ departmentName: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(seedDepartmentScores);
  const { toast } = useToast();
  const decodedDeptName = decodeURIComponent(departmentName || "");

  // ✅ Load department data from Flask API on mount
useEffect(() => {
  const fetchDepartment = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/departments/${decodedDeptName}`);

      if (!res.ok) throw new Error("Failed to fetch department data");

      const deptData = await res.json();

      // 🔹 Wrap it in the expected structure: { [deptName]: { metrics... } }
      setData((prev) => ({
        ...prev,
        [decodedDeptName]: deptData,
      }));
    } catch (err) {
      console.error("Error loading department data:", err);
      toast({
        title: "Error loading department data",
        description: "Falling back to cached data (if any)",
        variant: "destructive",
      });

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.data) setData(parsed.data);
        }
      } catch {}
    }
  };

  fetchDepartment();
}, [decodedDeptName]);


  // Persist state
  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem(STORAGE_KEY);
  //     if (raw) {
  //       const parsed = JSON.parse(raw);
  //       parsed.data = data;
  //       localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  //     }
  //   } catch {}
  // }, [data]);

  const metrics = METRICS_MAP[decodedDeptName] || [];
  const deptData = data[decodedDeptName] || {};

  const departmentAverage = useMemo(() => {
    const vals = Object.entries(deptData).map(([k, v]) => {
      const val = clamp01(v);
      return INVERSE_KEYS.has(k) ? 100 - val : val;
    });
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [deptData]);

  const handleMetricChange = (metric: string, value: number) => {
    setData((prev) => ({
      ...prev,
      [decodedDeptName]: {
        ...prev[decodedDeptName],
        [metric]: clamp01(value),
      },
    }));
  };

  const handleSaveChanges = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/departments/${decodedDeptName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data[decodedDeptName]),
    });

    if (!res.ok) throw new Error("Failed to save data");

    // ✅ Re-fetch updated data from backend to update slider UI
    const refresh = await fetch(`${API_BASE}/api/departments/${decodedDeptName}`);
    const updated = await refresh.json();
    setData((prev) => ({
      ...prev,
      [decodedDeptName]: updated, // refresh only that dept
    }));

    toast({
      title: "Changes saved",
      description: `${decodedDeptName} metrics updated successfully.`,
    });
  } catch (err) {
    console.error("Error saving metrics:", err);
    toast({
      title: "Save failed",
      description: "Could not update metrics. Please try again.",
      variant: "destructive",
    });
  }
};



  if (!METRICS_MAP[decodedDeptName]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardHeader>
            <CardTitle>Department not found</CardTitle>
            <CardDescription>The department you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{decodedDeptName}</CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">
                  {Math.round(departmentAverage)}%
                </span>
                <CardDescription className="text-base">Department Average</CardDescription>
              </div>
              <CardDescription>
                Update the 5 key results below (0–100). Inverse metrics are auto-normalized.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.map((m) => (
                <MetricSlider
                  key={m}
                  metric={m}
                  value={deptData[m] || 0}
                  onChange={(val) => handleMetricChange(m, val)}
                  isInverse={INVERSE_KEYS.has(m)}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Button onClick={handleSaveChanges} className="mt-4">
            Save Changes
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Metrics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniBar dept={decodedDeptName} metrics={metrics} values={deptData} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DepartmentDetail;