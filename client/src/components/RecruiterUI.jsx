import React from 'react';

// Recruiter Dashboard — to be implemented
export default function RecruiterUI({ user, onLogout }) {
    return (
        <div>
            <h1>{user.role} Dashboard</h1>
            <button onClick={onLogout}>Logout</button>
        </div>
    );
}
