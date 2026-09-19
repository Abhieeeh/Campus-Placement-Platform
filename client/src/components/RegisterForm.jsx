import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react';

export default function RegisterForm({ role, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const isRecruiter = role === 'recruiter';
  const emailLabel = isRecruiter ? 'Company Email / Company ID' : 'Email Address';
  const emailPlaceholder = isRecruiter ? 'company@corp.com or COMP123' : 'student@university.com';

  function validate() {
    if (!email.trim()) return 'Please enter your ' + (isRecruiter ? 'company email or ID' : 'email');
    if (!isRecruiter && !/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    if (!password) return 'Please enter a password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    onRegister({ email, role });
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
        <label className="form-label" htmlFor="reg-email">{emailLabel}</label>
        <div className="input-wrapper">
          {isRecruiter
            ? <Building2 className="input-icon" size={17} />
            : <Mail className="input-icon" size={17} />
          }
          <input
            id="reg-email"
            type={isRecruiter ? 'text' : 'email'}
            className={`form-input${isRecruiter ? ' recruiter-focus' : ''}`}
            placeholder={emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="reg-password">Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" size={17} />
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            className={`form-input${isRecruiter ? ' recruiter-focus' : ''}`}
            placeholder="Create a password (min. 6 chars)"
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

      <div className="form-group">
        <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" size={17} />
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            className={`form-input${isRecruiter ? ' recruiter-focus' : ''}`}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowConfirm(v => !v)}
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        id="register-submit-btn"
        className={`submit-btn ${isRecruiter ? 'recruiter-btn' : 'student-btn'}`}
      >
        Create Account
      </button>


    </form>
  );
}
