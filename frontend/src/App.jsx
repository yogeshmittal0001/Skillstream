import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, NavLink } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './enhancements.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CoursesPage from './pages/CoursesPage'
import FavoritesPage from './pages/FavoritesPage'
import AboutPage from './pages/AboutPage'
import AdminDashboard from './pages/AdminDashboard'
import Footer from './components/Footer'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function Navbar() {
  const { token, logout } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [favCount, setFavCount] = useState(0)
  
  // Get user info from token
  const getUserInfo = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub || 'User',
        name: payload.sub?.split('@')[0] || 'User',
        role: payload.role || 'USER'
      };
    } catch {
      return { email: 'User', name: 'User', role: 'USER' };
    }
  };
  
  const userInfo = getUserInfo();
  const isAdmin = userInfo && userInfo.role === 'ADMIN';
  
  // Fetch favorites count
  useEffect(() => {
    const fetchFavCount = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/v1/favourites/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setFavCount(data.count || 0)
        }
      } catch (err) {
        console.error('Failed to fetch favorites count:', err)
      }
    }
    
    fetchFavCount()
    
    // Listen for favorites updates
    window.addEventListener('favoritesUpdated', fetchFavCount)
    return () => window.removeEventListener('favoritesUpdated', fetchFavCount)
  }, [token])
  
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
    localStorage.setItem('theme', theme)
  }, [theme])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu])
  return (
    <nav className="navbar">
      <Link className="brand" to="/">Skillstream</Link>
      <button className="mobile-menu-button" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle menu">
        <span>{mobileNavOpen ? '✖' : '☰'}</span>
      </button>
      <div className={`nav-actions ${mobileNavOpen ? 'open' : ''}`}>
        <NavLink onClick={() => setMobileNavOpen(false)} className={({isActive}) => `nav-link pill ${isActive ? 'active' : ''}`} to="/">Home</NavLink>
        {token && (
          <div style={{position: 'relative', display: 'inline-block'}}>
            <NavLink onClick={() => setMobileNavOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/favorites" style={{position: 'relative'}}>
              Favourites
              {favCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  backgroundColor: '#ff4757',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)'
                }}>
                  {favCount}
                </span>
              )}
            </NavLink>
          </div>
        )}
        {isAdmin && <NavLink onClick={() => setMobileNavOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/admin">🛠️ Admin</NavLink>}
        <NavLink onClick={() => setMobileNavOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/about">About</NavLink>
        {token ? (
          <div className="profile-menu">
            <button 
              className="profile-btn" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">{userInfo?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <span className="profile-name">{userInfo?.name || 'User'}</span>
              <span className="profile-arrow">▼</span>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-email">{userInfo?.email}</div>
                </div>
                <div className="profile-divider"></div>
                <button className="profile-menu-item" onClick={() => { logout(); setShowProfileMenu(false); }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink onClick={() => setMobileNavOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/login">Login</NavLink>
            <span style={{opacity:0.5}}>/</span>
            <Link className="btn" onClick={() => setMobileNavOpen(false)} to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <Navbar />
        <main style={{flex: 1}}>
          <Routes>
            <Route path="/" element={<CoursesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}


