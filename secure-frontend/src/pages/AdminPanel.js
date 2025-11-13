// secure-frontend/src/pages/AdminPanel.js
import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [msg, setMsg] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({ username: "", role: "user" });
    const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
    const [showPassword, setShowPassword] = useState(false);

    async function fetchUsers() {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            setMsg(err.response?.data?.message || "❌ Không tải được danh sách người dùng");
        }
    }

    async function addUser() {
        try {
            if (!newUser.username || !newUser.password) {
                setMsg("⚠️ Vui lòng nhập tên và mật khẩu");
                return;
            }
            await api.post("/admin/users", newUser);
            setNewUser({ username: "", password: "", role: "user" });
            fetchUsers();
            setMsg("✅ Thêm người dùng thành công");
        } catch (err) {
            setMsg(err.response?.data?.message || "❌ Lỗi thêm người dùng");
        }
    }

    async function saveEdit() {
        try {
            await api.put(`/admin/users/${editingUser}`, editData);
            setEditingUser(null);
            fetchUsers();
            setMsg("✅ Cập nhật người dùng thành công");
        } catch (err) {
            setMsg(err.response?.data?.message || "❌ Lỗi cập nhật người dùng");
        }
    }

    async function deleteUser(id) {
        if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers();
                setMsg("🗑️ Đã xóa người dùng");
            } catch (err) {
                setMsg(err.response?.data?.message || "❌ Lỗi xóa người dùng");
            }
        }
    }

    async function lockUser(id, lock) {
        try {
            await api.put(`/admin/users/${id}/lock`, { lock });
            fetchUsers();
            setMsg(lock ? "🔒 Đã khóa người dùng" : "🔓 Đã mở khóa người dùng");
        } catch (err) {
            setMsg(err.response?.data?.message || "❌ Lỗi cập nhật trạng thái");
        }
    }

    async function resetPassword(id) {
        const newPassword = prompt("🔑 Nhập mật khẩu mới cho người dùng:");
        if (!newPassword) return;
        try {
            await api.put(`/admin/users/${id}/reset-password`, { newPassword });
            setMsg("✅ Đặt lại mật khẩu thành công");
        } catch (err) {
            setMsg(err.response?.data?.message || "❌ Lỗi đặt lại mật khẩu");
        }
    }

    function startEdit(user) {
        setEditingUser(user.id);
        setEditData({ username: user.username, role: user.role });
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div style={{ padding: 40 }}>
            <h2>👑 Quản lý người dùng</h2>
            {msg && <p style={{ color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}

            {/* ➕ Thêm người dùng mới */}
            <div style={{ marginBottom: 20 }}>
                <h3>➕ Thêm người dùng mới</h3>
                <input
                    placeholder="Tên đăng nhập"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />{" "}
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />{" "}
                <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🙈 Ẩn" : "👁️ Hiện"}
                </button>{" "}
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>{" "}
                <button onClick={addUser}>Thêm</button>
            </div>

            {/* 📋 Bảng danh sách */}
            <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f0f0f0" }}>
                    <tr>
                        <th>ID</th>
                        <th>Tên đăng nhập</th>
                        <th>Quyền</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>
                                {editingUser === u.id ? (
                                    <input
                                        value={editData.username}
                                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                    />
                                ) : (
                                    u.username
                                )}
                            </td>
                            <td>
                                {editingUser === u.id ? (
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                ) : (
                                    u.role
                                )}
                            </td>
                            <td style={{ color: u.is_locked ? "red" : "green" }}>
                                {u.is_locked ? "🔒 Khóa" : "✅ Mở"}
                            </td>
                            <td>{new Date(u.created_at).toLocaleString()}</td>
                            <td>
                                {editingUser === u.id ? (
                                    <>
                                        <button onClick={saveEdit}>💾 Lưu</button>
                                        <button onClick={() => setEditingUser(null)}>❌ Hủy</button>
                                    </>
                                ) : (
                                    <>
                                        {u.role !== "admin" && (
                                            <>
                                                <button onClick={() => startEdit(u)}>✏️ Sửa</button>
                                                <button onClick={() => lockUser(u.id, !u.is_locked)}>
                                                    {u.is_locked ? "Mở khóa" : "Khóa"}
                                                </button>
                                                <button onClick={() => resetPassword(u.id)}>🔑 Reset mật khẩu</button>
                                                <button onClick={() => deleteUser(u.id)}>🗑️ Xóa</button>
                                            </>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 