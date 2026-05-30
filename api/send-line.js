// api/send-line.js
const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { userId, vision, message, lifestyle, worry, stress } = req.body;

  if (!userId || !vision || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return res.status(500).json({ error: 'LINE token not configured' });
  }

  const lifestyleLabels = ['デスクワーク中心', '立ち仕事中心', '家事・育児で動き回っている'];
  const worryLabels = ['太もものセルライト・横の張り', '冷えが酷く、何をしても温まらない', '全体は痩せたのに脚だけ残っている'];
  const stressLabels = ['穏やか', '低い', '普通', '高い', '限界'];

  const characterNames = {
    "0-0-1": "Dreaming Bunny", "0-0-2": "Fluffy Bunny",     "0-0-3": "Cloudy Bunny",
    "0-0-4": "Rainy Bunny",    "0-0-5": "Thunder Bunny",
    "0-1-1": "Cozy Bunny",     "0-1-2": "Warm Bunny",       "0-1-3": "Chilly Bunny",
    "0-1-4": "Frozen Bunny",   "0-1-5": "Blizzard Bunny",
    "0-2-1": "Balance Bunny",  "0-2-2": "Star Bunny",       "0-2-3": "Ribbon Bunny",
    "0-2-4": "Cloudy Star Bunny", "0-2-5": "Miracle Bunny",
    "1-0-1": "Sunny Cat",      "1-0-2": "Graceful Cat",     "1-0-3": "Tired Cat",
    "1-0-4": "Weary Cat",      "1-0-5": "Storm Cat",
    "1-1-1": "Warm Cat",       "1-1-2": "Cozy Cat",         "1-1-3": "Chilly Cat",
    "1-1-4": "Cold Cat",       "1-1-5": "Frozen Cat",
    "1-2-1": "Balance Cat",    "1-2-2": "Starlight Cat",    "1-2-3": "Mooncat",
    "1-2-4": "Cloudy Cat",     "1-2-5": "Midnight Cat",
    "2-0-1": "Happy Bear",     "2-0-2": "Gentle Bear",      "2-0-3": "Busy Bear",
    "2-0-4": "Tired Mama Bear","2-0-5": "Exhausted Bear",
    "2-1-1": "Warm Mama Bear", "2-1-2": "Cozy Bear",        "2-1-3": "Chilly Bear",
    "2-1-4": "Cold Mama Bear", "2-1-5": "Frozen Bear",
    "2-2-1": "Balance Bear",   "2-2-2": "Star Mama Bear",   "2-2-3": "Ribbon Bear",
    "2-2-4": "Cloudy Bear",    "2-2-5": "Miracle Bear",
  };

  const key = `${lifestyle}-${worry}-${stress}`;
  const charName = characterNames[key] || '';
  const charImageUrl = `https://raw.githubusercontent.com/akira-ordinal/briant-liff/main/images/${key}.png`;

  const flexMessage = {
    type: 'flex',
    altText: `🔮 ${charName} タイプ — あなたの脚やせ診断結果が届きました`,
    contents: {
      type: 'bubble',
      size: 'giga',
      // ヒーロー：キャラクター画像
      hero: {
        type: 'image',
        url: charImageUrl,
        size: 'full',
        aspectRatio: '1:1',
        aspectMode: 'cover',
        backgroundColor: '#f7f3ec',
      },
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${charName} タイプ`,
            weight: 'bold',
            size: 'lg',
            color: '#e5c98e',
          },
          {
            type: 'text',
            text: '🔮 10年後の未来予測',
            size: 'sm',
            color: '#aabbd0',
            margin: 'sm',
          }
        ],
        backgroundColor: '#1a2a40',
        paddingAll: '20px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          // 診断条件
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: '📋 診断条件', size: 'xs', color: '#888888', weight: 'bold' },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  { type: 'text', text: `ライフスタイル：${lifestyleLabels[lifestyle] || '-'}`, size: 'xs', color: '#555555', wrap: true },
                  { type: 'text', text: `お悩み：${worryLabels[worry] || '-'}`, size: 'xs', color: '#555555', wrap: true, margin: 'xs' },
                  { type: 'text', text: `ストレス度：${stressLabels[stress - 1] || '-'}`, size: 'xs', color: '#555555', wrap: true, margin: 'xs' }
                ],
                margin: 'sm'
              }
            ],
            backgroundColor: '#f7f3ec',
            cornerRadius: '10px',
            paddingAll: '14px',
          },
          { type: 'separator', margin: 'lg', color: '#e1d4bc' },
          // 未来予測
          { type: 'text', text: '✨ 未来予測', size: 'xs', color: '#b5945d', weight: 'bold', margin: 'lg' },
          { type: 'text', text: vision, size: 'sm', color: '#3d2e1f', wrap: true, margin: 'sm' },
          { type: 'separator', margin: 'lg', color: '#e1d4bc' },
          // カウンセラーメッセージ
          { type: 'text', text: '💬 カウンセラーより', size: 'xs', color: '#888888', weight: 'bold', margin: 'lg' },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: message, size: 'sm', color: '#ffffff', wrap: true }
            ],
            backgroundColor: '#1a2a40',
            cornerRadius: '10px',
            paddingAll: '14px',
            margin: 'sm'
          }
        ],
        paddingAll: '20px',
        spacing: 'none'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '特別体験コースを予約する',
              uri: 'https://liff.line.me/2009794603-Qd1GnsD7/landing?follow=%40364olmeq&lp=wW3XOe&liff_id=2009794603-Qd1GnsD7'
            },
            style: 'primary',
            color: '#b5945d',
            height: 'md'
          },
          { type: 'text', text: '© P.U SERVICE CO.,LTD.', size: 'xxs', color: '#bbbbbb', align: 'center', margin: 'md' }
        ],
        paddingAll: '16px',
        backgroundColor: '#fdfbf7'
      }
    }
  };

  try {
    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify({ to: userId, messages: [flexMessage] })
    });

    if (!lineRes.ok) {
      const errText = await lineRes.text();
      console.error('LINE API error:', errText);
      return res.status(500).json({ error: 'LINE API error', detail: errText });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = handler;
