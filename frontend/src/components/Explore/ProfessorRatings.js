import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../api/constants';
import './ProfessorRatings.css';

function ProfessorRatings({ courseId }) {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProfessorId, setExpandedProfessorId] = useState(null);

  useEffect(() => {
    async function fetchRatings() {
      try {
        const res = await fetch(`${API_BASE}/api/course_professors/?course_id=${courseId}`);
        if (res.ok) {
          const json = await res.json();
          setProfessors(json.professors || []);
          if (json.professors?.length > 0) {
            setExpandedProfessorId(json.professors[0].id);
          }
        } else {
          setError('Failed to load ratings.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching ratings.');
      } finally {
        setLoading(false);
      }
    }
    fetchRatings();
  }, [courseId]);

  if (loading) return <div className="ratings-loading">Loading professor ratings...</div>;
  if (error) return <div className="ratings-error">{error}</div>;
  if (!professors.length) return <div className="ratings-empty">No rating data available for this course.</div>;

  const renderRatingBar = (label, value, color) => {
    const percentage = (value / 5) * 100;
    return (
      <div className="stat-bar-group">
        <div className="stat-header">
          <span className="stat-label">{label}</span>
          <span className="stat-value">{Number(value).toFixed(1)}</span>
        </div>
        <div className="stat-bar-bg">
          <div 
            className="stat-bar-fill" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="professor-ratings-container">
      <div className="professors-list">
        {professors.map((prof) => (
          <div key={prof.id} className={`professor-card ${expandedProfessorId === prof.id ? 'expanded' : ''}`}>
            <div 
              className="professor-card-header" 
              onClick={() => setExpandedProfessorId(expandedProfessorId === prof.id ? null : prof.id)}
            >
              <div className="prof-info-basic">
                <span className="prof-name">{prof.professor_name}</span>
                <span className="prof-rating-count">{prof.rating_count} ratings</span>
              </div>
              <div className="overall-rating-badge" style={{ backgroundColor: getRatingColor(prof.overall_rating) }}>
                {Number(prof.overall_rating).toFixed(1)}
              </div>
            </div>

            {expandedProfessorId === prof.id && (
              <div className="professor-card-content">
                <div className="ratings-grid">
                  <div className="detailed-stats">
                    {renderRatingBar('Easiness', prof.easiness, '#4caf50')}
                    {renderRatingBar('Workload', prof.workload, '#ff9800')}
                    {renderRatingBar('Clarity', prof.clarity, '#2196f3')}
                    {renderRatingBar('Helpfulness', prof.helpfulness, '#9c27b0')}
                  </div>
                  <div className="bruinwalk-link-section">
                    <a href={prof.bruinwalk_url} target="_blank" rel="noopener noreferrer" className="bruinwalk-button">
                      View on BruinWalk
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="reviews-section">
                  <h4>Student Reviews</h4>
                  <div className="reviews-list">
                    {prof.reviews && prof.reviews.length > 0 ? (
                      prof.reviews.map((review, idx) => (
                        <div key={idx} className="review-item">
                          <div className="review-meta">
                            <span className="review-date">{review.date}</span>
                          </div>
                          <p className="review-text">{review.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="no-reviews">No detailed reviews available.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getRatingColor(rating) {
  const r = Number(rating);
  if (r >= 4.0) return '#4caf50'; // Green
  if (r >= 3.0) return '#8bc34a'; // Light Green
  if (r >= 2.0) return '#ffc107'; // Amber
  return '#f44336'; // Red
}

export default ProfessorRatings;
