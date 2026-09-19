import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Navbar({ role }) {
  return (
    <header className="navbar">
      <div className="brand">
        <GraduationCap className="brand-icon" size={26} />
        <span>Campus Portal</span>
      </div>
      <div className="navbar-tag">
        {role === 'student' ? 'Student Portal' : 'Recruiter Portal'}
      </div>
    </header>
  );
}
