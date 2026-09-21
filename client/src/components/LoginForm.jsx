import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Building2, CheckCircle } from 'lucide-react';

export default function LoginForm({ role, onLogin, initialEmail = '', successMessage = '', serverError = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(successMessage);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (successMessage) setSuccess(successMessage);
  }, [successMessage]);

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
    onLogin({ email, role, password });
  }



  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {success && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontSize: '0.86rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <CheckCircle size={17} style={{ flexShrink: 0, color: '#059669' }} />
          <span>{success}</span>
        </div>
      )}

      {(serverError || error) && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{serverError || error}</span>
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
