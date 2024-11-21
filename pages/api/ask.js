import { handleUserQuestion } from '../../lib/aiAssistant';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const answer = handleUserQuestion(question);

    return res.status(200).json({ answer });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 