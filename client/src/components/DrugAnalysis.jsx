import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, Table, Tooltip, OverlayTrigger, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaInfoCircle, FaFlask, FaDna, FaChartLine, FaExternalLinkAlt, FaDatabase, FaPills } from 'react-icons/fa';

function DrugAnalysis() {
  const [drugName, setDrugName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      console.log('Submitting analysis for:', drugName);
      const response = await axios.post('http://localhost:5000/api/predict', {
        drugName: drugName.trim()
      });
      console.log('Received response:', response.data);
      setResults(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.error || 'An error occurred while analyzing the drug');
    } finally {
      setLoading(false);
    }
  };

  const renderTooltip = (text) => (
    <Tooltip id="button-tooltip">
      {text}
    </Tooltip>
  );

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

  return (
    <div className="drug-analysis-container">
      <div className="text-center mb-5">
        <h2 className="display-4 mb-3">Drug Analysis</h2>
        <p className="lead text-muted">Enter a drug name to analyze its properties and characteristics</p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaFlask className="me-2" />
                Drug Name
                <OverlayTrigger
                  placement="right"
                  overlay={renderTooltip("Enter the name of the drug you want to analyze")}
                >
                  <span>
                    <FaInfoCircle className="ms-2 text-muted" style={{ cursor: 'pointer' }} />
                  </span>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="e.g., Aspirin, Ibuprofen, Paracetamol"
                required
                disabled={loading}
                className="form-control-lg"
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaChartLine className="me-2" />
                  Analyze Drug
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Analysis Error</Alert.Heading>
          <p>{error}</p>
          {err.response?.data?.suggestions && (
            <div className="mt-3">
              <h6>Suggestions:</h6>
              <ul className="mb-0">
                {err.response.data.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </Alert>
      )}

      {results && (
        <Card>
          <Card.Header as="h5" className="d-flex align-items-center">
            <FaFlask className="me-2" />
            Analysis Results for {results.drugName}
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6">
                <Card className="mb-4">
                  <Card.Header className="d-flex align-items-center">
                    <FaDna className="me-2" />
                    Basic Information
                  </Card.Header>
                  <Card.Body>
                    <p className="lead">{renderValue(results.description)}</p>
                    <p><strong>IUPAC Name:</strong> {renderValue(results.iupac_name)}</p>
                    <Table className="table-sm table-bordered mt-3">
                      <tbody>
                        <tr>
                          <td><strong>Molecular Weight</strong></td>
                          <td>{renderValue(results.molecular_weight)}</td>
                        </tr>
                        <tr>
                          <td><strong>Molecular Formula</strong></td>
                          <td>{renderValue(results.molecular_formula)}</td>
                        </tr>
                        <tr>
                          <td><strong>XLogP</strong></td>
                          <td>{renderValue(results.xlogp)}</td>
                        </tr>
                        <tr>
                          <td><strong>H-Bond Donors</strong></td>
                          <td>{renderValue(results.h_bond_donor_count)}</td>
                        </tr>
                        <tr>
                          <td><strong>H-Bond Acceptors</strong></td>
                          <td>{renderValue(results.h_bond_acceptor_count)}</td>
                        </tr>
                        <tr>
                          <td><strong>Rotatable Bonds</strong></td>
                          <td>{renderValue(results.rotatable_bond_count)}</td>
                        </tr>
                      </tbody>
                    </Table>

                    {results.molecule_image_url && (
                      <div className="text-center mt-4">
                        <h6>2D Structure</h6>
                        <img
                          src={results.molecule_image_url}
                          alt="Molecule Structure"
                          className="img-fluid rounded shadow-sm"
                          style={{ maxWidth: 300, border: '1px solid #dee2e6' }}
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {results.structure3d_url && (
                      <div className="text-center mt-3">
                        <h6>3D Structure</h6>
                        <a
                          href={results.structure3d_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary"
                        >
                          <FaExternalLinkAlt className="me-2" />
                          Download SDF
                        </a>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>

              <div className="col-md-6">
                <Card className="mb-4">
                  <Card.Header className="d-flex align-items-center">
                    <FaChartLine className="me-2" />
                    Analysis Results
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-sm table-bordered">
                      <tbody>
                        <tr>
                          <td><strong>Binding Affinity</strong></td>
                          <td>{renderValue(results.binding_affinity, 'score')}</td>
                        </tr>
                        <tr>
                          <td><strong>Toxicity</strong></td>
                          <td>{renderValue(results.toxicity, 'score')}</td>
                        </tr>
                        <tr>
                          <td><strong>Drug-likeness</strong></td>
                          <td>{renderValue(results.drug_likeness, 'score')}</td>
                        </tr>
                        <tr>
                          <td><strong>Effectiveness</strong></td>
                          <td>{renderValue(results.effectiveness, 'percentage')}</td>
                        </tr>
                      </tbody>
                    </Table>

                    <div className="mt-4">
                      <Card>
                        <Card.Header className="d-flex align-items-center">
                          <FaDna className="me-2" />
                          Genomic Analysis
                        </Card.Header>
                        <Card.Body>
                          <div className="genome-report">
                            {results.genome_report.split('\n').map((line, index) => {
                              if (line.startsWith('Genetic') || line.startsWith('Protein') || line.startsWith('Genetic Pathways')) {
                                return <h6 key={index} className="mt-3 mb-2">{line}</h6>;
                              } else if (line.startsWith('-')) {
                                return (
                                  <div key={index} className="ms-3 mb-2">
                                    <FaDna className="me-2 text-primary" style={{ fontSize: '0.8rem' }} />
                                    {line.substring(2)}
                                  </div>
                                );
                              } else {
                                return <p key={index} className="mb-2">{line}</p>;
                              }
                            })}
                          </div>

                          {results.genome_image_url && (
                            <div className="text-center mt-4">
                              <h6>Molecular Interaction Network</h6>
                              <img
                                src={results.genome_image_url}
                                alt="Molecular Interaction Network"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxWidth: 300, border: '1px solid #dee2e6' }}
                                onError={(e) => {
                                  console.error('Genome image load error:', e);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </div>

                    <div className="mt-4">
                      <h6 className="d-flex align-items-center mb-3">
                        <FaDatabase className="me-2" />
                        External References
                      </h6>
                      <div className="d-grid gap-2">
                        {results.pubchem_url && (
                          <a
                            href={results.pubchem_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary"
                          >
                            <FaExternalLinkAlt className="me-2" />
                            View on PubChem
                          </a>
                        )}
                        {results.chembl_url && (
                          <a
                            href={results.chembl_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-info"
                          >
                            <FaDatabase className="me-2" />
                            View on ChEMBL
                          </a>
                        )}
                        {results.drugbank_url && (
                          <a
                            href={results.drugbank_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-success"
                          >
                            <FaPills className="me-2" />
                            Search on DrugBank
                          </a>
                        )}
                      </div>
                      <div className="mt-3 small text-muted">
                        <p className="mb-1">
                          <strong>Note:</strong> External links provide additional information about {results.drugName} from trusted databases:
                        </p>
                        <ul className="mb-0">
                          <li>PubChem - Comprehensive chemical information</li>
                          <li>ChEMBL - Bioactivity data and drug discovery</li>
                          <li>DrugBank - Detailed drug and pharmaceutical information</li>
                        </ul>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default DrugAnalysis; 