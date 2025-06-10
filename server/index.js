require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug-analysis')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Drug Schema
const drugSchema = new mongoose.Schema({
  drugName: String,
  cid: String,
  smiles: String,
  binding_affinity: String,
  toxicity: String,
  effectiveness: Number,
  drug_likeness: String,
  genome_report: String,
  molecular_weight: String,
  molecular_formula: String,
  iupac_name: String,
  h_bond_donor_count: String,
  h_bond_acceptor_count: String,
  rotatable_bond_count: String,
  xlogp: String,
  description: String,
  predictedAt: { type: Date, default: Date.now }
});

const Drug = mongoose.model('Drug', drugSchema);

// Helper function to retry API calls
const retryOperation = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Check AI service health
const checkAIService = async () => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/`);
    console.log('AI Service Status:', response.data.message);
    return true;
  } catch (error) {
    console.error('AI Service is not available:', error.message);
    return false;
  }
};

// Helper function to try different name variations
const tryNameVariations = async (drugName) => {
  const variations = [
    drugName,
    drugName.toLowerCase(),
    drugName.toUpperCase(),
    drugName.replace(/\s+/g, ''),
    drugName.replace(/\s+/g, '-'),
    drugName.replace(/\s+/g, '_')
  ];

  for (const variation of variations) {
    try {
      const response = await axios.get(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(variation)}/cids/JSON`
      );
      if (response.data?.IdentifierList?.CID?.length) {
        return response;
      }
    } catch (error) {
      continue;
    }
  }
  return null;
};

