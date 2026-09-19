/**
 * Placement Platform Unified Data & API Service
 * 
 * Ready for backend REST API integration with automatic fallback to persistent database storage.
 * All components (Dashboard, Jobs, Applications, Interviews, Notifications) communicate through this service.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Initial seed data used if database/storage is uninitialized
const INITIAL_DB_JOBS = [
    {
        id: 'job-1',
        role: 'Software Development Engineer (SDE-1)',
        company: 'Google',
        color: 'linear-gradient(135deg, #4285F4, #34A853)',
        location: 'Bangalore / Hyderabad',
        type: 'Full-time',
        salary: '₹28 - ₹34 LPA',
        deadline: '25 Sep 2026',
        postedDate: '2 days ago',
        description: 'Join Google core engineering team to design, test, deploy and maintain scalable software solutions.',
        responsibilities: [
            'Design, develop, test, deploy, maintain and enhance software solutions.',
            'Collaborate with product managers, UX designers, and fellow engineers.',
            'Optimize system performance, scalability, and security across distributed cloud environments.'
        ],
        qualifications: [
            'B.Tech/B.E. in Computer Science, IT, or related technical field.',
            'Strong foundation in Data Structures, Algorithms, and System Design.',
            'Proficiency in Java, C++, Python, or Go.'
        ],
        skills: ['Data Structures', 'Java', 'Python', 'System Design', 'Cloud Computing'],
        criteria: {
            minCgpa: 7.5,
            eligibleBranches: ['CSE', 'IT', 'ECE', 'AI/DS'],
            maxBacklogs: 0,
            graduationYear: '2027'
        }
    },
    {
        id: 'job-2',
        role: 'Frontend Engineering Intern',
        company: 'Microsoft',
        color: 'linear-gradient(135deg, #00A4EF, #7FBA00)',
        location: 'Hyderabad, India (Hybrid)',
        type: 'Internship',
        salary: '₹85,000 / month',
        deadline: '28 Sep 2026',
        postedDate: '1 day ago',
        description: 'Build responsive, accessible, and high-performance user interfaces for Microsoft 365 and Azure Developer Tools.',
        responsibilities: [
            'Develop interactive UI components using React, TypeScript, and modern CSS.',
            'Collaborate with UX researchers and design systems architects.'
        ],
        qualifications: [
            'Pursuing B.Tech/M.Tech in CS/IT/ECE or related branches.',
            'Proficiency in HTML5, CSS3, Modern JavaScript (ES6+), and React.'
        ],
        skills: ['React', 'TypeScript', 'CSS/SCSS', 'JavaScript', 'Git'],
        criteria: {
            minCgpa: 7.0,
            eligibleBranches: ['CSE', 'IT', 'ECE', 'AI/DS', 'EE'],
            maxBacklogs: 0,
            graduationYear: '2027'
        }
    },
    {
        id: 'job-3',
        role: 'Associate Product Manager',
        company: 'Atlassian',
        color: 'linear-gradient(135deg, #0052CC, #2684FF)',
        location: 'Bengaluru (Remote Friendly)',
        type: 'Full-time',
        salary: '₹22 - ₹26 LPA',
        deadline: '30 Sep 2026',
        postedDate: '3 days ago',
        description: 'Work cross-functionally with engineering, design, and analytics teams to shape collaboration tools.',
        responsibilities: [
            'Conduct user interviews, analyze feedback, and define product requirements.',
            'Define feature roadmaps and prioritize sprint backlogs.'
        ],
        qualifications: [
            'Bachelor or Master in any discipline with strong passion for tech products.',
            'Excellent problem-solving, communication, and leadership capabilities.'
        ],
        skills: ['Product Strategy', 'UI/UX Wireframing', 'Agile/Scrum', 'Data Analytics'],
        criteria: {
            minCgpa: 6.5,
            eligibleBranches: ['All Branches'],
            maxBacklogs: 0,
            graduationYear: '2027'
        }
    },
    {
        id: 'job-4',
        role: 'Backend Developer (Go / Node.js)',
        company: 'Amazon',
        color: 'linear-gradient(135deg, #FF9900, #146EB4)',
        location: 'Chennai / Hyderabad',
        type: 'Full-time',
        salary: '₹24 - ₹30 LPA',
        deadline: '02 Oct 2026',
        postedDate: 'Just now',
        description: 'Design and operate microservices powering Amazon logistics and distributed inventory workflows.',
        responsibilities: [
            'Build resilient microservices handling thousands of requests per second.',
            'Implement high-performance caching and NoSQL databases.'
        ],
        qualifications: [
            'B.Tech/B.E. in Computer Science or Information Technology.',
            'Experience building backend servers with Node.js, Go, or Java.'
        ],
        skills: ['Node.js', 'Go', 'AWS DynamoDB', 'Docker', 'REST APIs'],
        criteria: {
            minCgpa: 7.2,
            eligibleBranches: ['CSE', 'IT', 'AI/DS'],
            maxBacklogs: 0,
            graduationYear: '2027'
        }
    },
    {
        id: 'job-5',
        role: 'AI / Machine Learning Intern',
        company: 'NVIDIA',
        color: 'linear-gradient(135deg, #76B900, #1A1A1A)',
        location: 'Pune / Bengaluru',
        type: 'Internship',
        salary: '₹90,000 / month',
        deadline: '05 Oct 2026',
        postedDate: '4 days ago',
        description: 'Explore neural network optimizations and model acceleration on GPU architectures and CUDA.',
        responsibilities: [
            'Train, fine-tune, and evaluate deep learning models for Computer Vision and NLP.',
            'Benchmark CUDA and TensorRT inference speed across various architectures.'
        ],
        qualifications: [
            'Pursuing B.Tech/M.Tech with focus on ML/Deep Learning.',
            'Solid proficiency with Python, PyTorch/TensorFlow, and NumPy.'
        ],
        skills: ['Python', 'PyTorch', 'TensorRT', 'Computer Vision', 'CUDA'],
        criteria: {
            minCgpa: 8.0,
            eligibleBranches: ['CSE', 'AI/DS', 'ECE'],
            maxBacklogs: 0,
            graduationYear: '2027'
        }
    }
];

const INITIAL_DB_APPLICATIONS = [
    {
        id: 'APP-1001',
        jobId: 'job-1',
        role: 'Software Development Engineer (SDE-1)',
        company: 'Google',
        color: 'linear-gradient(135deg, #4285F4, #34A853)',
        location: 'Bangalore / Hyderabad',
        type: 'Full-time',
        salary: '₹28 - ₹34 LPA',
        appliedDate: '15 Sep 2026',
        appliedTimestamp: Date.now() - 4 * 24 * 3600 * 1000,
        status: 'Interview',
        resumeName: 'Abhishek_K_Resume.pdf',
        isSaved: false,
        stage: 4
    },
    {
        id: 'APP-1002',
        jobId: 'job-2',
        role: 'Frontend Engineering Intern',
        company: 'Microsoft',
        color: 'linear-gradient(135deg, #00A4EF, #7FBA00)',
        location: 'Hyderabad (Hybrid)',
        type: 'Internship',
        salary: '₹85,000 / month',
        appliedDate: '12 Sep 2026',
        appliedTimestamp: Date.now() - 7 * 24 * 3600 * 1000,
        status: 'Shortlisted',
        resumeName: 'Abhishek_K_Resume.pdf',
        isSaved: true,
        stage: 2
    },
    {
        id: 'APP-1003',
        jobId: 'job-3',
        role: 'Associate Product Manager',
        company: 'Atlassian',
        color: 'linear-gradient(135deg, #0052CC, #2684FF)',
        location: 'Bengaluru (Remote)',
        type: 'Full-time',
        salary: '₹22 - ₹26 LPA',
        appliedDate: '08 Sep 2026',
        appliedTimestamp: Date.now() - 11 * 24 * 3600 * 1000,
        status: 'Offered',
        resumeName: 'Abhishek_K_Resume.pdf',
        isSaved: false,
        stage: 5
    }
];

const INITIAL_DB_INTERVIEWS = [
    {
        id: 'INT-201',
        jobId: 'job-1',
        role: 'Software Development Engineer (SDE-1)',
        company: 'Google',
        color: 'linear-gradient(135deg, #4285F4, #34A853)',
        location: 'Bangalore / Hyderabad',
        salary: '₹28 - ₹34 LPA',
        status: 'upcoming', // 'upcoming' | 'completed'
        round: 'Technical Round 2: System Design & Algorithms',
        date: '2026-09-24', // ISO format for easy date picker filtering
        displayDate: '24 Sep 2026',
        time: '02:30 PM - 03:45 PM IST',
        duration: '75 mins',
        platform: 'Google Meet',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        interviewer: 'Sundar / Staff Software Engineer',
        instructions: 'Please be ready with a working IDE, quiet room, and high-speed internet. Live coding will be conducted in C++, Java, or Python.',
        topics: ['Distributed Caching', 'Binary Trees & Graphs', 'Time & Space Complexity Optimization']
    },
    {
        id: 'INT-202',
        jobId: 'job-2',
        role: 'Frontend Engineering Intern',
        company: 'Microsoft',
        color: 'linear-gradient(135deg, #00A4EF, #7FBA00)',
        location: 'Hyderabad (Hybrid)',
        salary: '₹85,000 / month',
        status: 'upcoming',
        round: 'Technical Round 1: React & JavaScript Fundamentals',
        date: '2026-09-28',
        displayDate: '28 Sep 2026',
        time: '11:00 AM - 12:00 PM IST',
        duration: '60 mins',
        platform: 'Microsoft Teams',
        meetLink: 'https://teams.microsoft.com/l/meetup-join/sample',
        interviewer: 'Priya Sharma / Senior Frontend Architect',
        instructions: 'Focus on React hooks, state management, asynchronous JavaScript, and DOM performance optimization.',
        topics: ['React Virtual DOM', 'Custom Hooks', 'CSS Layouts', 'REST API Integration']
    },
    {
        id: 'INT-203',
        jobId: 'job-3',
        role: 'Associate Product Manager',
        company: 'Atlassian',
        color: 'linear-gradient(135deg, #0052CC, #2684FF)',
        location: 'Bengaluru (Remote)',
        salary: '₹22 - ₹26 LPA',
        status: 'completed',
        round: 'Executive & Culture Fit Round',
        date: '2026-09-17',
        displayDate: '17 Sep 2026',
        time: '04:00 PM - 05:00 PM IST',
        duration: '60 mins',
        platform: 'Zoom Video',
        interviewer: 'Mike Cannon / Head of APM Program',
        result: 'Selected & Offer Extended',
        score: '9.4 / 10',
        feedback: 'Outstanding product intuition, articulate communication, and structured root-cause analysis during the Jira collaboration case study.',
        strengths: ['User Empathy', 'Metric Prioritization', 'Conflict Resolution']
    },
    {
        id: 'INT-204',
        jobId: 'job-6',
        role: 'Data Analyst & BI Specialist',
        company: 'Flipkart',
        color: 'linear-gradient(135deg, #2874F0, #FFE11B)',
        location: 'Bengaluru, India',
        salary: '₹14 - ₹18 LPA',
        status: 'completed',
        round: 'Technical SQL & Case Assessment',
        date: '2026-09-10',
        displayDate: '10 Sep 2026',
        time: '03:00 PM - 04:00 PM IST',
        duration: '60 mins',
        platform: 'Google Meet',
        interviewer: 'Ananya Roy / Principal Analytics Lead',
        result: 'Cleared & Recommended for Final HR',
        score: '8.8 / 10',
        feedback: 'Strong SQL query optimization and clear visualization suggestions. Well prepared with cohort retention analysis concepts.',
        strengths: ['Advanced SQL', 'Data Storytelling', 'Quick Problem Solving']
    },
    {
        id: 'INT-205',
        jobId: 'job-4',
        role: 'Backend Developer',
        company: 'Amazon',
        color: 'linear-gradient(135deg, #FF9900, #146EB4)',
        location: 'Chennai / Hyderabad',
        salary: '₹24 - ₹30 LPA',
        status: 'completed',
        round: 'Online Technical Round 1',
        date: '2026-09-05',
        displayDate: '05 Sep 2026',
        time: '10:00 AM - 11:15 AM IST',
        duration: '75 mins',
        platform: 'Amazon Chime',
        interviewer: 'Rahul Verma / SDE-3',
        result: 'Not Cleared',
        score: '6.5 / 10',
        feedback: 'Demonstrated good OOP knowledge, but struggled with concurrent threading and dynamic programming edge cases.',
        strengths: ['REST APIs', 'Database Schema Design']
    }
];

export const placementService = {
    // ── Jobs ─────────────────────────────────────────────────────────────
    async getJobs() {
        try {
            const res = await fetch(`${API_BASE_URL}/jobs`);
            if (res.ok) return await res.json();
        } catch (e) {
            // fallback to storage
        }
        const saved = localStorage.getItem('placement_jobs');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        localStorage.setItem('placement_jobs', JSON.stringify(INITIAL_DB_JOBS));
        return INITIAL_DB_JOBS;
    },

    async getJobById(id) {
        const jobs = await this.getJobs();
        return jobs.find(j => j.id === id) || null;
    },

    // ── Applications ─────────────────────────────────────────────────────
    async getApplications() {
        try {
            const res = await fetch(`${API_BASE_URL}/applications`);
            if (res.ok) return await res.json();
        } catch (e) {
            // fallback to storage
        }
        const saved = localStorage.getItem('student_applications');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        localStorage.setItem('student_applications', JSON.stringify(INITIAL_DB_APPLICATIONS));
        return INITIAL_DB_APPLICATIONS;
    },

    async applyToJob(job, studentProfile, newResume) {
        try {
            const res = await fetch(`${API_BASE_URL}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: job.id, studentProfile })
            });
            if (res.ok) return await res.json();
        } catch (e) {
            // fallback to storage
        }

        const currentApps = await this.getApplications();
        const newApp = {
            id: `APP-${Date.now().toString().slice(-4)}`,
            jobId: job.id,
            role: job.role,
            company: job.company,
            color: job.color,
            location: job.location,
            type: job.type,
            salary: job.salary,
            appliedDate: 'Just now',
            appliedTimestamp: Date.now(),
            status: 'Applied',
            resumeName: newResume ? newResume.name : (studentProfile.resumeFileName || 'Abhishek_K_Resume.pdf'),
            isSaved: false,
            stage: 1,
            timeline: [
                { step: 'Application Submitted', date: 'Just now', current: true },
                { step: 'Resume Screening', date: 'In Review', completed: false },
                { step: 'Online Assessment', date: 'Pending', completed: false },
                { step: 'Interview Rounds', date: 'Pending', completed: false },
                { step: 'Final Offer', date: 'Pending', completed: false }
            ]
        };

        const updated = [newApp, ...currentApps.filter(a => a.jobId !== job.id)];
        localStorage.setItem('student_applications', JSON.stringify(updated));
        window.dispatchEvent(new Event('student_applications_updated'));
        window.dispatchEvent(new Event('dashboard_stats_updated'));
        return newApp;
    },

    // ── Interviews ───────────────────────────────────────────────────────
    async getInterviews() {
        try {
            const res = await fetch(`${API_BASE_URL}/interviews`);
            if (res.ok) return await res.json();
        } catch (e) {
            // fallback
        }
        const saved = localStorage.getItem('student_interviews');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        localStorage.setItem('student_interviews', JSON.stringify(INITIAL_DB_INTERVIEWS));
        return INITIAL_DB_INTERVIEWS;
    },

    // ── Dashboard Aggregated Stats ────────────────────────────────────────
    async getDashboardData() {
        const [jobs, applications, interviews] = await Promise.all([
            this.getJobs(),
            this.getApplications(),
            this.getInterviews()
        ]);

        const totalApplications = applications.length;
        const shortlisted = applications.filter(a => a.status.toLowerCase() === 'shortlisted').length;
        const upcomingInterviews = interviews.filter(i => i.status === 'upcoming').length;

        // Recent applications (sorted by most recent)
        const recentApplications = applications.slice(0, 4);

        // Recommended jobs (top 3)
        const recommendedJobs = jobs.slice(0, 3);

        return {
            stats: {
                totalApplications,
                shortlisted,
                interviews: upcomingInterviews
            },
            recentApplications,
            recommendedJobs,
            allJobs: jobs,
            allApplications: applications
        };
    }
};
