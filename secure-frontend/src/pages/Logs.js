// secure-frontend/src/pages/Logs.js
import React, { useEffect, useState } from "react";
import api from "../api";

export default function Logs() {
  const [logs, setLogs] = useState({ wafLog: "", adminLog: "" });
  useEffect(() => {
    api.get("/admin/logs").then(res => setLogs(res.data)).catch(() => {/*ignore*/ });
  }, []);
  return (
    <div style={{ padding: 40 }}>
      <h2>Nhật ký</h2>
      <h3>WAF</h3>
      <pre style={{ background: "#f6f6f6", padding: 10, maxHeight: 300, overflow: "auto" }}>{logs.wafLog || "(Trống)"}</pre>
      <h3>Admin</h3>
      <pre style={{ background: "#f6f6f6", padding: 10, maxHeight: 300, overflow: "auto" }}>{logs.adminLog || "(Trống)"}</pre>
    </div>
  );
}