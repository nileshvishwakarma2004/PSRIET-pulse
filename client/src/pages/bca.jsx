import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CurriculumQuickAccess from '../components/CurriculumQuickAccess';
import CurriculumSemesterCards from '../components/CurriculumSemesterCards';
import CertificationClaimCard from '../components/CertificationClaimCard';
import { fetchPortalRecords, portalRecordTypes } from '../services/portalData';
import './style/bca.css';

const formatOpportunities = (entries, type) => {
  return entries.flatMap((entry) => {
    const title = entry?.role || entry?.title || entry?.name;
    const description = entry?.description || entry?.intro || entry?.content;
    const lastDate = entry?.lastDate || entry?.deadline || entry?.date;
    const applyLink = entry?.applyLink || entry?.externalApplyLink || entry?.link || entry?.url;

    if (![title, description, lastDate, applyLink].every((value) => typeof value === 'string' && value.trim())) {
      console.error(`Skipping an incomplete ${type.toLowerCase()} opportunity.`);
      return [];
    }

    try {
      const url = new URL(applyLink);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        console.error(`Skipping an ${type.toLowerCase()} opportunity with an unsupported apply link.`);
        return [];
      }
    } catch (error) {
      console.error(`Skipping an ${type.toLowerCase()} opportunity with an invalid apply link.`, error);
      return [];
    }

    return [{
      id: entry.id,
      title: title.trim(),
      company: typeof entry.company === 'string' && entry.company.trim() ? entry.company.trim() : 'Company not specified',
      description: description.trim(),
      eligibility: entry.eligibility || 'Not specified',
      experience: entry.experience || 'Not specified',
      lastDate: lastDate.trim(),
      applyLink: applyLink.trim(),
      type
    }];
  });
};

