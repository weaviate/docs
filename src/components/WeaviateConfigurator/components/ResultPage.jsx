import React, { useState, useEffect } from 'react';
import { generateDockerCompose } from '../utils/dockerComposeGenerator';

function ResultPage({ selections, onReset }) {
  const [dockerComposeContent, setDockerComposeContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate docker-compose content when component mounts
  useEffect(() => {
    try {
      const content = generateDockerCompose(selections);
      setDockerComposeContent(content);
    } catch (err) {
      console.error('Error generating docker-compose:', err);
      setDockerComposeContent('# Error generating docker-compose file\n# Please check your selections and try again');
    }
  }, [selections]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dockerComposeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([dockerComposeContent], { type: 'text/yaml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'docker-compose.yml';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="wc-result-header">
        <h1>✓ Configuration Complete!</h1>
        <p>Your customized docker-compose.yml file</p>
      </div>

      <div className="wc-result-content">
        <div className="wc-selections-summary-box">
          <h2>Your Configuration</h2>
          <div className="wc-selections-grid">
            {Object.entries(selections).map(([key, value]) => (
              <div key={key} className="wc-selection-row">
                <span className="key">{key}</span>
                <span className="value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wc-docker-compose-section">
          <div className="wc-section-header">
            <h2>docker-compose.yml</h2>
            <div className="wc-button-group-inline">
              <button
                onClick={copyToClipboard}
                className="wc-button wc-button-secondary"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadFile}
                className="wc-button wc-button-primary"
              >
                Download
              </button>
            </div>
          </div>

          <textarea
            className="wc-docker-compose-textarea"
            value={dockerComposeContent}
            readOnly
            rows={25}
          />
        </div>

        <div className="wc-next-steps">
          <h2>Next Steps</h2>
          <ol>
            <li>Copy the content above or download the file</li>
            <li>Save it as <code>docker-compose.yml</code> in your desired directory</li>
            <li>Run <code>docker-compose up -d</code> to start Weaviate</li>
            <li>Access Weaviate at <code>http://localhost:8080</code></li>
          </ol>
        </div>

        <div className="wc-button-group">
          <button onClick={onReset} className="wc-button wc-button-secondary">
            ← Start Over
          </button>
        </div>
      </div>
    </>
  );
}

export default ResultPage;
