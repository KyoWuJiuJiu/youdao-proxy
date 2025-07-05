const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const app = express();
app.use(express.json());

const appKey = process.env.YOUDAO_APPKEY;
const appSecret = process.env.YOUDAO_SECRET;

app.post('/api/translate', async (req, res) => {
  const { q } = req.body;
  const salt = Date.now();
  const curtime = Math.floor(Date.now() / 1000);
  const signStr = appKey + truncate(q) + salt + curtime + appSecret;
  const sign = crypto.createHash('sha256').update(signStr).digest('hex');

  try {
    const { data } = await axios.post('https://openapi.youdao.com/api', null, {
      params: {
        q,
        from: 'auto',
        to: 'auto',
        appKey,
        salt,
        sign,
        signType: 'v3',
        curtime,
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Translation failed', detail: err.message });
  }
});

function truncate(q) {
  const len = q.length;
  if (len <= 20) return q;
  return q.slice(0, 10) + len + q.slice(-10);
}

module.exports = app;
