const https = require('https');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { subject, answers, date_time, answers_text } = req.body || {};

  const questions = [
    'Врачи и медсестры понятно объясняли состояние ребёнка',
    'Насколько комфортным было пребывание?',
    'Что сделало бы пребывание комфортнее?',
    'Персонал относился с заботой и уважением?',
    'Уровень шума в отделении',
    'Эмоциональная поддержка персонала',
    'Что было важным в эмоциональной поддержке?',
    'Атмосфера в отделении была спокойной?',
    'Наиболее комфортная медсестра',
    'Удовлетворённость выпиской',
    'Что мы делаем лучше всего?',
    'Что бы Вы изменили?',
    'Что следует улучшить?'
  ];

  const rows = questions.map((q, i) => {
    const val = (answers && answers[`q${i+1}`]) || '—';
    const bg = i % 2 === 0 ? '#faf7f2' : '#ffffff';
    return `<tr style="background:${bg}"><td style="padding:8px 12px;font-size:12px;color:#4e7264;font-weight:600">${i+1}</td><td style="padding:8px 12px;font-size:12px;color:#333">${q}</td><td style="padding:8px 12px;font-size:12px">${val}</td></tr>`;
  }).join('');

  const html = `<div style="font-family:Arial;max-width:600px;margin:0 auto">
<div style="background:linear-gradient(135deg,#4e7264,#7a9e8e);padding:20px;border-radius:8px 8px 0 0">
<div style="color:#fff;font-size:16px">🌸 Анкета качества — Отделение новорождённых</div>
<div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:4px">${date_time || ''} · Анонимно</div>
</div>
<table style="width:100%;border-collapse:collapse">
<tr style="background:#e8f0ec"><th style="padding:8px 12px;font-size:11px;color:#4e7264;text-align:left">#</th><th style="padding:8px 12px;font-size:11px;color:#4e7264;text-align:left">Вопрос</th><th style="padding:8px 12px;font-size:11px;color:#4e7264;text-align:left">Ответ</th></tr>
${rows}
</table></div>`;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"Анкета ХНВ" <${process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL,
      subject: subject || `Анкета — ${date_time}`,
      html,
      text: answers_text || ''
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
