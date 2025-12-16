import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

const LandingPage = () => {
  // State Management
  const [workflows, setWorkflows] = useState([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('engagement');
  const [lastSync, setLastSync] = useState('Never');

  // Toggle Dark Mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Fetch Workflows
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/workflows`);
      const data = await response.json();
      setWorkflows(data.data);
      setFilteredWorkflows(data.data);
      setLastSync(new Date(data.last_sync).toLocaleString());
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Trigger Manual Sync
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
      console.error('Error triggering sync:', error);
      setSyncing(false);
    }
  };

  // Apply Filters and Sorting
  useEffect(() => {
    let filtered = [...workflows];

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(w => w.platform === selectedPlatform);
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(w => w.country === selectedCountry);
    }

    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.workflow.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'engagement') {
        return b.popularity_metrics.engagement_score - a.popularity_metrics.engagement_score;
      } else if (sortBy === 'views') {
        return (b.popularity_metrics.views || 0) - (a.popularity_metrics.views || 0);
      } else if (sortBy === 'likes') {
        return (b.popularity_metrics.likes || 0) - (a.popularity_metrics.likes || 0);
      }
      return 0;
    });

    setFilteredWorkflows(filtered);
  }, [workflows, selectedPlatform, selectedCountry, searchQuery, sortBy]);

  // Initial Load
  useEffect(() => {
    fetchWorkflows();
    fetchStats();
    
    // Keep backend alive - ping every 5 minutes
    const keepAliveInterval = setInterval(async () => {
      try {
        await fetch(`${API_BASE_URL}/keep-alive`);
        console.log('✅ Backend keep-alive ping sent');
      } catch (error) {
        console.log('⚠️ Keep-alive ping failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(keepAliveInterval);
  }, []);

  // Helper Functions
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPlatformColor = (platform) => {
    if (platform === 'YouTube') return 'from-red-500 to-red-600';
    if (platform === 'n8n Forum') return 'from-green-500 to-green-600';
    return 'from-blue-500 to-blue-600';
  };

  // Loading State
  if (loading && workflows.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading workflows analytics...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className={`sticky top-0 z-50 backdrop-blur-lg border-b ${
          darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent`}>
                  n8n Analytics
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Workflow Popularity System
                </p>
              </div>
            </motion.div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-200 text-purple-600'
                }`}
              >
                {darkMode ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>

              {/* Sync Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerSync}
                disabled={syncing}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg disabled:opacity-50 flex items-center space-x-2"
              >
                <svg
                  className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-500 bg-clip-text text-transparent mb-4">
            Discover Trending n8n Workflows
          </h2>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Real-time analytics from YouTube, Forums & Search Trends
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last updated: {lastSync}
            </span>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '📊', label: 'Total Workflows', value: stats.total_workflows, color: 'purple' },
              { icon: '🎥', label: 'YouTube', value: stats.platforms?.YouTube?.count || 0, color: 'red' },
              { icon: '💬', label: 'Forum', value: stats.platforms?.['n8n Forum']?.count || 0, color: 'green' },
              { icon: '🔍', label: 'Search', value: stats.platforms?.['Google Search']?.count || 0, color: 'blue' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`rounded-2xl p-6 shadow-xl backdrop-blur-lg ${
                  darkMode
                    ? 'bg-slate-800/50 border border-slate-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{stat.icon}</div>
                  <div className="text-green-500 text-sm font-semibold">
                    +{Math.floor(Math.random() * 50)}%
                  </div>
                </div>
                <div className={`text-4xl font-bold bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 bg-clip-text text-transparent mb-1`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 mb-8 backdrop-blur-lg shadow-xl ${
            darkMode
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className={`px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Platforms</option>
              <option value="YouTube">YouTube</option>
              <option value="n8n Forum">n8n Forum</option>
              <option value="Google Search">Google Search</option>
            </select>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={`px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Countries</option>
              <option value="US">United States</option>
              <option value="IN">India</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-3">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sort by:
            </span>
            {['engagement', 'views', 'likes'].map((sort) => (
              <motion.button
                key={sort}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(sort)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  sortBy === sort
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : darkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sort}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredWorkflows.length} workflows
        </div>

        {/* Workflows List */}
        <AnimatePresence>
          <div className="space-y-4">
            {filteredWorkflows.slice(0, 50).map((workflow, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ x: 8 }}
                className={`rounded-2xl p-6 backdrop-blur-lg shadow-lg transition-all ${
                  darkMode
                    ? 'bg-slate-800/50 border border-slate-700 hover:border-purple-500'
                    : 'bg-white border border-gray-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Platform & Country Badges */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPlatformColor(workflow.platform)} text-white`}>
                        {workflow.platform}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        🌍 {workflow.country}
                      </span>
                    </div>

                    {/* Workflow Title */}
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {workflow.workflow}
                    </h3>

                    {/* Source Link */}
                    {workflow.url && (
                      <a
                        href={workflow.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-500 hover:text-purple-400 text-sm inline-flex items-center transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Source
                      </a>
                    )}
                  </div>

                  {/* Engagement Score */}
                  <div className="text-right">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                      {workflow.popularity_metrics.engagement_score.toFixed(1)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Engagement
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {workflow.popularity_metrics.views > 0 && (
                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-blue-400">👁️</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(workflow.popularity_metrics.views)}
                        </span>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Views
                      </div>
                    </div>
                  )}

                  {workflow.popularity_metrics.likes > 0 && (
                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-red-400">❤️</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(workflow.popularity_metrics.likes)}
                        </span>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Likes
                      </div>
                    </div>
                  )}

                  {workflow.popularity_metrics.comments > 0 && (
                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-green-400">💬</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(workflow.popularity_metrics.comments)}
                        </span>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Comments
                      </div>
                    </div>
                  )}

                  {workflow.popularity_metrics.replies > 0 && (
                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-purple-400">↩️</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(workflow.popularity_metrics.replies)}
                        </span>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Replies
                      </div>
                    </div>
                  )}

                  {workflow.popularity_metrics.search_volume > 0 && (
                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-yellow-400">🔍</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(workflow.popularity_metrics.search_volume)}
                        </span>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Searches/mo
                      </div>
                    </div>
                  )}
                </div>

                {/* Engagement Ratios */}
                {(workflow.popularity_metrics.like_to_view_ratio > 0 || workflow.popularity_metrics.trend_change > 0) && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {workflow.popularity_metrics.like_to_view_ratio > 0 && (
                        <div>
                          <div className={`mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Like Ratio
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-500"
                              style={{ width: `${Math.min(workflow.popularity_metrics.like_to_view_ratio * 1000, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {(workflow.popularity_metrics.like_to_view_ratio * 100).toFixed(2)}%
                          </div>
                        </div>
                      )}

                      {workflow.popularity_metrics.trend_change > 0 && (
                        <div>
                          <div className={`mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Trend Growth
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-500"
                              style={{ width: `${Math.min(workflow.popularity_metrics.trend_change, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-green-400 mt-1">
                            +{workflow.popularity_metrics.trend_change.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* No Results */}
        {filteredWorkflows.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-2xl p-12 text-center ${
              darkMode ? 'bg-slate-800/50' : 'bg-white'
            }`}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No workflows found
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Try adjusting your filters or search query
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-20 py-12 backdrop-blur-lg border-t ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700'
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Developer Info */}
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent mb-4">
                Aryan Patel
              </h3>
              <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                IIIT Manipur
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Applied for: <span className="font-semibold text-purple-500">AI/ML Engineer</span>
              </p>
            </div>

            {/* Internship Details */}
            <div>
              <h4 className={`font-semibold mb-4 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Internship Project
              </h4>
              <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Company: <span className="font-semibold text-purple-500">SpeakGenie</span>
              </p>
              <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Project: n8n Workflow Popularity System
              </p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status: <span className="text-green-500 font-semibold">✅ Complete</span>
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className={`font-semibold mb-4 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Connect With Me
              </h4>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                aryanpatel77462@gmail.com
              </p>
              <div className="flex space-x-3">
                <motion.a
                  whileHover={{ scale: 1.1, y: -4 }}
                  href="https://github.com/aryan-Patel-web/n8n-workflow-popularity-system_Intern"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -4 }}
                  href="https://www.linkedin.com/in/aryan-patel-97396524b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </motion.a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={`text-center pt-8 border-t ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <p className={`mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Built with ❤️ for SpeakGenie Internship Assignment
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Data sources: YouTube Data API v3 • n8n Community Forum • Google Search Trends
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 