const BcaPage = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [opportunityError, setOpportunityError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadOpportunities = async () => {
      try {
        const [jobs, internships] = await Promise.all([
          fetchPortalRecords(portalRecordTypes.job),
          fetchPortalRecords(portalRecordTypes.internship)
        ]);
        if (!isMounted) return;
        setOpportunities([
          ...formatOpportunities(jobs, 'Job'),
          ...formatOpportunities(internships, 'Internship')
        ]);
        setOpportunityError('');
      } catch (error) {
        console.error('Unable to load opportunities from Supabase.', error);
        if (isMounted) setOpportunityError(error.message || 'Unable to load opportunities right now.');
      }
    };

    loadOpportunities();
    return () => { isMounted = false; };
  }, []);

  const semesters = [
    {
      sem: 'Sem 1',
      subjects: ['Principles of Programming Using ‘C’- I ', 'Computer Fundamentals', 'Mathematical Foundations ', 'Digital Electronics', ' E-Commerce & Application'],
      notesPdfs: {
        'Principles of Programming Using ‘C’- I': '/c-programming.pdf',
        'Computer Fundamentals': '/fundamentle.pdf',
        'Mathematical Foundations': '/math.pdf',
        'Digital Electronics': '/digital.pdf',
        'E-Commerce & Application': '/e-com.pdf'
      }
    },
    {
      sem: 'Sem 2',
      subjects: ['Computer System Architecture', 'Principles of Programming Using ‘C’- II ', 'Statistics', 'Discrete Mathematics', 'Cyber Security'],
    },
    {
      sem: 'Sem 3',
      subjects: ['Data Structures (DSA)', 'Data Communication & Computer Network', 'Object Oriented Methodology using C++', 'Introduction to Artificial Intelligence', 'Blockchain Technology'],
      notesPdfs: {
        'Data Structures (DSA)': '/DSA.pdf',
        'Object Oriented Methodology using C++': '/cpp-programming.pdf'
      }
    },
    {
      sem: 'Sem 4',
      subjects: ['Java Programming ', 'Software Engineering', 'Database Management Systems', 'Introduction to Python', 'Operating Systems'],
      notesPdfs: {
        'Introduction to Python': '/python-oop.pdf'
      }
    },
    { sem: 'Sem 5', subjects: ['Multimedia and Graphics ', 'Design and Analysis of Algorithm', 'Introduction to Data Science', 'Introduction to PHP'] },
    { sem: 'Sem 6', subjects: ['Cloud Computing', 'Data Mining', 'Soft Computing'] }
  ];

  const gloryStudents = [
    { name: 'Rahul Sharma', achievement: 'Won State Level Hackathon 2025', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80' },
    { name: 'Priya Verma', achievement: 'Google DSC Lead & Full Stack Dev', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80' },
    { name: 'Aman Gupta', achievement: 'Secured 1st Rank in Major Project', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80' },
    { name: 'Neha Singh', achievement: 'AI Research Paper Published', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80' }
  ];

  const openSourcePrograms = [
    {
      id: 1,
      title: 'Google Summer of Code (GSoC)',
      type: 'Open Source Program',
      stipend: '₹1.5 Lakh - ₹3.3 Lakh ($1,500 - $3,300)',
      timeline: 'Registration starts in February | Program: March - August',
      link: 'https://summerofcode.withgoogle.com/',
      details: 'A global online program by Google that introduces students to open-source software development. Students work with open-source organizations on real projects under the guidance of mentors and earn a substantial stipend.\n\nRegistration Steps:\n1. Check eligibility (Must be 18+ and a college student).\n2. Explore open-source mentor organizations and choose a project in February.\n3. Connect with organization mentors via IRC/Discord and discuss proposal ideas.\n4. Draft and submit your project proposal on the official GSoC portal before the deadline.'
    },
    {
      id: 2,
      title: 'MLH Fellowship (Major League Hacking)',
      type: 'Open Source & Internship',
      stipend: '₹1 Lakh+ Stipend / Fellowship',
      timeline: 'Batch-wise (Spring, Summer, Fall applications open early)',
      link: 'https://fellowship.mlh.io/',
      details: 'A 12-week professional internship alternative where students get paid to learn how to collaborate on real-world open-source projects used by top tech companies.\n\nRegistration Steps:\n1. Visit the MLH Fellowship website and select your preferred track (Open Source or Prep).\n2. Fill out the application form with your GitHub profile and coding background.\n3. Clear the technical assessment and interview rounds.\n4. Accept the offer and join the cohort.'
    },
    {
      id: 3,
      title: 'Postman Student Leader & Open Source',
      type: 'API & Community Open Source',
      stipend: 'Swags, Grants & Paid Bounties',
      timeline: 'Open Throughout Year (Applications open bi-annually)',
      link: 'https://www.postman.com/student-program/',
      details: 'An ideal program for students passionate about APIs, backend workflows, and building developer tools. Contribute to open-source API projects and student leader initiatives to earn bounties.\n\nRegistration Steps:\n1. Sign up on the Postman Student Portal.\n2. Complete the beginner API fundamentals training.\n3. Apply for the Student Leader or Open Source contributor badge.\n4. Build and submit projects using Postman technologies.'
    },
    {
      id: 4,
      title: 'Hacktoberfest',
      type: 'Open Source Contribution',
      stipend: 'Digital Badges, Swags & Tree Planting / Bounties',
      timeline: 'Registration in September | Event in October',
      link: 'https://hacktoberfest.com/',
      details: 'The ultimate beginner-friendly event to jumpstart your open-source journey. Contribute valid pull requests to participating public GitHub/GitLab repositories during October.\n\nRegistration Steps:\n1. Create a GitHub or GitLab account if you do not have one.\n2. Register on the official Hacktoberfest website when registration opens in September.\n3. Find beginner-friendly repositories labeled with "hacktoberfest".\n4. Submit 4 pull requests that get merged or approved during the month of October.'
    }
  ];

  const announcements = [
    "📢 Check the latest official institute notice for BCA admissions and application dates.",
    "💡 Confirm scholarship eligibility and deadlines on the official scholarship portal.",
    "📝 Verify examination form deadlines in official notices.",
    "🚀 Consult department updates for practical lab schedules."
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bca-dashboard-theme">
      <div className="bca-top-bar">
        <Link to="/" className="back-dash-btn">← Back to Dashboard</Link>
        <span className="badge-pill">Department of Computer Applications</span>
      </div>

      <div className="bca-hero-dashboard">
        <div className="bca-hero-left">
          <span className="hero-tag">ACADEMIC EXCELLENCE</span>
          <h1>Bachelor of Computer Applications (BCA)</h1>
          <p>Master programming, full-stack software development, and modern technologies with a structured 3-year curriculum.</p>
          <div className="bca-meta-tags">
            <span>⏳ 3 Years</span>
            <span>🪑 60 Seats</span>
            <span>💰 ₹35,000 / Year</span>
          </div>
        </div>
        <div className="bca-hero-right">
          <img src="/logo.png" alt="BCA Logo" className="bca-hero-logo" />
        </div>
      </div>

      <div className="important-ticker-wrapper">
        <div className="ticker-label">🚨 IMPORTANT UPDATES</div>
        <div className="ticker-container">
          <div className="ticker-track">
            {[...announcements, ...announcements].map((item, idx) => (
              <span key={idx} className="ticker-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Red mark wala syllabus part (original bca.pdf par set hai) */}
      <div className="bca-section">
        <div className="bca-section-header">
          <span className="section-badge">🚀 ROADMAP</span>
          <h2>Semester-wise Curriculum & Notes</h2>
        </div>
        <CurriculumSemesterCards semesters={semesters} syllabusPdf="/bca.pdf" courseKey="bca" />
      </div>

      {/* Yellow mark wala Quick Access / Cheatsheet Hub jahan C Programming ka PDF link jayega */}
      <CurriculumQuickAccess semesters={semesters} courseKey="bca" />
      <CertificationClaimCard />

      <div className="opensource-hub-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '22px', borderRadius: '16px', marginTop: '25px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: '18px' }}>
          <span style={{ background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #a7f3d0' }}>💰 SKILLS & EARNINGS HUB</span>
          <h3 style={{ margin: '8px 0 4px 0', fontSize: '1.15rem', color: '#0f172a' }}>Open Source & Paid Student Programs</h3>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#64748b' }}>Coding skills ke sath-sath open-source me contribute karke stipend aur pocket money kaise kamayein, yahan dekhein!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {openSourcePrograms.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', transition: 'all 0.2s ease' }}>
                <div
                  onClick={() => toggleExpand(item.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>{item.type}</span>
                    <h4 style={{ margin: '6px 0 2px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>{item.title}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#047857', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px' }}>{item.stipend}</span>
                    <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: '0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>{item.details}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: '600', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px' }}>📅 Timeline: {item.timeline}</span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ background: '#2563eb', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }}
                      >
                        Apply / Official Website ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bca-section glory-wrapper">
        <div className="bca-section-header text-center">
          <span className="section-badge">🏆 GLORY & ACHIEVEMENTS</span>
          <h2>Student Hall of Fame</h2>
        </div>
        <div className="infinite-slider-container">
          <div className="infinite-track">
            {[...gloryStudents, ...gloryStudents].map((student, idx) => (
              <div key={idx} className="glory-card-light">
                <img
                  src={student.image}
                  alt={student.name}
                  className="glory-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0D8ABC&color=fff&size=128`;
                  }}
                />
                <div className="glory-text">
                  <h3>{student.name}</h3>
                  <p>{student.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="dashboard-section-box">
        <div className="section-header-wrap">
          <div className="title-with-badge">
            <span className="badge-tag">🎓 FINANCIAL AID</span>
          </div>
          <h2>State Scholarship & Fee Reimbursement</h2>
          <p className="section-subtitle">Check your eligibility criteria and apply for government scholarship schemes directly.</p>
        </div>

        <div className="scholarship-main-card">
          <div className="scholarship-card-header">
            <div className="scholarship-title-area">
              <span className="scholarship-badge">🏛️ Government Scheme</span>
              <h3>Post-Matric Scholarship for BCA Students</h3>
              <p>Eligible students can claim tuition fee reimbursement and maintenance allowances provided by the state government.</p>
            </div>
            <div className="scholarship-action-btns">
              <a href="https://scholarships.gov.in/" target="_blank" rel="noreferrer" className="primary-apply-btn">
                Apply Now 🚀
              </a>
              <button onClick={() => alert("Checking application status...")} className="secondary-status-btn">
                Check Status 🔍
              </button>
            </div>
          </div>

          <div className="scholarship-rules-grid">
            <div className="rule-box">
              <span className="rule-label">ACADEMIC CUTOFF:</span>
              <span className="rule-value">Minimum 75% Marks</span>
            </div>
            <div className="rule-box">
              <span className="rule-label">BACKLOG RULE:</span>
              <span className="rule-value">No Active Backlogs (0 Failures)</span>
            </div>
            <div className="rule-box">
              <span className="rule-label">ATTENDANCE:</span>
              <span className="rule-value">Minimum 75% Required</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bca-live-opportunities" aria-labelledby="bca-live-opportunities-title">
        <div className="bca-live-opportunities-heading">
          <div>
            <span className="bca-live-opportunities-badge">LIVE OPPORTUNITIES</span>
            <h2 id="bca-live-opportunities-title">Jobs &amp; Internships</h2>
          </div>
          <span className="bca-live-opportunities-count">{opportunities.length} available</span>
        </div>
        {opportunityError && <p role="alert">{opportunityError}</p>}
        {opportunities.length > 0 ? (
          <div className="bca-opportunities-viewport" aria-label="Latest jobs and internships">
            <div
              className={`bca-opportunities-track${opportunities.length > 1 ? ' is-animated' : ''}`}
              style={{ '--opportunity-duration': `${opportunities.length * 4}s` }}
            >
              {[...opportunities, ...(opportunities.length > 1 ? opportunities : [])].map((opportunity, index) => (
                <article
                  className="bca-opportunity-card"
                  key={`${opportunity.id}-${index}`}
                  aria-hidden={index >= opportunities.length}
                >
                  <div className="bca-opportunity-copy">
                    <span className="bca-opportunity-type">{opportunity.type}</span>
                    <h3>{opportunity.title}</h3>
                    <p className="bca-opportunity-company">{opportunity.company}</p>
                    <p className="bca-opportunity-description">{opportunity.description}</p>
                    <div className="bca-opportunity-requirements">
                      <span><strong>Eligibility:</strong> {opportunity.eligibility}</span>
                      <span><strong>Experience:</strong> {opportunity.experience}</span>
                    </div>
                  </div>
                  <div className="bca-opportunity-actions">
                    <span className="bca-opportunity-deadline">Last date: {opportunity.lastDate}</span>
                    <a
                      href={opportunity.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={index >= opportunities.length ? -1 : undefined}
                      className="bca-opportunity-apply"
                    >
                      Apply Now ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="bca-opportunities-empty">New job and internship opportunities will appear here.</p>
        )}
      </section>

      <div className="bca-hod-card-light">
        <div className="hod-avatar-container">
          <span className="hod-avatar-fallback" aria-hidden="true">PP</span>
          <img
            src="/pradeeppandey.jpg"
            className="hod-img-light"
            alt="Pradeep Pandey, HOD - Computer Science"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div>
          <h3>Pradeep Pandey</h3>
          <p className="hod-title-light">HOD - Computer Science Department</p>
          <p className="hod-desc-light">"Focus on practical lab coding, algorithmic logic, and consistent project building."</p>
        </div>
      </div>
    </div>
  );
};

export default BcaPage;