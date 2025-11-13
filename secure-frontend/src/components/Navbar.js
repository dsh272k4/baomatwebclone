// secure-frontend/src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ role, setRole }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.clear();
    setRole(""); // reset role trong state App.js
    navigate("/login");
  }

  return (
    <nav style={{ background: "#333", padding: "10px", color: "#fff" }}>
      <Link to="/" style={{ color: "#fff", marginRight: 10, textDecoration: "none" }}>
        Trang chủ
      </Link>

      {token ? (
        <>
          {/* Hiển thị cho cả user và admin */}
          <Link
            to="/profile"
            style={{ color: "#fff", marginRight: 10, textDecoration: "none" }}
          >
            👤 Thông tin tài khoản
          </Link>

          {/* Chỉ hiển thị cho admin */}
          {role === "admin" && (
            <>
              <Link
                to="/admin"
                style={{ color: "#fff", marginRight: 10, textDecoration: "none" }}
              >
                Quản lý
              </Link>
              <Link
                to="/logs"
                style={{ color: "#fff", marginRight: 10, textDecoration: "none" }}
              >
                Nhật ký
              </Link>
            </>
          )}

          <button
            onClick={logout}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid #fff",
              borderRadius: 4,
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Đăng xuất
          </button>
        </>
      ) : (
        <Link to="/login" style={{ color: "#fff", marginRight: 10, textDecoration: "none" }}>
          Đăng nhập
        </Link>
      )}
    </nav>
  );
}