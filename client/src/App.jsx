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

function nameFromEmail(email = '') {
  return email
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function App() {
  const [role, setRole] = useState('student');
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null); 
  const [error, setError] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
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
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);

        window.dispatchEvent(new Event('student_profile_updated'));
        window.dispatchEvent(new Event('recruiter_profile_updated'));

        setError(null);
        setUser(data.user);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
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
      const data = await response.json();
      if (response.status === 201) {
        localStorage.setItem('authToken', data.token);

        setError(null);
        setPendingUser(userData);
        if (userData.role === 'recruiter') {
          setMode('setup-recruiter-profile');
        } else {
          setMode('setup-student-profile');
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  }

  function handleProfileComplete({ role: completedRole, email }) {
    setUser({ email, role: completedRole });
    setPendingUser(null);
    setError(null);
    setAuthNotification('');
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    window.dispatchEvent(new Event('student_profile_updated'));
    window.dispatchEvent(new Event('recruiter_profile_updated'));

    setUser(null);
    setPendingUser(null);
    setPrefilledEmail('');
    setAuthNotification('');
    setError(null);
    setMode('login');
  }

  function handleRoleChange(newRole) {
    setRole(newRole);
    setError(null);
    setAuthNotification('');
  }

  const isRecruiter = role === 'recruiter';

  if (user) {
    return user.role === 'recruiter'
      ? <RecruiterUI user={user} onLogout={handleLogout} />
      : <StudentUI user={user} onLogout={handleLogout} />;
  }

  if (mode === 'setup-student-profile') {
    return (
      <StudentProfileSetup
        initialUser={pendingUser}
        onComplete={handleProfileComplete}
      />
    );
  }

  if (mode === 'setup-recruiter-profile') {
    return (
      <RecruiterProfileSetup
        initialUser={pendingUser}
        onComplete={handleProfileComplete}
      />
    );
  }

  return (
    <div className="app-container">
      <Navbar role={role} />
      <main className="main-content">
        <div className="auth-card">
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

          <div className="mode-toggle" role="tablist" aria-label="Auth mode">
            <button
              id="mode-login"
              role="tab"
              aria-selected={mode === 'login'}
              className={`mode-btn ${mode === 'login' ? `active ${isRecruiter ? 'recruiter-mode' : 'student-mode'}` : ''}`}
              onClick={() => { setMode('login'); setError(null); setAuthNotification(''); }}
            >
              Sign In
            </button>
            <button
              id="mode-register"
              role="tab"
              aria-selected={mode === 'register'}
              className={`mode-btn ${mode === 'register' ? `active ${isRecruiter ? 'recruiter-mode' : 'student-mode'}` : ''}`}
              onClick={() => { setMode('register'); setError(null); setAuthNotification(''); }}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <LoginForm
              role={role}
              onLogin={handleLogin}
              initialEmail={prefilledEmail}
              successMessage={authNotification}
              serverError={error}
            />
          ) : (
            <RegisterForm
              role={role}
              onRegister={handleRegister}
              serverError={error}
            />
          )}

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
                  onClick={() => { setMode('login'); setError(null); setAuthNotification(''); }}
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
