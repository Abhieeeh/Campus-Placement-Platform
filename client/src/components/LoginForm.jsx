import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react';

export default function LoginForm({ role, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isRecruiter = role === 'recruiter';
  const emailLabel = isRecruiter ? 'Company Email / Company ID' : 'Email Address';
  const emailPlaceholder = isRecruiter ? 'company@corp.com or COMP123' : 'student@university.com';

  function validate() {
    if (!email.trim()) return 'Please enter your ' + (isRecruiter ? 'company email or ID' : 'email');
    if (!password) return 'Please enter your password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    onLogin({ email, role });
  }



  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="login-email">{emailLabel}</label>
        <div className="input-wrapper">
          {isRecruiter
            ? <Building2 className="input-icon" size={17} />
            : <Mail className="input-icon" size={17} />
          }
          <input
            id="login-email"
            type={isRecruiter ? 'text' : 'email'}
            className={`form-input${isRecruiter ? ' recruiter-focus' : ''}`}
            placeholder={emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="login-password">Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" size={17} />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className={`form-input${isRecruiter ? ' recruiter-focus' : ''}`}
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input type="checkbox" />
          Remember me
        </label>
        <a href="#" className="forgot-link" onClick={e => e.preventDefault()}>Forgot password?</a>
      </div>

      <button
        type="submit"
        id="login-submit-btn"
        className={`submit-btn ${isRecruiter ? 'recruiter-btn' : 'student-btn'}`}
      >
        Sign In
      </button>


    </form>
  );
}
