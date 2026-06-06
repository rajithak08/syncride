import axios from 'axios';

export default async function handler(req, res) {
  const { url } = req;

  if (url === '/') {
    return res.status(200).json({ message: '✅ Vercel ping service is active', time: new Date().toISOString() });
  }

  if (url === '/ping') {
    try {
      // const response = await axios.get('https://rtqi.onrender.com/ping');
      const response_v2 = await axios.get('https://rtqi-v2.onrender.com/ping');
      console.log(`Ping sent at ${new Date().toISOString()}, status: ${response_v2}`);
      return res.status(200).json({ message: 'Ping sent', time: new Date().toISOString() });
    } catch (error) {
      console.error('Ping error:', error.message);
      return res.status(500).json({ message: 'Ping failed', error: error.message });
    }
  }

  // Optional: handle unknown routes
  res.status(404).json({ message: 'Not found' });
}
