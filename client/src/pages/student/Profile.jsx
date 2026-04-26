import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiBook, FiCode, FiEdit2, FiSave, FiX, FiAward, FiCalendar, FiClock } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './Profile.css';

const Profile = () => {
  const { user: authUser, setUser } = useAuth();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    program: '',
    year: '',
    bio: '',
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // TODO: Backend Integration - Fetch student profile
        // Expected API: GET /api/students/profile
        // Response should contain:
        // {
        //   user: {
        //     _id,
        //     name,
        //     email,
        //     role,
        //     university,
        //     program,
        //     year,
        //     bio,
        //     skills,
        //     avatar,
        //     createdAt,
        //     enrollmentDate
        //   }
        // }
        const data = await apiRequest('/students/profile', 'GET');
        const user = data?.user || {};
        setUserData(user);
        setFormData({
          name: user.name || '',
          university: user.university || '',
          program: user.program || '',
          year: user.year || '',
          bio: user.bio || '',
          skills: user.skills || []
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Backend Integration - Update student profile
      // Expected API: PUT /api/students/profile
      // Body: { name, university, program, year, bio, skills }
      // Response: { success: true, user: updatedUser }
      const data = await apiRequest('/students/profile', 'PUT', formData);
      
      if (data?.user) {
        setUserData(data.user);
      }
      setEditing(false);
      
      // Update auth context if name changed
      if (data?.user?.name && setUser) {
        setUser(prev => ({ ...prev, name: data.user.name }));
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        university: userData.university || '',
        program: userData.program || '',
        year: userData.year || '',
        bio: userData.bio || '',
        skills: userData.skills || []
      });
    }
    setEditing(false);
  };

  return (
    <div className="student-page">
      <div className="student-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">MY PROFILE</span>
          <h1>Manage Your Information</h1>
          <p>Update your personal details, academic info, and skills.</p>
        </div>
        <div className="student-header-visual">
          <FiUser size={64} />
        </div>
      </div>

      {/* Profile Card - matches auth card style */}
      <div className="profile-card-auth">
        {/* Profile Header */}
        <div className="profile-header-auth">
          <img
            src={userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || authUser?.name || 'User')}&background=2e2117&color=fff&size=96&font-size=0.4&bold=true`}
            alt="Profile"
            className="profile-avatar-auth"
          />
          <div className="profile-header-info-auth">
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="profile-name-input-auth"
                placeholder="Your name"
              />
            ) : (
              <h1>{userData?.name || authUser?.name || 'Student'}</h1>
            )}
            <p className="profile-email-auth">
              <FiMail size={14} /> {authUser?.email || 'email@university.edu'}
            </p>
            <span className="profile-role-auth">
              {authUser?.role?.toUpperCase() || 'STUDENT'}
            </span>
          </div>
          <div className="profile-actions-auth">
            {!editing ? (
              <button className="btn-primary-brown" onClick={() => setEditing(true)}>
                <FiEdit2 size={16} /> Edit
              </button>
            ) : (
              <>
                <button 
                  className="btn-primary-brown" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  <FiSave size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn-outline-auth" onClick={handleCancel}>
                  <FiX size={16} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Body */}
        <div className="profile-body-auth">
          {/* Academic Info */}
          <div className="profile-section-auth">
            <h3><FiBook size={18} /> Academic Information</h3>
            <div className="profile-fields-auth">
              <div className="profile-field-auth">
                <label>University</label>
                {editing ? (
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="Your university"
                  />
                ) : (
                  <p>{userData?.university || '—'}</p>
                )}
              </div>
              <div className="profile-field-auth">
                <label>Program / Major</label>
                {editing ? (
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    placeholder="Your program"
                  />
                ) : (
                  <p>{userData?.program || '—'}</p>
                )}
              </div>
              <div className="profile-field-auth">
                <label>Year of Study</label>
                {editing ? (
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">Select year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5+</option>
                  </select>
                ) : (
                  <p>{userData?.year ? `Year ${userData.year}` : '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="profile-section-auth">
            <h3><FiUser size={18} /> About Me</h3>
            <div className="profile-field-auth full-width-auth">
              <label>Bio</label>
              {editing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              ) : (
                <p className="profile-bio-auth">{userData?.bio || 'No bio added yet.'}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="profile-section-auth">
            <h3><FiCode size={18} /> Tech Stack & Skills</h3>
            <div className="profile-skills-auth">
              {formData.skills.length === 0 && !editing ? (
                <p className="profile-no-skills-auth">No skills added yet.</p>
              ) : (
                <div className="profile-skills-list-auth">
                  {formData.skills.map((skill, idx) => (
                    <span key={idx} className="profile-skill-chip-auth">
                      {skill}
                      {editing && (
                        <button
                          className="profile-skill-remove-auth"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <FiX size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              {editing && (
                <div className="profile-skill-add-auth">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <button className="btn-outline-auth btn-sm-auth" onClick={handleAddSkill}>
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;