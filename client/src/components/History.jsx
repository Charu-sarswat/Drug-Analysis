import { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Card, Badge, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { FaSearch, FaHistory, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'predictedAt', direction: 'desc' });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/history');
        setHistory(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ms-1" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  const filteredAndSortedHistory = history
    .filter(item =>
      item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binding_affinity?.toString().includes(searchTerm) ||
      item.toxicity?.toString().includes(searchTerm) ||
      item.drug_likeness?.toString().includes(searchTerm) ||
      item.effectiveness?.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortConfig.key === 'predictedAt') {
        return sortConfig.direction === 'asc'
          ? new Date(a.predictedAt) - new Date(b.predictedAt)
          : new Date(b.predictedAt) - new Date(a.predictedAt);
      }

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const renderValue = (value, type = 'text') => {
    if (value === null || value === undefined || value === '') return 'N/A';

    if (type === 'percentage') {
      return `${value}%`;
    }

    if (type === 'score') {
      const score = parseFloat(value);
      let color = 'secondary';
      if (score >= 0.8) color = 'success';
      else if (score >= 0.5) color = 'warning';
      else if (score < 0.5) color = 'danger';

      return <Badge bg={color}>{value}</Badge>;
    }

    return value;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading analysis history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        <Alert.Heading>Error Loading History</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="history-container">
      <div className="text-center mb-5">
        <h2 className="display-4 mb-3">Analysis History</h2>
        <p className="lead text-muted">View and search through your drug analysis history</p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <InputGroup className="mb-4">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by drug name, binding affinity, toxicity, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {filteredAndSortedHistory.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaHistory className="mb-3" style={{ fontSize: '2rem' }} />
              <h4>No Analysis History Found</h4>
              <p className="mb-0">Start by analyzing a drug to see results here.</p>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('drugName')} style={{ cursor: 'pointer' }}>
                      Drug Name {getSortIcon('drugName')}
                    </th>
                    <th onClick={() => handleSort('binding_affinity')} style={{ cursor: 'pointer' }}>
                      Binding Affinity {getSortIcon('binding_affinity')}
                    </th>
                    <th onClick={() => handleSort('toxicity')} style={{ cursor: 'pointer' }}>
                      Toxicity {getSortIcon('toxicity')}
                    </th>
                    <th onClick={() => handleSort('drug_likeness')} style={{ cursor: 'pointer' }}>
                      Drug-likeness {getSortIcon('drug_likeness')}
                    </th>
                    <th onClick={() => handleSort('effectiveness')} style={{ cursor: 'pointer' }}>
                      Effectiveness {getSortIcon('effectiveness')}
                    </th>
                    <th onClick={() => handleSort('predictedAt')} style={{ cursor: 'pointer' }}>
                      Date {getSortIcon('predictedAt')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedHistory.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.drugName}</strong></td>
                      <td>{renderValue(item.binding_affinity, 'score')}</td>
                      <td>{renderValue(item.toxicity, 'score')}</td>
                      <td>{renderValue(item.drug_likeness, 'score')}</td>
                      <td>{renderValue(item.effectiveness, 'percentage')}</td>
                      <td>{new Date(item.predictedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default History; 