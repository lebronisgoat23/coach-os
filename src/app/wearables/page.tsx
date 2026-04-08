"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOuraRing } from "@/hooks/use-oura-ring";
import { toast } from "sonner";

const WEARABLES = [
  {
    id: "oura",
    name: "Oura Ring",
    emoji: "💍",
    description: "睡眠、HRV、心率、活動",
    available: true,
  },
  {
    id: "apple_health",
    name: "Apple Health",
    emoji: "🍎",
    description: "步數、心率、睡眠",
    available: false,
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    emoji: "⌚",
    description: "運動、睡眠、壓力",
    available: false,
  },
  {
    id: "whoop",
    name: "WHOOP",
    emoji: "🔴",
    description: "恢復、壓力、睡眠",
    available: false,
  },
];

export default function WearablesPage() {
  const [ouraToken, setOuraToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const { data, loading, connected, fetchData, disconnect } = useOuraRing();

  // Restore token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vitrion-oura-token");
    if (saved) {
      setOuraToken(saved);
      fetchData(saved);
    }
  }, [fetchData]);

  const handleOuraConnect = async () => {
    if (!ouraToken.trim()) {
      toast.error("請輸入 Oura Personal Access Token");
      return;
    }

    localStorage.setItem("vitrion-oura-token", ouraToken);
    await fetchData(ouraToken);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/[0.03] blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-8 space-y-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="text-4xl"
          >
            ⌚
          </motion.div>
          <h1 className="text-xl font-bold">穿戴裝置連接</h1>
          <p className="text-xs text-muted-foreground">
            同步真實生理數據，讓 Alpha 引擎更精準
          </p>
        </motion.div>

        {/* Connected Data Preview */}
        {connected && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    💍 Oura Ring 數據
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                      已連接
                    </Badge>
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    最近 {data.length} 天
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <MiniStat
                    label="睡眠"
                    value={Math.round(data.reduce((a, b) => a + b.sleepScore, 0) / data.length)}
                    unit="/100"
                  />
                  <MiniStat
                    label="恢復"
                    value={Math.round(data.reduce((a, b) => a + b.readinessScore, 0) / data.length)}
                    unit="/100"
                  />
                  <MiniStat
                    label="HRV"
                    value={Math.round(data.reduce((a, b) => a + b.hrvMs, 0) / data.length)}
                    unit="ms"
                  />
                  <MiniStat
                    label="RHR"
                    value={Math.round(data.reduce((a, b) => a + b.rhrBpm, 0) / data.length)}
                    unit="bpm"
                  />
                </div>

                {/* Last 7 days mini bar */}
                <div className="flex items-end gap-1 h-12">
                  {data.slice(-7).map((d, i) => (
                    <motion.div
                      key={d.date}
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.sleepScore / 100) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500/60 to-emerald-400/30"
                      title={`${d.date}: ${d.sleepScore}`}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground/50 text-center mt-1">
                  7 日睡眠分數趨勢
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Wearable List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                支援裝置
              </h3>
            </CardHeader>
            <CardContent className="space-y-1">
              {WEARABLES.map((w) => (
                <div key={w.id}>
                  <button
                    onClick={() => {
                      if (w.id === "oura") {
                        if (connected) {
                          disconnect();
                        } else {
                          setShowTokenInput(!showTokenInput);
                        }
                      } else {
                        toast.info(`${w.emoji} ${w.name} 即將支援`);
                      }
                    }}
                    className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-xl">{w.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{w.name}</p>
                      <p className="text-[10px] text-muted-foreground">{w.description}</p>
                    </div>
                    {w.id === "oura" && connected ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                        已連接
                      </Badge>
                    ) : w.available ? (
                      <Badge variant="outline" className="text-[10px]">
                        連接
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/40">即將推出</span>
                    )}
                  </button>

                  {/* Oura Token Input */}
                  {w.id === "oura" && showTokenInput && !connected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-2 pb-3"
                    >
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="貼上 Personal Access Token"
                          value={ouraToken}
                          onChange={(e) => setOuraToken(e.target.value)}
                          className="bg-secondary/50 text-xs"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleOuraConnect}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-xs font-bold whitespace-nowrap disabled:opacity-50"
                        >
                          {loading ? "⏳" : "同步"}
                        </motion.button>
                      </div>
                      <p className="text-[9px] text-muted-foreground/50 mt-1.5">
                        前往{" "}
                        <a
                          href="https://cloud.ouraring.com/personal-access-tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline"
                        >
                          cloud.ouraring.com
                        </a>
                        {" "}取得 Token
                      </p>
                    </motion.div>
                  )}
                  <Separator className="opacity-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Manual Input Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                手動輸入
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                沒有穿戴裝置？你可以手動記錄基本生理數據。
              </p>
              <button
                onClick={() => toast.info("📝 手動輸入功能將在下個版本推出")}
                className="w-full py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors"
              >
                📝 開始記錄
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance */}
        <p className="text-[9px] text-muted-foreground/40 text-center leading-relaxed">
          穿戴裝置數據僅用於個人狀態追蹤，不具醫療診斷用途。
          <br />
          Token 存儲於本地裝置，不會上傳至第三方。
        </p>
      </main>
    </div>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-emerald-400">
        {value}
        <span className="text-[9px] text-muted-foreground font-normal">{unit}</span>
      </p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}
