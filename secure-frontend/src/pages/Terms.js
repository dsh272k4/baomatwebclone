// src/pages/Terms.js
import React from "react";
import { motion } from "framer-motion";

export default function Terms() {
    const sections = [
        {
            icon: "📋",
            title: "1. Quy định sử dụng",
            content: "Khi đăng ký và sử dụng tài khoản, bạn đồng ý tuân thủ các điều khoản sau:",
            items: [
                "Không được chia sẻ tài khoản cho người khác sử dụng",
                "Không sử dụng dịch vụ cho mục đích vi phạm pháp luật Việt Nam",
                "Nghiêm cấm mọi hành vi tấn công, phá hoại hoặc khai thác lỗ hổng của hệ thống",
                "Không đăng tải nội dung vi phạm bản quyền, xúc phạm cá nhân/tổ chức"
            ]
        },
        {
            icon: "🔒",
            title: "2. Bảo mật thông tin",
            content: "Chúng tôi cam kết bảo vệ thông tin của bạn:",
            items: [
                "Chỉ thu thập và lưu trữ những thông tin cần thiết để cung cấp dịch vụ",
                "Dữ liệu cá nhân được mã hóa và bảo vệ khỏi các truy cập trái phép",
                "Không chia sẻ thông tin cá nhân cho bên thứ ba không liên quan",
                "Bạn có toàn quyền yêu cầu chỉnh sửa hoặc xóa tài khoản và dữ liệu liên quan"
            ]
        },
        {
            icon: "⚖️",
            title: "3. Trách nhiệm người dùng",
            content: "Người dùng cần lưu ý các trách nhiệm sau:",
            items: [
                "Chịu toàn bộ trách nhiệm về mọi hoạt động diễn ra trên tài khoản của mình",
                "Bảo mật thông tin đăng nhập, không tiết lộ cho người khác",
                "Thông báo ngay cho quản trị viên khi phát hiện hoạt động bất thường",
                "Tuân thủ các hướng dẫn sử dụng và quy định của hệ thống"
            ]
        },
        {
            icon: "🔄",
            title: "4. Quyền và nghĩa vụ",
            content: "Các quyền lợi và nghĩa vụ của người dùng:",
            items: [
                "Được sử dụng đầy đủ tính năng theo phân quyền tài khoản",
                "Được hỗ trợ kỹ thuật trong giờ hành chính",
                "Có nghĩa vụ cập nhật thông tin tài khoản khi có thay đổi",
                "Thông báo kịp thời các vấn đề phát sinh trong quá trình sử dụng"
            ]
        },
        {
            icon: "📞",
            title: "5. Liên hệ hỗ trợ",
            content: "Mọi thắc mắc hoặc yêu cầu hỗ trợ:",
            items: [
                "Email: Dsh272004@example.com",
                "Hotline: 0983077673 (8:00 - 17:00 hàng ngày)",
                "Địa chỉ: Bắc Ninh",
                "Thời gian phản hồi: Trong vòng 24 giờ làm việc"
            ]
        }
    ];

    return (
        <div className="text-gray-700 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                    <span className="text-3xl">📜</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Điều khoản sử dụng dịch vụ
                </h2>
                <p className="text-gray-600">
                    Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ
                </p>
            </div>

            {/* Introduction */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center"
            >
                <p className="text-blue-700 font-medium">
                    Chào mừng bạn đến với hệ thống của chúng tôi!
                    Bằng việc sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản dưới đây.
                </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-6">
                {sections.map((section, index) => (
                    <motion.section
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                <span className="text-xl">{section.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-gray-600 mb-3">{section.content}</p>
                                <ul className="space-y-2">
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start space-x-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.section>
                ))}
            </div>

            {/* Footer Note */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 text-center"
            >
                <p className="text-indigo-700 font-semibold mb-2">
                    🎯 Lưu ý quan trọng
                </p>
                <p className="text-gray-600 text-sm">
                    Bằng việc nhấn nút "Tôi đã đọc và đồng ý", bạn xác nhận đã đọc, hiểu rõ
                    và đồng ý với tất cả các điều khoản được nêu trên. Các điều khoản có thể
                    được cập nhật định kỳ và sẽ được thông báo đến người dùng.
                </p>
            </motion.div>

            {/* Version & Date */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                Phiên bản 1.0 • Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </div>
        </div>
    );
}