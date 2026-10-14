// Función serverless de Vercel: lee el CSV publicado de Google Sheets y lo entrega al navegador.
// Evita problemas de CORS y cachea la respuesta 5 minutos en el borde de Vercel.
// Opcional: define la variable de entorno SHEET_CSV_URL en Vercel para cambiar de hoja sin tocar el código.

const DEFAULT_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZhG16c6gNzf_76m8fnRuDOnFbYdnDDvr-9PnoEiQOVQLL30TvE44RYisrBVXTUeuZFXvD6Mtqt7ht/pub?output=csv';

module.exports = async function handler(req, res) {
  const url = process.env.SHEET_CSV_URL || DEFAULT_URL;
  try {
    const upstream = await fetch(url, { redirect: 'follow' });
    if (!upstream.ok) throw new Error('Google Sheets respondió ' + upstream.status);
    const csv = await upstream.text();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    // 5 min en caché; si Google falla, sirve la última copia hasta 1 hora.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.status(200).send(csv);
  } catch (err) {
    res.status(502).json({ error: 'No se pudo leer la hoja de ventas', detail: String((err && err.message) || err) });
  }
};
