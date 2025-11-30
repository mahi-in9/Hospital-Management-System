import { useEffect, useState } from "react";
import apiClient from "../api/client";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const mockChartData = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 550 },
  { name: "Thu", value: 450 },
  { name: "Fri", value: 600 },
  { name: "Sat", value: 400 },
  { name: "Sun", value: 300 },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/protected/dashboard");
        if (mounted) setData(res.data.data);
      } catch (err) {
        // fallback to mock data
        if (mounted)
          setData({
            stats: {
              totalPatients: 1234,
              ipdPatients: 120,
              opdPatients: 1114,
              activePatients: 900,
            },
            recentActivity: [],
          });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    {
      title: "Total Patients",
      value: data?.stats?.totalPatients || 0,
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "IPD Patients",
      value: data?.stats?.ipdPatients || 0,
      change: "+4.2%",
      trend: "up",
    },
    {
      title: "OPD Patients",
      value: data?.stats?.opdPatients || 0,
      change: "-2.1%",
      trend: "down",
    },
    {
      title: "Active Patients",
      value: data?.stats?.activePatients || 0,
      change: "+8.1%",
      trend: "up",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <div className="text-sm text-secondary-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-700">Dashboard</h1>
            <p className="text-secondary-600 mt-1">
              Overview of hospital operations and statistics.
            </p>
          </div>
          <div className="text-sm text-secondary-600 bg-white/50 px-3 py-1 rounded-full border border-secondary-200">
            Last updated: Just now
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 bg-white rounded shadow-sm border">
              <p className="text-sm text-secondary-600">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-2xl font-bold text-primary-700">
                  {stat.value}
                </h2>
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    stat.trend === "up"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="col-span-2 bg-white rounded shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-4">
              Patient Admissions Trend
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-secondary-600">
                        {item.resourceType}: {item.resourceId}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-600 text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
