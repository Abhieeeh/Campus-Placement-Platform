import React, { useState } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StudentUI from './components/StudentUI';
import RecruiterUI from './components/RecruiterUI';
import { GraduationCap, Briefcase } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('student');   // 'student' | 'recruiter'
  const [mode, setMode] = useState('login');     // 'login' | 'register'
  const [user, setUser] = useState(null);        // null = not logged in

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleRegister(userData) {
    setUser(userData);
  }

  function handleLogout() {
    setUser(null);
    setMode('login');
  }

  function handleRoleChange(newRole) {
    setRole(newRole);
  }

  const isRecruiter = role === 'recruiter';

  return (
    <>
      {user ? (
        /* Full-screen role-specific dashboard */
        user.role === 'recruiter'
          ? <RecruiterUI user={user} onLogout={handleLogout} />
          : <StudentUI user={user} onLogout={handleLogout} />
      ) : (
        /* Auth flow */
        <div className="app-container">
          <Navbar role={role} />
          <main className="main-content">
            <div className="auth-card">
              {/* Role Tabs: Student / Recruiter */}
              <div className="role-tabs" role="tablist" aria-label="Select role">
                <button
                  id="tab-student"
                  role="tab"
                  aria-selected={role === 'student'}
                  className={`role-tab ${role === 'student' ? 'active-student' : ''}`}
                  onClick={() => handleRoleChange('student')}
                >
                  <GraduationCap size={17} />
                  Student
                </button>
                <button
                  id="tab-recruiter"
                  role="tab"
                  aria-selected={role === 'recruiter'}
                  className={`role-tab ${role === 'recruiter' ? 'active-recruiter' : ''}`}
                  onClick={() => handleRoleChange('recruiter')}
                >
                  <Briefcase size={17} />
                  Recruiter
                </button>
              </div>

              {/* Card Header */}
              <div className="card-header">
                <h1 className="card-title">
                  {mode === 'login' ? 'Welcome back!' : 'Create account'}
                </h1>
                <p className="card-subtitle">
                  {mode === 'login'
                    ? `Sign in to your ${isRecruiter ? 'recruiter' : 'student'} account`
                    : `Register as a ${isRecruiter ? 'recruiter' : 'student'}`
                  }
                </p>
              </div>

              {/* Mode Toggle: Login / Register */}
              <div className="mode-toggle" role="tablist" aria-label="Auth mode">
                <button
                  id="mode-login"
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={`mode-btn ${mode === 'login' ? `active ${isRecruiter ? 'recruiter-mode' : 'student-mode'}` : ''}`}
                  onClick={() => setMode('login')}
                >
                  Sign In
                </button>
                <button
                  id="mode-register"
                  role="tab"
                  aria-selected={mode === 'register'}
                  className={`mode-btn ${mode === 'register' ? `active ${isRecruiter ? 'recruiter-mode' : 'student-mode'}` : ''}`}
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
              </div>

              {/* Form */}
              {mode === 'login'
                ? <LoginForm role={role} onLogin={handleLogin} />
                : <RegisterForm role={role} onRegister={handleRegister} />
              }

              {/* Footer switcher */}
              <div className="card-footer">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?
                    <button
                      id="switch-to-register"
                      className={`switch-link ${isRecruiter ? 'recruiter-text' : ''}`}
                      onClick={() => setMode('register')}
                    >
                      Register now
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?
                    <button
                      id="switch-to-login"
                      className={`switch-link ${isRecruiter ? 'recruiter-text' : ''}`}
                      onClick={() => setMode('login')}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
