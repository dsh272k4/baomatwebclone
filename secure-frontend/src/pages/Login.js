// secure-frontend/src/pages/Login.js
import React, { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../api";
import Terms from "./Terms";
import { motion, AnimatePresence } from "framer-motion";

export default function Login({ setRole }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);

  const recaptchaRef = useRef();

  // ✅ Dành cho CRA (Create React App)
  const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    console.log("🔑 reCAPTCHA site key:", RECAPTCHA_SITE_KEY);
    document.title = mode === "login" ? "Đăng nhập" : "Đăng ký";
  }, [mode]);

  // countdown lockout
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (diff <= 0) {
        clearInterval(interval);
        setLockoutUntil(null);
        setRemaining(0);
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setMsg("");
    setForm({ username: "", password: "", confirm: "", agree: false });
    resetCaptcha();
  };

  const handleCaptchaChange = (token) => {
    console.log("✅ reCAPTCHA token received:", token);
    if (token) {
      setCaptchaVerified(true);
      setCaptchaError(false);
    } else {
      setCaptchaVerified(false);
    }
  };

  const handleCaptchaError = () => {
    setCaptchaError(true);
    setCaptchaVerified(false);
    setMsg("❌ Lỗi xác thực CAPTCHA, vui lòng thử lại");
  };

  const handleCaptchaExpire = () => {
    setCaptchaVerified(false);
    setCaptchaError(true);
    setMsg("❌ reCAPTCHA đã hết hạn, vui lòng thử lại");
  };

  const resetCaptcha = () => {
    setCaptchaVerified(false);
    setCaptchaError(false);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (lockoutUntil && Date.now() < lockoutUntil) {
      return setMsg(`❌ Tài khoản bị khóa, thử lại sau ${remaining}s`);
    }

    // Kiểm tra CAPTCHA
    if (!captchaVerified) {
      setCaptchaError(true);
      return setMsg('❌ Vui lòng xác thực "Tôi không phải là người máy" trước khi tiếp tục');
    }

    setLoading(true);
    try {
      // Lấy reCAPTCHA token từ ref
      const recaptchaToken = recaptchaRef.current.getValue();
      console.log("📤 Gửi reCAPTCHA token:", recaptchaToken);

      if (!recaptchaToken) throw new Error("Không thể lấy reCAPTCHA token");

      if (mode === "register") {
        if (!form.username || !form.password || !form.confirm)
          return setMsg("Vui lòng nhập đủ thông tin");
        if (form.username.length < 4)
          return setMsg("Tên đăng nhập phải có ít nhất 4 ký tự");
        if (form.password.length < 6)
          return setMsg("Mật khẩu phải có ít nhất 6 ký tự");
        if (form.password !== form.confirm)
          return setMsg("Mật khẩu không khớp");
        if (!form.agree)
          return setMsg("Vui lòng đồng ý với Điều khoản sử dụng!");

        // Gửi kèm recaptchaToken
        await api.post("/auth/register", {
          username: form.username,
          password: form.password,
          recaptchaToken: recaptchaToken,
        });

        setMsg("✅ Đăng ký thành công! Hãy đăng nhập.");
        setMode("login");
        setForm({ username: "", password: "", confirm: "", agree: false });
        resetCaptcha();
        return;
      }

      // login - Gửi kèm recaptchaToken
      const res = await api.post("/auth/login", {
        username: form.username,
        password: form.password,
        recaptchaToken: recaptchaToken,
      });

      const token = res.data.token;
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload));
      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.role);
      setRole(decoded.role);

      setMsg("✅ Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = decoded.role === "admin" ? "/admin" : "/";
      }, 700);
    } catch (err) {
      const message = err.response?.data?.message || "Lỗi không xác định";
      if (err.response?.status === 403 && message.includes("tạm khóa")) {
        const match = message.match(/(\d+)s/);
        if (match) {
          const secs = parseInt(match[1]);
          const until = Date.now() + secs * 1000;
          setLockoutUntil(until);
          setRemaining(secs);
        }
        setMsg(`🚫 ${message}`);
      } else {
        setMsg("❌ " + message);
      }
      // Reset CAPTCHA khi có lỗi
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              {mode === "login" ? "🔐" : "👤"}
            </div>
            <h1 className="auth-title">
              {mode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
            </h1>
            <p className="auth-subtitle">
              {mode === "login" ? "Chào mừng bạn trở lại" : "Tạo tài khoản mới"}
            </p>
          </div>

          {/* Messages */}
          {msg && (
            <div
              className={`auth-message ${msg.includes("✅")
                  ? "message-success"
                  : msg.includes("❌") || msg.includes("🚫")
                    ? "message-error"
                    : "message-warning"
                }`}
            >
              {msg}
            </div>
          )}

          {remaining > 0 && (
            <div className="auth-message message-warning">
              ⏳ Tài khoản bị khóa, vui lòng thử lại sau {remaining}s
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập..."
                value={form.username}
                onChange={handleChange}
                disabled={remaining > 0 || loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={handleChange}
                  disabled={remaining > 0 || loading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <>
                <div className="form-group">
                  <label htmlFor="confirm">Xác nhận mật khẩu</label>
                  <div className="password-input">
                    <input
                      id="confirm"
                      name="confirm"
                      type={showConfirmPass ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu..."
                      value={form.confirm}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="terms-agreement">
                  <input
                    type="checkbox"
                    id="agree"
                    name="agree"
                    checked={form.agree || false}
                    onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                  />
                  <label htmlFor="agree">
                    Tôi đồng ý với{" "}
                    <span
                      className="terms-link"
                      onClick={() => setShowTerms(true)}
                    >
                      Điều khoản sử dụng & Chính sách bảo mật
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Google reCAPTCHA */}
            <div className={`captcha-section ${captchaError ? "captcha-error" : ""}`}>
              <div className="captcha-header">
                <span>Xác thực bảo mật</span>
                {captchaVerified && (
                  <span className="captcha-success-icon">✅ Đã xác thực</span>
                )}
              </div>

              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                  onErrored={handleCaptchaError}
                  onExpired={handleCaptchaExpire}
                  size="normal"
                  theme="light"
                />
              </div>

              {captchaError && !captchaVerified && (
                <div className="captcha-error-message">
                  ❌ Vui lòng xác thực rằng bạn không phải là người máy
                </div>
              )}

              <div className="captcha-note">
                🔒 reCAPTCHA giúp bảo vệ tài khoản của bạn khỏi truy cập trái phép
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || remaining > 0 || !captchaVerified}
              className="auth-submit-btn"
            >
              {loading ? "⏳ Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="auth-switch">
            <p>
              {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button className="link-btn" onClick={toggleMode} disabled={loading}>
                {mode === "login" ? "Đăng ký" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Modal điều khoản */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            className="auth-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTerms(false)}
          >
            <motion.div
              className="auth-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Điều khoản sử dụng & Chính sách bảo mật</h3>
              </div>
              <div className="modal-content">
                <Terms />
              </div>
              <div className="modal-footer">
                <button className="modal-cancel-btn" onClick={() => setShowTerms(false)}>
                  Đóng
                </button>
                <button
                  className="modal-confirm-btn"
                  onClick={() => {
                    setForm({ ...form, agree: true });
                    setShowTerms(false);
                  }}
                >
                  Tôi đã đọc và đồng ý
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
