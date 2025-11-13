import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Profile() {
    const [profile, setProfile] = useState({
        username: '',
        full_name: '',
        email: '',
        phone: '',
        password_changed_at: '',
        receive_login_alerts: true
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileMsg, setProfileMsg] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordPolicy, setPasswordPolicy] = useState(null);
    const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
    const [daysUntilExpiry, setDaysUntilExpiry] = useState(null);
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [emailSettings, setEmailSettings] = useState({
        receive_login_alerts: true
    });

    // Hàm tải thông tin profile và chính sách mật khẩu
    async function fetchProfile() {
        try {
            const [profileRes, policyRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/auth/password-policy')
            ]);

            setProfile(profileRes.data);
            setPasswordPolicy(policyRes.data);
            setEmailSettings({
                receive_login_alerts: profileRes.data.receive_login_alerts === 1
            });

            // Tính số ngày còn lại cho mật khẩu
            if (profileRes.data.password_changed_at) {
                const changedDate = new Date(profileRes.data.password_changed_at);
                const expiryDate = new Date(changedDate.getTime() + (policyRes.data.policy.maxAgeDays * 24 * 60 * 60 * 1000));
                const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                setDaysUntilExpiry(daysLeft);
            }

        } catch (err) {
            setProfileMsg(err.response?.data?.message || '❌ Lỗi tải thông tin');
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleEmailSettingsChange = async (setting, value) => {
        try {
            const newSettings = { ...emailSettings, [setting]: value };
            setEmailSettings(newSettings);

            await api.put('/auth/email-settings', {
                receive_login_alerts: newSettings.receive_login_alerts
            });

            setProfileMsg('✅ Cập nhật cài đặt email thành công');
        } catch (err) {
            setProfileMsg(`❌ ${err.response?.data?.message || 'Lỗi cập nhật cài đặt'}`);
            // Revert on error
            setEmailSettings({ ...emailSettings, [setting]: !value });
        }
    };

    // Xử lý cập nhật profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMsg('');
        try {
            const res = await api.put('/auth/profile', {
                full_name: profile.full_name,
                email: profile.email,
                phone: profile.phone
            });
            setProfileMsg(`✅ ${res.data.message}`);
            // Refresh profile to get updated data
            fetchProfile();
        } catch (err) {
            setProfileMsg(`❌ ${err.response?.data?.message || 'Lỗi cập nhật'}`);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMsg('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setPasswordMsg('❌ Mật khẩu xác nhận không khớp');
        }

        try {
            const res = await api.put('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordMsg(`✅ ${res.data.message}`);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });

            // Reload profile để cập nhật thời gian đổi mật khẩu
            fetchProfile();

        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.errors) {
                setPasswordMsg(`❌ ${errorData.message}: ${errorData.errors.join(', ')}`);
            } else {
                setPasswordMsg(`❌ ${errorData?.message || 'Lỗi đổi mật khẩu'}`);
            }
        }
    };

    const validatePasswordStrength = (password) => {
        if (!passwordPolicy || !password) return { score: 0, feedback: [] };

        const feedback = [];
        let score = 0;

        if (password.length >= passwordPolicy.policy.minLength) score += 2;
        else feedback.push(`Ít nhất ${passwordPolicy.policy.minLength} ký tự`);

        if (/[A-Z]/.test(password)) score += 1;
        else if (passwordPolicy.policy.requireUppercase) feedback.push("Chứa chữ in hoa");

        if (/[a-z]/.test(password)) score += 1;
        else if (passwordPolicy.policy.requireLowercase) feedback.push("Chứa chữ thường");

        if (/\d/.test(password)) score += 1;
        else if (passwordPolicy.policy.requireNumbers) feedback.push("Chứa số");

        if (/[!@#$%^&*()_+\-=\\[\]{};':"|,.<>/?]/.test(password)) score += 1;
        else if (passwordPolicy.policy.requireSpecialChars) feedback.push("Chứa ký tự đặc biệt");

        return { score, feedback };
    };

    const passwordStrength = validatePasswordStrength(passwordData.newPassword);

    const getPasswordStrengthColor = (score) => {
        if (score >= 5) return '#10b981';
        if (score >= 3) return '#f59e0b';
        return '#ef4444';
    };

    const getPasswordStrengthText = (score) => {
        if (score >= 5) return 'Rất mạnh';
        if (score >= 3) return 'Trung bình';
        return 'Yếu';
    };

    return (
        <div style={{ padding: 40, display: 'flex', gap: '40px', flexDirection: 'column' }}>

            {/* Thông báo hết hạn mật khẩu */}
            {daysUntilExpiry !== null && daysUntilExpiry <= 14 && (
                <div style={{
                    padding: '15px',
                    backgroundColor: daysUntilExpiry <= 7 ? '#fee2e2' : '#fef3c7',
                    border: `1px solid ${daysUntilExpiry <= 7 ? '#fecaca' : '#fcd34d'}`,
                    borderRadius: '8px',
                    color: daysUntilExpiry <= 7 ? '#dc2626' : '#d97706',
                    marginBottom: '20px'
                }}>
                    <strong>⚠️ Cảnh báo mật khẩu:</strong>
                    {daysUntilExpiry <= 0
                        ? ' Mật khẩu của bạn đã hết hạn. Vui lòng đổi mật khẩu ngay!'
                        : ` Mật khẩu của bạn sẽ hết hạn trong ${daysUntilExpiry} ngày. Vui lòng đổi mật khẩu sớm.`
                    }
                </div>
            )}

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {/* Form 1: Cập nhật thông tin */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2>👤 Thông tin tài khoản</h2>
                    {profileMsg && (
                        <p style={{
                            color: profileMsg.startsWith('✅') ? 'green' : 'red',
                            padding: '10px',
                            backgroundColor: profileMsg.startsWith('✅') ? '#f0f9ff' : '#fef2f2',
                            borderRadius: '6px',
                            border: `1px solid ${profileMsg.startsWith('✅') ? '#bae6fd' : '#fecaca'}`
                        }}>
                            {profileMsg}
                        </p>
                    )}

                    <form onSubmit={handleProfileSubmit}>
                        <div style={{ marginBottom: 15 }}>
                            <label><strong>Tên đăng nhập:</strong></label>
                            <input
                                type="text"
                                name="username"
                                value={profile.username}
                                readOnly
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '5px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    color: '#6c757d'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 15 }}>
                            <label><strong>Họ và tên:</strong></label>
                            <input
                                type="text"
                                name="full_name"
                                value={profile.full_name || ''}
                                onChange={handleProfileChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '5px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 15 }}>
                            <label><strong>Email:</strong></label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email || ''}
                                onChange={handleProfileChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '5px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label><strong>Số điện thoại:</strong></label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone || ''}
                                onChange={handleProfileChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '5px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            💾 Cập nhật thông tin
                        </button>
                    </form>
                </div>

                {/* Form 2: Đổi mật khẩu với validation mới */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2>🔑 Đổi mật khẩu</h2>

                    <div style={{
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '500' }}>Chính sách mật khẩu mạnh</span>
                        <button
                            type="button"
                            onClick={() => setShowPasswordPolicy(!showPasswordPolicy)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '14px'
                            }}
                        >
                            {showPasswordPolicy ? 'Ẩn yêu cầu' : 'Hiển thị yêu cầu'}
                        </button>
                    </div>

                    {showPasswordPolicy && passwordPolicy && (
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}>
                            <strong>📋 Yêu cầu mật khẩu:</strong>
                            <ul style={{ margin: '10px 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                                <li>Ít nhất <strong>{passwordPolicy.policy.minLength} ký tự</strong></li>
                                <li>Chứa <strong>chữ in hoa</strong> và <strong>chữ thường</strong></li>
                                <li>Chứa ít nhất <strong>một số</strong></li>
                                <li>Chứa ít nhất <strong>một ký tự đặc biệt</strong> (!@#$%^&*...)</li>
                                <li>Không được trùng với <strong>5 mật khẩu gần nhất</strong></li>
                                <li>Thay đổi mỗi <strong>{passwordPolicy.policy.maxAgeDays} ngày</strong></li>
                            </ul>
                        </div>
                    )}

                    {passwordMsg && (
                        <p style={{
                            color: passwordMsg.startsWith('✅') ? 'green' : 'red',
                            padding: '10px',
                            backgroundColor: passwordMsg.startsWith('✅') ? '#f0f9ff' : '#fef2f2',
                            borderRadius: '6px',
                            border: `1px solid ${passwordMsg.startsWith('✅') ? '#bae6fd' : '#fecaca'}`,
                            marginBottom: '15px'
                        }}>
                            {passwordMsg}
                        </p>
                    )}

                    <form onSubmit={handlePasswordSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label><strong>Mật khẩu hiện tại:</strong></label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.old ? "text" : "password"}
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 10px',
                                        marginTop: '5px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('old')}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    {showPassword.old ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label><strong>Mật khẩu mới:</strong></label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 10px',
                                        marginTop: '5px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    {showPassword.new ? '🙈' : '👁️'}
                                </button>
                            </div>

                            {/* Password strength meter */}
                            {passwordData.newPassword && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '5px'
                                    }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                            Độ mạnh:
                                        </span>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: getPasswordStrengthColor(passwordStrength.score)
                                        }}>
                                            {getPasswordStrengthText(passwordStrength.score)}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        backgroundColor: '#e2e8f0',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        marginBottom: '5px'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(passwordStrength.score / 6) * 100}%`,
                                            backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                                            transition: 'all 0.3s ease',
                                            borderRadius: '3px'
                                        }}></div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {passwordStrength.score}/6 điểm - {passwordData.newPassword.length} ký tự
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label><strong>Xác nhận mật khẩu mới:</strong></label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 10px',
                                        marginTop: '5px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    {showPassword.confirm ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={passwordStrength.score < 3}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: passwordStrength.score >= 3 ? '#10b981' : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: passwordStrength.score >= 3 ? 'pointer' : 'not-allowed',
                                fontSize: '16px',
                                fontWeight: '500',
                                width: '100%'
                            }}
                        >
                            {passwordStrength.score >= 3 ? '🔄 Đổi mật khẩu' : 'Vui lòng nhập mật khẩu mạnh'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Phần cài đặt email */}
            <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '10px',
                border: '1px solid #dee2e6'
            }}>
                <h2>📧 Cài đặt Thông báo Email</h2>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={emailSettings.receive_login_alerts}
                            onChange={(e) => handleEmailSettingsChange('receive_login_alerts', e.target.checked)}
                            style={{ marginRight: '10px' }}
                        />
                        <div>
                            <strong>Nhận thông báo đăng nhập</strong>
                            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                                Gửi email cảnh báo khi có ai đó đăng nhập vào tài khoản của bạn
                            </p>
                        </div>
                    </label>
                </div>

                {profile.email ? (
                    <div style={{
                        padding: '15px',
                        background: '#d1ecf1',
                        borderRadius: '5px',
                        border: '1px solid #bee5eb'
                    }}>
                        <strong>📩 Email nhận thông báo:</strong> {profile.email}
                    </div>
                ) : (
                    <div style={{
                        padding: '15px',
                        background: '#fff3cd',
                        borderRadius: '5px',
                        border: '1px solid #ffeaa7'
                    }}>
                        <strong>⚠️ Chưa có email</strong>
                        <p style={{ margin: '5px 0 0 0' }}>
                            Thêm email vào thông tin cá nhân để nhận thông báo bảo mật
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 