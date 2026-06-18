import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    projectType: 'Residential',
    location: '',
    tradeType: 'General',
    targetBidDate: '',
    notes: '',
    scopeOfWork: ''
  });
  const [plans, setPlans] = useState(null);
  const [scope, setScope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'plans') {
      setPlans(e.target.files);
    } else if (e.target.name === 'scope') {
      setScope(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const data = new FormData();
    data.append('projectType', formData.projectType);
    data.append('location', formData.location);
    data.append('tradeType', formData.tradeType);
    data.append('targetBidDate', formData.targetBidDate);
    data.append('notes', formData.notes);
    data.append('scopeOfWork', formData.scopeOfWork);

    if (plans) {
      for (let i = 0; i < plans.length; i++) {
        data.append('plans', plans[i]);
      }
    }
    if (scope) {
      data.append('scope', scope);
    }

    try {
      const response = await axios.post('/api/estimate', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to generate estimate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>BidBot — AI Construction Estimator</h1>
      </header>
      <main>
        {!result ? (
          <form onSubmit={handleSubmit} className="intake-form">
            <div className="form-group">
              <label>Project Plans (PDF/Images):</label>
              <input type="file" name="plans" multiple onChange={handleFileChange} required />
            </div>
            <div className="form-group">
              <label>Scope of Work:</label>
              <textarea name="scopeOfWork" value={formData.scopeOfWork} onChange={handleInputChange} placeholder="Describe the scope of work here..." required></textarea>
            </div>
            <div className="form-group">
              <label>Project Type:</label>
              <select name="projectType" value={formData.projectType} onChange={handleInputChange}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Renovation">Renovation</option>
                <option value="New Build">New Build</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location / State:</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Austin, TX" required />
            </div>
            <div className="form-group">
              <label>Trade Type:</label>
              <select name="tradeType" value={formData.tradeType} onChange={handleInputChange}>
                <option value="General">General</option>
                <option value="Framing">Framing</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Concrete">Concrete</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target Bid Date (Optional):</label>
              <input type="date" name="targetBidDate" value={formData.targetBidDate} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Notes (Optional):</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any specific details..."></textarea>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing Pipeline (10m)...' : 'Generate Estimate'}
            </button>
          </form>
        ) : (
          <div className="result-view">
            <h2>Estimate Generated Successfully!</h2>
            <div className="report-summary">
              <h3>{result.report.title}</h3>
              <p><strong>Total Estimated Range:</strong> {result.report.totalEstimate}</p>
              <a 
                href={result.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="download-link"
              >
                Download PDF Report
              </a>
            </div>
            <button onClick={() => setResult(null)}>Submit Another</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
