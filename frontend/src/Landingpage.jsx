import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000'
  : 'https://speakgenie-n8n-backend.onrender.com';

// Platform Images
const PLATFORM_IMAGES = {
  youtube: 'https://images.unsplash.com/photo-1642726197634-2a21f764220a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8eW91dHViZSUyMGxvZ298ZW58MHx8MHx8fDA%3D',
  github: 'https://tse3.mm.bing.net/th/id/OIP.Lwbgu4eSpSz4gKe-F_k58gHaHa?pid=Api&P=0&h=180',
  search: 'https://static.vecteezy.com/system/resources/previews/007/873/330/original/magnifying-glass-icon-logo-illustration-suitable-for-web-design-logo-application-free-vector.jpg',
  forum: 'https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_c4f3e03d3fd3e972488f9a3a4d1c2d24/n8n.png'
};

const LandingPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('engagement');
  const [lastSync, setLastSync] = useState('Never');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [darkMode]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/workflows`);
      const data = await response.json();
      setWorkflows(data.data);
      setFilteredWorkflows(data.data);
      setLastSync(new Date(data.last_sync).toLocaleString());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const triggerSync = async () => {
    try {
      setSyncing(true);
      await fetch(`${API_BASE_URL}/api/sync`, { method: 'POST' });
      setTimeout(() => {
        fetchWorkflows();
        fetchStats();
        setSyncing(false);
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      setSyncing(false);
    }
  };

  const exportWorkflows = async (format) => {
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const response = await fetch(`${API_BASE_URL}/api/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `n8n_workflows_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
      setExporting(false);
    }
  };

  useEffect(() => {
    let filtered = [...workflows];
    if (selectedPlatform !== 'all') filtered = filtered.filter(w => w.platform === selectedPlatform);
    if (selectedCountry !== 'all') filtered = filtered.filter(w => w.country === selectedCountry);
    if (searchQuery) filtered = filtered.filter(w => w.workflow.toLowerCase().includes(searchQuery.toLowerCase()));
    
    filtered.sort((a, b) => {
      if (sortBy === 'engagement') return b.popularity_metrics.engagement_score - a.popularity_metrics.engagement_score;
      if (sortBy === 'views') return (b.popularity_metrics.views || 0) - (a.popularity_metrics.views || 0);
      if (sortBy === 'likes') return (b.popularity_metrics.likes || 0) - (a.popularity_metrics.likes || 0);
      return 0;
    });
    
    setFilteredWorkflows(filtered);
  }, [workflows, selectedPlatform, selectedCountry, searchQuery, sortBy]);

  useEffect(() => {
    fetchWorkflows();
    fetchStats();
    const keepAliveInterval = setInterval(async () => {
      try { await fetch(`${API_BASE_URL}/keep-alive`); } catch (error) {}
    }, 5 * 60 * 1000);
    return () => clearInterval(keepAliveInterval);
  }, []);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPlatformColor = (platform) => {
    if (platform === 'YouTube') return 'from-red-600 to-red-700';
    if (platform === 'n8n Forum') return 'from-green-600 to-green-700';
    if (platform === 'GitHub') return 'from-purple-600 to-purple-700';
    return 'from-blue-600 to-blue-700';
  };

  const getPlatformIcon = (platform) => {
    if (platform === 'YouTube') return '🎥';
    if (platform === 'n8n Forum') return '💬';
    if (platform === 'GitHub') return '🐙';
    return '🔍';
  };

  const getPlatformImage = (platform) => {
    if (platform === 'YouTube') return PLATFORM_IMAGES.youtube;
    if (platform === 'n8n Forum') return PLATFORM_IMAGES.forum;
    if (platform === 'GitHub') return PLATFORM_IMAGES.github;
    return PLATFORM_IMAGES.search;
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjViZjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAtOHYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10 px-4"
        >
          <motion.div 
            className="w-16 h-16 md:w-20 md:h-20 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-xl md:text-2xl text-white font-semibold"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading workflows...
          </motion.p>
          <motion.div
            className="mt-4 flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-purple-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-purple-50 to-gray-50'}`}>
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjViZjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAtOHYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>

      {/* Cursor Follow Effect - Hidden on mobile */}
      <motion.div
        className="hidden md:block fixed w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Export Success Toast */}
      <AnimatePresence>
        {exportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 right-4 md:top-6 md:right-6 z-50 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-3 md:px-8 md:py-4 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-lg max-w-xs md:max-w-md"
          >
            <motion.span 
              className="text-2xl md:text-3xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
            >
              ✅
            </motion.span>
            <div>
              <p className="font-bold text-base md:text-lg">Export Successful!</p>
              <p className="text-xs md:text-sm opacity-90">File downloaded</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
          darkMode 
            ? 'bg-slate-950/90 border-purple-500/20 shadow-lg shadow-purple-500/10' 
            : 'bg-white/80 border-purple-200 shadow-lg shadow-purple-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-5">
          <div className="flex items-center justify-between">
            {/* Animated Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 md:space-x-4 cursor-pointer group"
            >
              <motion.div 
                className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 p-2 md:p-4 rounded-xl md:rounded-2xl shadow-2xl relative overflow-hidden group-hover:shadow-purple-500/50 transition-all duration-300"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <svg className="w-5 h-5 md:w-8 md:h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-lg md:text-3xl font-black bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  n8n Analytics Pro
                </motion.h1>
                <motion.p 
                  className={`text-xs md:text-sm font-medium hidden sm:block ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  4 Sources • 50+ Workflows • Real-time
                </motion.p>
              </div>
            </motion.div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-400 shadow-lg shadow-slate-900/50' 
                    : 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 shadow-lg shadow-purple-200/50'
                }`}
              >
                <motion.div
                  animate={{ rotate: darkMode ? 0 : 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {darkMode ? '☀️' : '🌙'}
                </motion.div>
              </motion.button>

              {/* Export Button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="bg-gradient-to-r from-green-600 via-emerald-700 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl disabled:opacity-50 flex items-center space-x-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="relative z-10">{exporting ? 'Exporting...' : 'Export'}</span>
                </motion.button>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl overflow-hidden ${
                        darkMode ? 'bg-slate-900 border border-purple-500/30' : 'bg-white border border-purple-200'
                      }`}
                    >
                      <motion.button
                        whileHover={{ x: 5, backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }}
                        onClick={() => exportWorkflows('json')}
                        className={`w-full text-left px-5 py-4 flex items-center space-x-3 transition-colors ${
                          darkMode ? 'text-white hover:bg-slate-800' : 'text-gray-900 hover:bg-purple-50'
                        }`}
                      >
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="font-semibold">Export as JSON</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Structured data</p>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 5, backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }}
                        onClick={() => exportWorkflows('txt')}
                        className={`w-full text-left px-5 py-4 flex items-center space-x-3 transition-colors ${
                          darkMode ? 'text-white hover:bg-slate-800' : 'text-gray-900 hover:bg-purple-50'
                        }`}
                      >
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="font-semibold">Export as TXT</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Human-readable</p>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sync Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerSync}
                disabled={syncing}
                className="bg-gradient-to-r from-purple-600 via-indigo-700 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl disabled:opacity-50 flex items-center space-x-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <motion.svg 
                  className="w-5 h-5 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: syncing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: syncing ? Infinity : 0, ease: "linear" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </motion.svg>
                <span className="relative z-10">{syncing ? 'Syncing...' : 'Sync'}</span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 space-y-3 overflow-hidden"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-full p-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-400' 
                      : 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600'
                  }`}
                >
                  <span>{darkMode ? '☀️' : '🌙'}</span>
                  <span className="font-bold">Toggle Theme</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowExportMenu(!showExportMenu);
                    setMobileMenuOpen(false);
                  }}
                  disabled={exporting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerSync();
                    setMobileMenuOpen(false);
                  }}
                  disabled={syncing}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: syncing ? 360 : 0 }}
                    transition={{ duration: 1, repeat: syncing ? Infinity : 0, ease: "linear" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </motion.svg>
                  <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-20"
        >
          <motion.h2 
            className="text-4xl md:text-7xl font-black mb-4 md:mb-6 relative inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              Discover Trending
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
              n8n Workflows
            </span>
          </motion.h2>
          
          <motion.p 
            className={`text-base md:text-2xl mb-6 md:mb-8 px-4 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Real-time analytics from <span className="font-bold text-red-400">YouTube</span>, 
            <span className="font-bold text-green-400"> Forums</span>, 
            <span className="font-bold text-blue-400"> Search</span> & 
            <span className="font-bold text-purple-400"> GitHub</span>
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center space-x-2 md:space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"
              animate={{ 
                scale: [1, 1.3, 1],
                boxShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 40px rgba(34, 197, 94, 0.8)',
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className={`text-sm md:text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Live • Last updated: {lastSync}
            </span>
          </motion.div>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-12 md:mb-16">
            {[
              { icon: '📊', label: 'Total Workflows', value: stats.total_workflows, color: 'purple', gradient: 'from-purple-600 to-indigo-700', image: null },
              { icon: '🎥', label: 'YouTube', value: stats.platforms?.YouTube?.count || 0, color: 'red', gradient: 'from-red-600 to-rose-700', image: PLATFORM_IMAGES.youtube },
              { icon: '💬', label: 'Forum', value: stats.platforms?.['n8n Forum']?.count || 0, color: 'green', gradient: 'from-green-600 to-emerald-700', image: PLATFORM_IMAGES.forum },
              { icon: '🔍', label: 'Search', value: stats.platforms?.['Google Search']?.count || 0, color: 'blue', gradient: 'from-blue-600 to-cyan-700', image: PLATFORM_IMAGES.search },
              { icon: '🐙', label: 'GitHub', value: stats.platforms?.GitHub?.count || 0, color: 'purple', gradient: 'from-purple-600 to-violet-700', image: PLATFORM_IMAGES.github },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.03 }}
                className={`rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-xl border relative overflow-hidden group ${
                  darkMode 
                    ? 'bg-gradient-to-br from-slate-900/70 to-slate-950/70 border-purple-500/20' 
                    : 'bg-white/80 border-purple-200'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
                  {stat.image ? (
                    <motion.div
                      className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-lg"
                      animate={{ 
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        delay: index * 0.3 
                      }}
                    >
                      <img 
                        src={stat.image} 
                        alt={stat.label}
                        className="w-full h-full object-cover"
                        style={{
                          filter: darkMode ? 'brightness(0.9) contrast(1.1)' : 'brightness(1) contrast(1)'
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-3xl md:text-5xl"
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        delay: index * 0.3 
                      }}
                    >
                      {stat.icon}
                    </motion.div>
                  )}
                  <motion.div
                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                      darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
                  >
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      LIVE
                    </motion.span>
                  </motion.div>
                </div>
                
                <motion.div 
                  className={`text-3xl md:text-5xl font-black mb-1 md:mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
                
                <div className={`text-xs md:text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
                
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  style={{ transformOrigin: 'left' }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl md:rounded-3xl p-4 md:p-8 mb-8 md:mb-12 shadow-2xl backdrop-blur-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-900/70 to-slate-950/70 border-purple-500/20' 
              : 'bg-white/80 border-purple-200'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="md:col-span-2 relative group">
              <motion.svg 
                className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-purple-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </motion.svg>
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 focus:outline-none focus:border-purple-500 transition-all duration-300 font-medium text-sm md:text-base ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-600 text-white placeholder-gray-400' 
                    : 'bg-white border-purple-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 focus:outline-none focus:border-purple-500 transition-all duration-300 font-medium cursor-pointer text-sm md:text-base ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-600 text-white' 
                  : 'bg-white border-purple-200 text-gray-900'
              }`}
            >
              <option value="all">All Platforms</option>
              <option value="YouTube">YouTube</option>
              <option value="n8n Forum">Forum</option>
              <option value="Google Search">Search</option>
              <option value="GitHub">GitHub</option>
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 focus:outline-none focus:border-purple-500 transition-all duration-300 font-medium cursor-pointer text-sm md:text-base ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-600 text-white' 
                  : 'bg-white border-purple-200 text-gray-900'
              }`}
            >
              <option value="all">All Countries</option>
              <option value="US">🇺🇸 United States</option>
              <option value="IN">🇮🇳 India</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className={`text-xs md:text-sm font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              Sort by:
            </span>
            {['engagement', 'views', 'likes'].map((sort) => (
              <motion.button
                key={sort}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(sort)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold capitalize transition-all duration-300 ${
                  sortBy === sort
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/50'
                    : darkMode 
                    ? 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {sort}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          className={`mb-4 md:mb-6 flex items-center space-x-2 md:space-x-3 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-sm md:text-lg font-semibold">Showing {filteredWorkflows.length} workflows</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`w-2 h-2 rounded-full ${darkMode ? 'bg-purple-400' : 'bg-purple-600'}`}
          />
        </motion.div>

        {/* Enhanced Workflows List */}
        <div className="space-y-4 md:space-y-6">
          {filteredWorkflows.slice(0, 50).map((workflow, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.5 }}
              whileHover={{ x: 10, scale: 1.01 }}
              className={`rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl backdrop-blur-xl border transition-all duration-300 group ${
                darkMode 
                  ? 'bg-gradient-to-br from-slate-900/70 to-slate-950/70 border-slate-700 hover:border-purple-500/50 hover:shadow-purple-500/20' 
                  : 'bg-white/90 border-purple-200 hover:border-purple-400 hover:shadow-purple-300/50'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start justify-between mb-4 md:mb-6">
                <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold bg-gradient-to-r ${getPlatformColor(workflow.platform)} text-white shadow-lg flex items-center space-x-2`}
                    >
                      {getPlatformImage(workflow.platform) && (
                        <img 
                          src={getPlatformImage(workflow.platform)} 
                          alt={workflow.platform}
                          className="w-4 h-4 md:w-5 md:h-5 rounded object-cover"
                        />
                      )}
                      <span>{workflow.platform}</span>
                    </motion.div>
                    <span className={`text-sm md:text-base font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      🌍 {workflow.country}
                    </span>
                  </div>

                  <h3 className={`text-lg md:text-2xl font-bold mb-2 md:mb-3 group-hover:text-purple-500 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {workflow.workflow}
                  </h3>

                  {workflow.url && (
                    <motion.a
                      whileHover={{ x: 5 }}
                      href={workflow.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-400 text-sm md:text-base font-semibold inline-flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="hidden md:inline">View Source</span>
                      <span className="md:hidden">View</span>
                    </motion.a>
                  )}
                </div>

                <motion.div 
                  className="text-center md:text-right w-full md:w-auto"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="text-4xl md:text-5xl font-black bg-gradient-to-br from-purple-300 via-indigo-400 to-purple-500 bg-clip-text text-transparent"
                    style={{
                      WebkitTextStroke: darkMode ? '1px rgba(139, 92, 246, 0.3)' : '0.5px rgba(139, 92, 246, 0.2)'
                    }}
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {workflow.popularity_metrics.engagement_score.toFixed(1)}
                  </motion.div>
                  <div className={`text-xs md:text-sm font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Engagement Score
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {workflow.popularity_metrics.views > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`rounded-xl md:rounded-2xl p-3 md:p-4 ${darkMode ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl md:text-3xl">👁️</span>
                      <span className={`text-xl md:text-2xl font-black ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {formatNumber(workflow.popularity_metrics.views)}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Views</div>
                  </motion.div>
                )}

                {workflow.popularity_metrics.likes > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`rounded-xl md:rounded-2xl p-3 md:p-4 ${darkMode ? 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30' : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl md:text-3xl">❤️</span>
                      <span className={`text-xl md:text-2xl font-black ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                        {formatNumber(workflow.popularity_metrics.likes)}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>Likes</div>
                  </motion.div>
                )}

                {workflow.popularity_metrics.comments > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`rounded-xl md:rounded-2xl p-3 md:p-4 ${darkMode ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl md:text-3xl">💬</span>
                      <span className={`text-xl md:text-2xl font-black ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        {formatNumber(workflow.popularity_metrics.comments)}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Comments</div>
                  </motion.div>
                )}

                {workflow.popularity_metrics.search_volume > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`rounded-xl md:rounded-2xl p-3 md:p-4 ${darkMode ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl md:text-3xl">🔍</span>
                      <span className={`text-xl md:text-2xl font-black ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        {formatNumber(workflow.popularity_metrics.search_volume)}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Searches/mo</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredWorkflows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl md:rounded-3xl p-8 md:p-16 text-center shadow-2xl ${
              darkMode ? 'bg-slate-900/70' : 'bg-white'
            }`}
          >
            <motion.div 
              className="text-6xl md:text-8xl mb-4 md:mb-6"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔍
            </motion.div>
            <h3 className={`text-2xl md:text-3xl font-bold mb-3 md:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No workflows found
            </h3>
            <p className={`text-base md:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or search query
            </p>
          </motion.div>
        )}
      </main>

      {/* Premium Footer */}
      <footer className={`mt-16 md:mt-32 py-12 md:py-16 backdrop-blur-xl border-t relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-950/90 to-slate-900/90 border-purple-500/20' 
          : 'bg-gradient-to-br from-white/80 to-purple-50/80 border-purple-200'
      }`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjViZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAtOHYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Developer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-3 md:space-y-4 text-center md:text-left"
            >
              <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
                Aryan Patel
              </h3>
              <p className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🎓 IIIT Manipur
              </p>
              <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Project: n8n Workflow Popularity System
              </p>
              <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status: <span className="text-green-500 font-bold">✅ Complete</span>
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-3 md:space-y-4 text-center md:text-left"
            >
              <h4 className={`text-lg md:text-xl font-black mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Connect With Me
              </h4>
              <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center justify-center md:justify-start space-x-2 md:space-x-3`}>
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="break-all">aryanpatel77462@gmail.com</span>
              </p>
              <div className="flex justify-center md:justify-start space-x-4 pt-4">
                <motion.a
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://github.com/aryan-Patel-web/n8n-workflow-popularity-system_Intern"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg ${
                    darkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-purple-500/50' 
                      : 'bg-white hover:bg-purple-50 text-gray-900 hover:shadow-purple-300/50'
                  }`}
                >
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.linkedin.com/in/aryan-patel-97396524b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg ${
                    darkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-purple-500/50' 
                      : 'bg-white hover:bg-purple-50 text-gray-900 hover:shadow-purple-300/50'
                  }`}
                >
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div 
            className={`text-center pt-6 md:pt-8 border-t ${
              darkMode ? 'border-purple-500/20' : 'border-purple-200'
            }`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className={`text-base md:text-lg font-semibold mb-2 md:mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Built with ❤️ for SpeakGenie Internship Assignment
            </p>
            <p className={`text-sm md:text-base font-medium px-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              Data sources: YouTube Data API v3 • n8n Community Forum • Google Search Trends • GitHub
            </p>
            <motion.p 
              className={`text-xs md:text-sm mt-3 md:mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              © 2024 Aryan Patel • All Rights Reserved
            </motion.p>
          </motion.div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        /* Responsive Typography */
        @media (max-width: 640px) {
          html {
            font-size: 14px;
          }
        }
        
        /* Smooth Scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#0f172a' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #6366f1);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #4f46e5);
        }
      `}</style>
    </div>
  );
};

export default LandingPage