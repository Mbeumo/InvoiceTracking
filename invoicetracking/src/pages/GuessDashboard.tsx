import React, { useState, useEffect } from 'react';
import {
    useNavigate,
} from 'react-router-dom'
import {
    FileText, Bell, Users, TrendingUp, Shield, Smartphone, Monitor, Zap,
    CheckCircle, Play, Calendar, Rocket, Menu, X, ArrowRight, BarChart3, Camera,
    Clock, Globe
} from 'lucide-react';

export const SmartTrackLanding: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDemo, setActiveDemo] = useState<'web' | 'mobile'>('web');
    const [currentStat, setCurrentStat] = useState(0);
    const navigate = useNavigate()

    const stats = [
        { value: '99.9%', label: 'Accuracy Rate' },
        { value: '85%', label: 'Time Saved' },
        { value: '24/7', label: 'Monitoring' },
        { value: '90%', label: 'Faster Processing' }
    ];

    const features = [
        {
            icon: <Camera className="w-8 h-8" />,
            title: "AI-Powered OCR",
            description: "Scan invoices with your phone camera or upload PDFs. Our AI extracts all data instantly with 99.9% accuracy.",
            color: "from-blue-500 to-blue-600",
            bgColor: "from-blue-50 to-blue-100"
        },
        {
            icon: <Bell className="w-8 h-8" />,
            title: "Smart Notifications",
            description: "Never miss a payment deadline. Get push notifications on mobile and email alerts for all critical actions.",
            color: "from-green-500 to-green-600",
            bgColor: "from-green-50 to-green-100"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Multi-User Collaboration",
            description: "Seamless workflow between procurement, accounting, and management teams with role-based permissions.",
            color: "from-purple-500 to-purple-600",
            bgColor: "from-purple-50 to-purple-100"
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Predictive Analytics",
            description: "ML-powered insights predict cash flow needs and identify spending patterns to optimize financial planning.",
            color: "from-orange-500 to-orange-600",
            bgColor: "from-orange-50 to-orange-100"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Enterprise Security",
            description: "Bank-grade AES-256 encryption, automatic backups, and complete audit trails for compliance.",
            color: "from-red-500 to-red-600",
            bgColor: "from-red-50 to-red-100"
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Cross-Platform Access",
            description: "Work from anywhere - web dashboard for office, mobile app for field work. Perfect for CPC's multiple locations.",
            color: "from-teal-500 to-teal-600",
            bgColor: "from-teal-50 to-teal-100"
        }
    ];

    const demoScreens = {
        web: {
            title: "Web Dashboard",
            description: "Full-featured desktop experience for comprehensive invoice management",
            features: ["Advanced Analytics", "Bulk Operations", "Multi-tab Workflow", "Detailed Reports"]
        },
        mobile: {
            title: "Mobile App",
            description: "On-the-go invoice capture and approval with native mobile features",
            features: ["Camera Scanning", "Push Notifications", "Offline Mode", "Touch Optimized"]
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStat((prev) => (prev + 1) % stats.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [stats.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

            {/* Navigation */}
            <nav className="w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">SmartTrack</h1>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition">Features</a>
                        <a href="#demo" className="text-gray-700 hover:text-blue-600 font-medium transition">Demo</a>
                        <a href="#benefits" className="text-gray-700 hover:text-blue-600 font-medium transition">Benefits</a>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition"
                        >
                            Launch App
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
                        <div className="px-4 py-4 space-y-4">
                            <a href="#features" className="block text-gray-700 hover:text-blue-600 font-medium transition">Features</a>
                            <a href="#demo" className="block text-gray-700 hover:text-blue-600 font-medium transition">Demo</a>
                            <a href="#benefits" className="block text-gray-700 hover:text-blue-600 font-medium transition">Benefits</a>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition"
                            >
                                Launch App
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left */}
                    <div className="space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Smart Invoice <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">Management</span><br /> for Healthcare Excellence
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                            Transform CPC's financial operations with AI-powered invoice tracking,
                            real-time payment automation, and intelligent analytics.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition"
                            >
                                Launch SmartTrack
                            </button>
                            <button
                                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-blue-600 hover:text-blue-600 transition"
                            >
                                Watch Demo
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                            {stats.map((stat, idx) => (
                                <div
                                    key={idx}
                                    className={`text-center p-4 rounded-xl transition-all duration-500 ${idx === currentStat ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105 shadow-lg' : 'bg-white/60 text-gray-700 backdrop-blur'}`}
                                >
                                    <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                                    <div className="text-sm opacity-80">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Demo Preview */}
                    <div className="relative">
                        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-2xl border border-white/20">
                            {/* Platform Toggle */}
                            <div className="flex justify-center mb-4">
                                <button
                                    onClick={() => setActiveDemo('web')}
                                    className={`px-4 py-2 rounded-xl font-medium ${activeDemo === 'web' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    <Monitor className="w-5 h-5 inline mr-1" /> Web App
                                </button>
                                <button
                                    onClick={() => setActiveDemo('mobile')}
                                    className={`px-4 py-2 rounded-xl font-medium ${activeDemo === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    <Smartphone className="w-5 h-5 inline mr-1" /> Mobile App
                                </button>
                            </div>

                            {/* Demo Screen */}
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{demoScreens[activeDemo].title}</h3>
                            <p className="text-gray-600 mb-4">{demoScreens[activeDemo].description}</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                {demoScreens[activeDemo].features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Powerful Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Modern Healthcare</span>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className={`group p-8 rounded-3xl ${feature.bgColor} hover:shadow-2xl transition transform hover:scale-105`}>
                                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600 mb-2">{feature.description}</p>
                                <div className="flex items-center text-blue-600 font-semibold">
                                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Transform CPC's <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Financial Operations</span>
                        </h2>
                        {["Eliminate Paper-Based Delays", "Strengthen Supplier Relationships", "Reduce Operational Costs", "Ensure Regulatory Compliance"].map((b, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                                <p className="text-gray-600">{b}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { value: "90%", label: "Faster Processing", icon: <Clock className="w-8 h-8" />, color: "from-blue-500 to-blue-600" },
                            { value: "Zero", label: "Lost Documents", icon: <Shield className="w-8 h-8" />, color: "from-green-500 to-green-600" },
                            { value: "100%", label: "Audit Compliance", icon: <BarChart3 className="w-8 h-8" />, color: "from-purple-500 to-purple-600" },
                            { value: "24/7", label: "System Uptime", icon: <Globe className="w-8 h-8" />, color: "from-orange-500 to-orange-600" }
                        ].map((m, i) => (
                            <div key={i} className={`bg-white p-6 rounded-2xl shadow hover:shadow-2xl transition transform hover:scale-105 text-center`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 bg-gradient-to-r ${m.color}`}>
                                    {m.icon}
                                </div>
                                <div className="text-3xl font-bold">{m.value}</div>
                                <div className="text-gray-600 font-medium">{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative text-center text-white">
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                    Ready to Transform <br /> <span className="text-yellow-300">CPC's Future?</span>
                </h2>
                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-6">
                    <button onClick={() => navigate('/register')} className="bg-yellow-400 px-12 py-4 rounded-full font-bold text-blue-900 hover:scale-105 transition">Start Using SmartTrack</button>
                    <button onClick={() => window.location.href = '/demo'} className="border-2 border-white px-12 py-4 rounded-full hover:bg-white hover:text-blue-600 transition">Schedule Training</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">SmartTrack</h3>
                            <p className="text-gray-400 text-sm">by CPC Innovation Team</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">&copy; 2025 Centre Pasteur du Cameroun. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
};

