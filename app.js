// // Crowdfunding Platform: Creating a Web-Based System for Fundraising Campaigns
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/crowdfunding', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  backers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Campaign = mongoose.model('Campaign', CampaignSchema);

app.get('/', (req, res) => {
    res.send('Server is running');
  });

app.post('/api/campaigns', async (req, res) => {
    try {
      const campaigns = req.body; 
      if (!Array.isArray(campaigns)) {
        return res.status(400).json({ error: "Request body must be an array of campaigns" });
      }
      const createdCampaigns = await Campaign.insertMany(campaigns);
      res.status(201).json(createdCampaigns);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/:id/donate', async (req, res) => {
  try {
    const { amount } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    campaign.currentAmount += amount;
    campaign.backers += 1;
    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/campaigns/:id', async (req, res) => {
    try {
      const { title, description, goalAmount } = req.body;
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      campaign.title = title || campaign.title; 
      campaign.description = description || campaign.description;
      campaign.goalAmount = goalAmount || campaign.goalAmount;
  
      await campaign.save();
      res.json(campaign); 
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
});
