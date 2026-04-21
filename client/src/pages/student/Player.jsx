import React, { useState } from 'react';
import { FiCheckCircle, FiList, FiPlayCircle } from 'react-icons/fi';
import { useCourse } from '../../hooks/useCourse';
import { useParams } from 'react-router-dom';

const Player = () => {
  const { id } = useParams();
  const { loading } = useCourse(id);

  const [activeVideo, setActiveVideo] = useState({ modIndex: 0, topicIndex: 0 });

  const modules = [
    { title: 'Module 1: Introduction', topics: ['Overview', 'Setup Environment'] },
    { title: 'Module 2: Core Concepts', topics: ['Components', 'Props & State'] },
  ];

  if (loading) return <p className="page-loading">Loading course content...</p>;

  const isActive = (mIndex, tIndex) =>
    activeVideo.modIndex === mIndex && activeVideo.topicIndex === tIndex;

  return (
    <section className="player-layout">
      <article className="player-stage panel-surface">
        <div className="player-video">
          <FiPlayCircle />
        </div>
        <h2 className="player-title">{modules[activeVideo.modIndex].topics[activeVideo.topicIndex]}</h2>
        <p className="player-subtitle">Now playing lesson content from your selected module.</p>
      </article>

      <aside className="player-outline panel-surface">
        <h3>
          <FiList /> Course Content
        </h3>
        {modules.map((mod, i) => (
          <div key={i} className="module-block">
            <h4>{mod.title}</h4>
            <ul className="topic-list">
              {mod.topics.map((topic, j) => (
                <li key={j}>
                  <button
                    type="button"
                    onClick={() => setActiveVideo({ modIndex: i, topicIndex: j })}
                    className={`topic-btn ${isActive(i, j) ? 'active' : ''}`}
                  >
                    {isActive(i, j) ? <FiCheckCircle /> : <span className="topic-dot" />}
                    {topic}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
    </section>
  );
};

export default Player;