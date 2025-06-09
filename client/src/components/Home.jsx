import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaFlask, FaDna, FaChartLine, FaRobot, FaDatabase, FaShieldAlt } from 'react-icons/fa';

function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <div className="hero-section text-center py-5">
                <h1 className="display-3 fw-bold mb-4">Drug Analysis Platform</h1>
                <p className="lead mb-5">Advanced AI-powered drug analysis and prediction system for pharmaceutical research</p>
                <Link to="/analysis">
                    <Button variant="primary" size="lg" className="px-5 py-3">
                        <FaFlask className="me-2" />
                        Start Analysis
                    </Button>
                </Link>
            </div>

            {/* Features Section */}
            <Container className="features-section py-5">
                <h2 className="text-center mb-5">Key Features</h2>
                <Row className="g-4">
                    <Col md={4}>
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center">
                                <FaRobot className="feature-icon mb-3" />
                                <Card.Title>AI-Powered Analysis</Card.Title>
                                <Card.Text>
                                    Leverage advanced machine learning algorithms to analyze drug properties and predict their behavior
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center">
                                <FaDna className="feature-icon mb-3" />
                                <Card.Title>Molecular Analysis</Card.Title>
                                <Card.Text>
                                    Detailed analysis of molecular structures, binding affinities, and drug-likeness properties
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center">
                                <FaChartLine className="feature-icon mb-3" />
                                <Card.Title>Performance Metrics</Card.Title>
                                <Card.Text>
                                    Comprehensive evaluation of drug effectiveness, toxicity, and binding affinity
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* How It Works Section */}
            <div className="how-it-works-section py-5">
                <Container>
                    <h2 className="text-center mb-5">How It Works</h2>
                    <Row className="g-4">
                        <Col md={3}>
                            <div className="step-card text-center">
                                <div className="step-number">1</div>
                                <h4>Input Drug Name</h4>
                                <p>Enter the name of the drug you want to analyze</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="step-card text-center">
                                <div className="step-number">2</div>
                                <h4>AI Analysis</h4>
                                <p>Our AI system processes the drug data</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="step-card text-center">
                                <div className="step-number">3</div>
                                <h4>Generate Results</h4>
                                <p>Get detailed analysis and predictions</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="step-card text-center">
                                <div className="step-number">4</div>
                                <h4>View History</h4>
                                <p>Access your analysis history anytime</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Benefits Section */}
            <Container className="benefits-section py-5">
                <h2 className="text-center mb-5">Why Choose Our Platform</h2>
                <Row className="g-4">
                    <Col md={6}>
                        <Card className="h-100 benefit-card">
                            <Card.Body>
                                <FaDatabase className="benefit-icon mb-3" />
                                <Card.Title>Comprehensive Database</Card.Title>
                                <Card.Text>
                                    Access to extensive drug databases and molecular information for accurate analysis
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="h-100 benefit-card">
                            <Card.Body>
                                <FaShieldAlt className="benefit-icon mb-3" />
                                <Card.Title>Reliable Results</Card.Title>
                                <Card.Text>
                                    Trusted by researchers and pharmaceutical professionals for accurate predictions
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Call to Action */}
            <div className="cta-section text-center py-5">
                <Container>
                    <h2 className="mb-4">Ready to Start Your Analysis?</h2>
                    <p className="lead mb-4">Join researchers and professionals in advancing pharmaceutical research</p>
                    <Link to="/analysis">
                        <Button variant="primary" size="lg" className="px-5 py-3">
                            <FaFlask className="me-2" />
                            Begin Analysis Now
                        </Button>
                    </Link>
                </Container>
            </div>
        </div>
    );
}

export default Home; 