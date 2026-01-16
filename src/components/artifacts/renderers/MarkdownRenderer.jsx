import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Markdown renderer with syntax highlighting for code blocks
 */
const MarkdownRenderer = ({ content }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`h-full overflow-auto p-6 artifact-scrollbar ${isDark ? 'bg-dark-bg text-dark-text' : 'bg-white text-light-text'}`}>
      <ReactMarkdown
        className="prose prose-sm max-w-none dark:prose-invert"
        components={{
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              return (
                <Highlight
                  theme={isDark ? themes.nightOwl : themes.github}
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                >
                  {({ tokens, getLineProps, getTokenProps }) => (
                    <pre className={`rounded-lg p-4 overflow-x-auto my-4 artifact-scrollbar ${isDark ? 'bg-dark-surface' : 'bg-gray-50'}`}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })} className="table-row">
                          <span className="table-cell text-right pr-4 select-none text-gray-500">{i + 1}</span>
                          <span className="table-cell">
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </span>
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              );
            }
            
            return (
              <code className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-dark-surface text-brand-accent-400' : 'bg-gray-100 text-brand-accent-600'}`} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className={`text-3xl font-bold mt-6 mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-2xl font-semibold mt-5 mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xl font-semibold mt-4 mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`mb-4 leading-relaxed ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc list-inside mb-4 space-y-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-inside mb-4 space-y-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 pl-4 my-4 italic ${isDark ? 'border-brand-accent-500 text-dark-text-secondary' : 'border-brand-accent-500 text-light-text-secondary'}`}>
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-brand-accent-500 hover:text-brand-accent-600 underline ${isDark ? 'hover:text-brand-accent-400' : ''}`}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 artifact-scrollbar">
              <table className={`min-w-full border-collapse ${isDark ? 'border-dark-border' : 'border-light-border'} border`}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className={`px-4 py-2 border ${isDark ? 'bg-dark-surface border-dark-border text-dark-text' : 'bg-gray-100 border-light-border text-light-text'} font-semibold text-left`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-2 border ${isDark ? 'border-dark-border text-dark-text-secondary' : 'border-light-border text-light-text-secondary'}`}>
              {children}
            </td>
          ),
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