// Routes
app.post('/api/predict', async (req, res) => {
  try {
    // Check if AI service is available
    const isAIServiceAvailable = await checkAIService();
    if (!isAIServiceAvailable) {
      return res.status(503).json({
        error: 'AI Service is not available. Please try again later.'
      });
    }

    const { drugName } = req.body;
    if (!drugName || typeof drugName !== 'string' || drugName.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid drug name provided' });
    }

    console.log(`Processing prediction request for drug: ${drugName}`);

    // Try to get CID with name variations
    let pubchemResponse = await tryNameVariations(drugName);

    if (!pubchemResponse) {
      // If still not found, try searching with a broader query
      try {
        const searchResponse = await axios.get(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(drugName)}/cids/JSON?name_type=word`
        );
        if (searchResponse.data?.IdentifierList?.CID?.length) {
          pubchemResponse = searchResponse;
        }
      } catch (error) {
        console.error('PubChem search error:', error.message);
      }
    }

    if (!pubchemResponse) {
      return res.status(404).json({
        error: 'Drug not found in PubChem database. Please try:',
        suggestions: [
          'Check the spelling of the drug name',
          'Try using the generic name instead of brand name',
          'Use the chemical name if available',
          'Try alternative names or common variations'
        ]
      });
    }

    const cid = pubchemResponse.data.IdentifierList.CID[0];
    console.log(`Found PubChem CID: ${cid}`);

    // Get SMILES with better error handling
    let smiles;
    try {
      const smilesResponse = await retryOperation(async () => {
        return await axios.get(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/CanonicalSMILES/JSON`
        );
      });
      smiles = smilesResponse.data.PropertyTable.Properties[0].CanonicalSMILES;
      console.log(`Retrieved SMILES: ${smiles}`);
    } catch (error) {
      console.error('SMILES fetch error:', error.message);
      return res.status(500).json({
        error: 'Failed to retrieve molecular structure (SMILES) from PubChem'
      });
    }

    // Call Python microservice with detailed error handling
    let aiResponse;
    try {
      aiResponse = await retryOperation(async () => {
        const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
          smiles,
          cid: cid.toString()
        });

        // Validate response data
        const requiredFields = ['binding_affinity', 'toxicity', 'drug_likeness', 'effectiveness'];
        const missingFields = requiredFields.filter(field => !response.data[field]);

        if (missingFields.length > 0) {
          console.warn(`Missing fields in AI response: ${missingFields.join(', ')}`);
        }

        return response;
      });
    } catch (error) {
      console.error('AI service error:', error.message);
      return res.status(500).json({
        error: 'Failed to analyze drug properties. Please try again later.'
      });
    }

    // Save to MongoDB with validation
    try {
      const drugData = {
        drugName,
        cid,
        smiles,
        binding_affinity: aiResponse.data.binding_affinity || 'N/A',
        toxicity: aiResponse.data.toxicity || 'N/A',
        drug_likeness: aiResponse.data.drug_likeness || 'N/A',
        effectiveness: aiResponse.data.effectiveness,
        genome_report: aiResponse.data.genome_report || 'No report available',
        molecular_weight: aiResponse.data.molecular_weight || 'N/A',
        molecular_formula: aiResponse.data.molecular_formula || 'N/A',
        iupac_name: aiResponse.data.iupac_name || 'N/A',
        h_bond_donor_count: aiResponse.data.h_bond_donor_count || 'N/A',
        h_bond_acceptor_count: aiResponse.data.h_bond_acceptor_count || 'N/A',
        rotatable_bond_count: aiResponse.data.rotatable_bond_count || 'N/A',
        xlogp: aiResponse.data.xlogp || 'N/A',
        description: aiResponse.data.description || 'No description available',
      };

      const drug = new Drug(drugData);
      await drug.save();
      console.log(`Successfully saved drug analysis for: ${drugName}`);

      // Generate external reference URLs
      const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
      const chemblUrl = aiResponse.data.inchikey
        ? `https://www.ebi.ac.uk/chembl/compound_report_card/${aiResponse.data.inchikey}`
        : `https://www.ebi.ac.uk/chembl/g/#search_results/compounds/${encodeURIComponent(drugName)}`;
      const drugbankUrl = `https://go.drugbank.com/drugs/search?q=${encodeURIComponent(drugName)}`;

      res.json({
        ...drugData,
        pubchem_url: pubchemUrl,
        chembl_url: chemblUrl,
        drugbank_url: drugbankUrl,
        molecule_image_url: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`,
        structure3d_url: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d`,
        message: 'Analysis completed successfully'
      });
    } catch (error) {
      console.error('MongoDB save error:', error.message);
      // Still return the analysis results even if saving to DB failed
      // Generate external reference URLs even if MongoDB save fails
      const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
      const chemblUrl = aiResponse.data.inchikey
        ? `https://www.ebi.ac.uk/chembl/compound_report_card/${aiResponse.data.inchikey}`
        : `https://www.ebi.ac.uk/chembl/g/#search_results/compounds/${encodeURIComponent(drugName)}`;
      const drugbankUrl = `https://go.drugbank.com/drugs/search?q=${encodeURIComponent(drugName)}`;

      res.json({
        ...aiResponse.data,
        pubchem_url: pubchemUrl,
        chembl_url: chemblUrl,
        drugbank_url: drugbankUrl,
        molecule_image_url: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`,
        structure3d_url: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d`,
        message: 'Analysis completed but failed to save to history'
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'An unexpected error occurred. Please try again later.'
    });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const drugs = await Drug.find().sort({ predictedAt: -1 });
    res.json(drugs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if chemical formula exists in PubChem
app.get('/api/check-pubchem-formula', async (req, res) => {
  try {
    const { formula } = req.query;
    if (!formula) {
      return res.status(400).json({ error: 'Chemical formula is required' });
    }

    // Search PubChem for the formula
    const response = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/${encodeURIComponent(formula)}/cids/JSON`
    );

    if (response.data?.IdentifierList?.CID) {
      // Get the compound name
      const cid = response.data.IdentifierList.CID[0];
      const nameResponse = await axios.get(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/IUPACName/JSON`
      );

      const name = nameResponse.data?.PropertyTable?.Properties?.[0]?.IUPACName;

      return res.json({
        exists: true,
        name,
        cid
      });
    }

    return res.json({
      exists: false
    });
  } catch (error) {
    console.error('PubChem formula check error:', error);
    return res.status(500).json({ error: 'Failed to check formula in PubChem' });
  }
});

// Analyze unknown drug using Perplexity
app.post('/api/predict-unknown', async (req, res) => {
  try {
    const { chemicalFormula, receptorPdbId } = req.body;

    if (!chemicalFormula || !receptorPdbId) {
      return res.status(400).json({ error: 'Chemical formula and receptor PDB ID are required' });
    }

    // Call Python microservice for unknown drug analysis
    const response = await axios.post('http://127.0.0.1:8000/predict-unknown', {
      chemical_formula: chemicalFormula,
      receptor_pdb_id: receptorPdbId
    });

    res.json(response.data);
  } catch (error) {
    console.error('Unknown drug analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze unknown drug. Please try again later.'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Check AI service status on startup
  checkAIService();
}); 