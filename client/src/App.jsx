import React, { useState } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StudentUI from './components/StudentUI';
import RecruiterUI from './components/RecruiterUI';
import StudentProfileSetup from './components/StudentProfileSetup';
import RecruiterProfileSetup from './components/RecruiterProfileSetup';
import { GraduationCap, Briefcase } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('student');   // 'student' | 'recruiter'
  const [mode, setMode] = useState('login');     // 'login' | 'register' | 'setup-student-profile' | 'setup-recruiter-profile'
  const [user, setUser] = useState(null);        // null = not logged in
  const [pendingUser, setPendingUser] = useState(null); // newly registered user awaiting profile setup
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [authNotification, setAuthNotification] = useState('');

  async function handleLogin(userData) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json().catch(() => ({}));
      console.log('Login response:', data);
    } catch (err) {
      console.error('Login network error:', err);
    }
    setUser(userData);
  }

  async function handleRegister(userData) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json().catch(() => ({}));
      console.log('Register response:', data);
    } catch (err) {
      console.error('Register network error:', err);
    }

    // Save pending registered user info
    setPendingUser(userData);
    // Redirect exclusively to the role-specific profile setup page
    if (userData.role === 'recruiter') {
      setMode('setup-recruiter-profile');
    } else {
      setMode('setup-student-profile');
    }
  }

  function handleProfileComplete({ role: completedRole, email, message }) {
    setRole(completedRole);
    setPrefilledEmail(email);
    setAuthNotification(message || 'Profile setup complete! Please sign in with your credentials.');
    setPendingUser(null);
    setMode('login');
  }

  function handleLogout() {
    setUser(null);
    setPendingUser(null);
    setPrefilledEmail('');
    setAuthNotification('');
    setMode('login');
  }

  function handleRoleChange(newRole) {
    setRole(newRole);
    setAuthNotification('');
  }

  const isRecruiter = role === 'recruiter';

  // 1. If user is logged in, show the respective dashboard
  if (user) {
    return user.role === 'recruiter'
      ? <RecruiterUI user={user} onLogout={handleLogout} />
      : <StudentUI user={user} onLogout={handleLogout} />;
  }

  // 2. If new student just registered, show Student Profile Onboarding
  if (mode === 'setup-student-profile') {
    return (
      <StudentProfileSetup
        initialUser={pendingUser}
        onComplete={handleProfileComplete}
      />
    );
  }

  // 3. If new recruiter just registered, show Recruiter Profile Onboarding
  if (mode === 'setup-recruiter-profile') {
    return (
      <RecruiterProfileSetup
        initialUser={pendingUser}
        onComplete={handleProfileComplete}
      />
    );
  }

  // 4. Default Auth Flow (Login & Register)
  return (
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
              onClick={() => { setMode('login'); setAuthNotification(''); }}
            >
              Sign In
            </button>
            <button
              id="mode-register"
              role="tab"
              aria-selected={mode === 'register'}
              className={`mode-btn ${mode === 'register' ? `active ${isRecruiter ? 'recruiter-mode' : 'student-mode'}` : ''}`}
              onClick={() => { setMode('register'); setAuthNotification(''); }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <LoginForm
              role={role}
              onLogin={handleLogin}
              initialEmail={prefilledEmail}
              successMessage={authNotification}
            />
          ) : (
            <RegisterForm
              role={role}
              onRegister={handleRegister}
            />
          )}

          {/* Footer switcher */}
          <div className="card-footer">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?
                <button
                  id="switch-to-register"
                  className={`switch-link ${isRecruiter ? 'recruiter-text' : ''}`}
                  onClick={() => { setMode('register'); setAuthNotification(''); }}
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
                  onClick={() => { setMode('login'); setAuthNotification(''); }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

