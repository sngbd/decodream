require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, width = 1024, height = 1024, steps = 20, cfg_scale = 10 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt' });
    }
    
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!accountId || !apiToken) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Cloudflare credentials' 
      });
    }
    
    const cloudflareResponse = await axios({
      method: 'post',
      url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        prompt: prompt,
        num_steps: steps,
        width: width,
        height: height,
        guidance: cfg_scale
      },
      responseType: 'arraybuffer'
    });
    
    const compressedImageBuffer = await sharp(cloudflareResponse.data)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .jpeg({ quality: 90 })
      .toBuffer();
    
    const base64Image = compressedImageBuffer.toString('base64');
    
    return res.json({
      success: true,
      prompt: prompt,
      image: base64Image,
      format: 'base64',
      dimensions: '512x512'
    });
  } catch (error) {
    console.error('Error generating image:', error);
    
    if (error.response) {
      const errorMessage = error.response.data instanceof Buffer 
        ? error.response.data.toString() 
        : JSON.stringify(error.response.data);
        
      return res.status(error.response.status).json({
        error: `Cloudflare API error: ${error.response.status}`,
        details: errorMessage
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate image', 
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Workers AI Wrapper server running on port ${port}`);
});
