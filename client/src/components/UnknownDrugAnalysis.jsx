import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, Table, Tooltip, OverlayTrigger, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaInfoCircle, FaFlask, FaDna, FaChartLine, FaExternalLinkAlt } from 'react-icons/fa';

function UnknownDrugAnalysis() {
    const [chemicalFormula, setChemicalFormula] = useState('');
    const [receptorPdbId, setReceptorPdbId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);

    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">
            {text}
        </Tooltip>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults(null);

        try {
            // First, check if the chemical formula exists in PubChem
            const pubchemResponse = await axios.get(
                `http://localhost:5000/api/check-pubchem-formula?formula=${encodeURIComponent(chemicalFormula)}`
            );

            if (pubchemResponse.data.exists) {
                // If exists in PubChem, use the existing drug analysis endpoint
                const response = await axios.post('http://localhost:5000/api/predict', {
                    drugName: pubchemResponse.data.name
                });
                setResults(response.data);
            } else {
                // If not in PubChem, use the new unknown drug analysis endpoint
                const response = await axios.post('http://localhost:5000/api/predict-unknown', {
                    chemicalFormula,
                    receptorPdbId
                });
                setResults(response.data);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.response?.data?.error || 'An error occurred while analyzing the drug');
        } finally {
            setLoading(false);
        }
    };

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
            <div className="text-center mb-4">
                <h2 className="mb-3">Unknown Drug Analysis</h2>
                <p className="text-muted">Analyze unknown drugs using chemical formula and receptor information</p>
            </div>

            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaFlask className="me-2" />
                                Chemical Formula
                                <OverlayTrigger
                                    placement="right"
                                    overlay={renderTooltip("Enter the chemical formula of the unknown drug")}
                                >
                                    <span>
                                        <FaInfoCircle className="ms-2 text-muted" style={{ cursor: 'pointer' }} />
                                    </span>
                                </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={chemicalFormula}
                                onChange={(e) => setChemicalFormula(e.target.value)}
                                placeholder="e.g., C9H8O4"
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaDna className="me-2" />
                                Receptor PDB ID
                                <OverlayTrigger
                                    placement="right"
                                    overlay={renderTooltip("Enter the PDB ID of the target receptor")}
                                >
                                    <span>
                                        <FaInfoCircle className="ms-2 text-muted" style={{ cursor: 'pointer' }} />
                                    </span>
                                </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={receptorPdbId}
                                onChange={(e) => setReceptorPdbId(e.target.value)}
                                placeholder="e.g., 1ABC"
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
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
                </Alert>
            )}

            {results && (
                <Card className="shadow-sm">
                    <Card.Header as="h5" className="bg-primary text-white d-flex align-items-center">
                        <FaFlask className="me-2" />
                        Analysis Results
                    </Card.Header>
                    <Card.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <Card className="mb-4">
                                    <Card.Header className="bg-light d-flex align-items-center">
                                        <FaDna className="me-2" />
                                        Basic Information
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="lead">{renderValue(results.description)}</p>
                                        <Table className="table-sm table-bordered mt-3">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Chemical Formula</strong></td>
                                                    <td>{renderValue(chemicalFormula)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Receptor PDB ID</strong></td>
                                                    <td>{renderValue(receptorPdbId)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Molecular Weight</strong></td>
                                                    <td>{renderValue(results.molecular_weight)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>XLogP</strong></td>
                                                    <td>{renderValue(results.xlogp)}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </div>

                            <div className="col-md-6">
                                <Card className="mb-4">
                                    <Card.Header className="bg-light d-flex align-items-center">
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
                                                <Card.Header className="bg-light d-flex align-items-center">
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
                                                </Card.Body>
                                            </Card>
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

export default UnknownDrugAnalysis; 