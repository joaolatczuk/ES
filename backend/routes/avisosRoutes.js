// routes/avisosRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../dbFunctions/db');

/**
 * Converte "1 dia", "2 dias", "2 semana(s)", "4 semana(s)" em dias (Number).
 * Padrões inesperados caem para 7 dias.
 */
function parseRegaToDays(rega) {
  if (!rega || typeof rega !== 'string') return 7;
  const str = rega.trim().toLowerCase();
  const numMatch = str.match(/(\d+)/);
  const n = numMatch ? parseInt(numMatch[1], 10) : 1;
  if (str.includes('semana')) return n * 7;
  if (str.includes('dia')) return n;
  return 7;
}

function iso(d) {
  // normaliza para meia-noite local; se preferir UTC, adapte para Date.UTC
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

/**
 * GET /api/avisos/:idUsuario?year=2025&month=10
 * Retorna um mapa de dias do mês com os avisos de rega baseados em favoritos ativos,
 * incluindo marcação de "done" por favorito.
 * status do dia:
 *  - "overdue"  => já passou a data de rega (vermelho)
 *  - "due"      => hoje
 *  - "upcoming" => futuro dentro do mês
 */
router.get('/:idUsuario', async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    if (Number.isNaN(idUsuario)) {
      return res.status(400).json({ error: 'idUsuario inválido' });
    }

    const now = new Date();
    const year = parseInt(req.query.year ?? now.getFullYear(), 10);
    const month = parseInt(req.query.month ?? (now.getMonth() + 1), 10); // 1..12

    if (year < 1970 || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Parâmetros de data inválidos' });
    }

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1); // primeiro dia do mês seguinte
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Busca favoritos ativos do usuário + conteudos aprovados
    const [rows] = await db.query(
      `SELECT
         f.id             AS id_favorito,
         f.id_conteudo,
         f.data_favorito,
         c.nomePlanta,
         c.rega,
         c.status,
         c.statusAtivo
       FROM favoritos f
       INNER JOIN conteudos c ON c.id = f.id_conteudo
       WHERE f.id_usuario = ?
         AND f.statusAtivo = 1
         AND c.statusAtivo = 1
         AND c.status = 'aprovado'`,
      [idUsuario]
    );

    // Busca atividades já realizadas neste mês (para marcar done/toggle)
    const [doneRows] = await db.query(
      `SELECT id_favorito, data_atividade
         FROM atividades_realizadas
        WHERE id_usuario = ?
          AND data_atividade >= ?
          AND data_atividade < ?`,
      [idUsuario, iso(monthStart), iso(monthEnd)]
    );
    const doneSet = new Set(doneRows.map(r => `${r.id_favorito}|${iso(r.data_atividade)}`));

    // Monta o mapa de avisos por dia: { 'YYYY-MM-DD': { status, items: [] } }
    const daysMap = {};
    const MS_DAY = 24 * 60 * 60 * 1000;

    for (const r of rows) {
      const intervalDays = parseRegaToDays(r.rega);
      if (intervalDays <= 0) continue;

      const anchor = new Date(r.data_favorito || Date.now());
      anchor.setHours(0, 0, 0, 0);

      const deltaDays = Math.floor((monthStart - anchor) / MS_DAY);
      const steps = Math.max(0, Math.floor(deltaDays / intervalDays));
      const first = new Date(anchor);
      first.setDate(first.getDate() + steps * intervalDays);

      let cur = first < monthStart ? new Date(first.getTime() + intervalDays * MS_DAY) : first;

      while (cur < monthEnd) {
        const k = iso(cur);

        // status do dia
        const status =
          cur < today ? 'overdue' :
          cur.getTime() === today.getTime() ? 'due' : 'upcoming';

        if (!daysMap[k]) {
          daysMap[k] = { status, items: [] };
        } else {
          const rank = { overdue: 3, due: 2, upcoming: 1 };
          if (rank[status] > rank[daysMap[k].status]) {
            daysMap[k].status = status;
          }
        }

        daysMap[k].items.push({
          id_favorito: r.id_favorito,
          id_conteudo: r.id_conteudo,
          nomePlanta: r.nomePlanta,
          rega: r.rega,
          intervaloDias: intervalDays,
          done: doneSet.has(`${r.id_favorito}|${k}`)
        });

        cur = new Date(cur.getTime() + intervalDays * MS_DAY);
      }
    }

    res.json({
      year,
      month,
      days: daysMap
    });
  } catch (err) {
    console.error('Erro em GET /api/avisos:', err);
    res.status(500).json({ error: 'Erro ao gerar avisos' });
  }
});

/**
 * POST /api/avisos/realizar
 * Marca atividade como realizada (idUsuario, idFavorito, data)
 * Body JSON: { idUsuario: number, idFavorito: number, data: 'YYYY-MM-DD' }
 */
router.post('/realizar', async (req, res) => {
  try {
    const { idUsuario, idFavorito, data } = req.body || {};
    if (!idUsuario || !idFavorito || !data) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: idUsuario, idFavorito, data' });
    }

    await db.query(
      `INSERT IGNORE INTO atividades_realizadas (id_usuario, id_favorito, data_atividade)
       VALUES (?, ?, ?)`,
      [idUsuario, idFavorito, data]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/avisos/realizar:', err);
    res.status(500).json({ error: 'Erro ao registrar atividade' });
  }
});

/**
 * DELETE /api/avisos/realizar?idUsuario=...&idFavorito=...&data=YYYY-MM-DD
 * Desfaz a marcação de atividade realizada
 */
router.delete('/realizar', async (req, res) => {
  try {
    const { idUsuario, idFavorito, data } = req.query || {};
    if (!idUsuario || !idFavorito || !data) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: idUsuario, idFavorito, data' });
    }

    await db.query(
      `DELETE FROM atividades_realizadas
        WHERE id_usuario = ? AND id_favorito = ? AND data_atividade = ?`,
      [idUsuario, idFavorito, data]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/avisos/realizar:', err);
    res.status(500).json({ error: 'Erro ao desfazer atividade' });
  }
});

module.exports = router;