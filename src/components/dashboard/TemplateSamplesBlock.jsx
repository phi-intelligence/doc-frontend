import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTemplateSamples } from '../../api/templates';

const getBaseUrl = () => import.meta.env.VITE_API_URL || '';

/**
 * Reusable block for dashboards: fetches template samples for the given module
 * and renders cards with thumbnail and "Open in editor" link.
 * @param {string} module - hr | finance | legal | marketing
 * @param {number} limit - Max templates to show (default 5)
 * @param {string} title - Section title (default "Sample documents" or "Templates")
 */
export default function TemplateSamplesBlock({ module: moduleProp, limit = 5, title = 'Sample documents' }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const moduleKey = (moduleProp || 'hr').toLowerCase();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTemplateSamples(moduleKey, limit)
      .then((data) => {
        if (!cancelled) setTemplates(data.templates || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [moduleKey, limit]);

  if (loading) return <div className="template-samples-block loading">Loading templates…</div>;
  if (error) return <div className="template-samples-block error">Could not load templates: {error}</div>;
  if (!templates.length) return null;

  const editorPath = `/app/${moduleKey}/editor`;
  const baseUrl = getBaseUrl();

  return (
    <section className="template-samples-block">
      <h3 className="template-samples-block__title">{title}</h3>
      <div className="template-samples-block__grid">
        {templates.map((t) => (
          <div key={t.id} className="template-samples-block__card">
            {t.thumbnail_url && (
              <div className="template-samples-block__thumb">
                <img
                  src={baseUrl ? `${baseUrl}${t.thumbnail_url}` : t.thumbnail_url}
                  alt=""
                  loading="lazy"
                />
              </div>
            )}
            <div className="template-samples-block__body">
              <span className="template-samples-block__name">{t.name}</span>
              {t.preview_description && (
                <p className="template-samples-block__desc">{t.preview_description}</p>
              )}
              <Link
                to={`${editorPath}?direct=1&templateId=${encodeURIComponent(t.id)}`}
                className="template-samples-block__link"
              >
                Open in editor
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
