// api/send-line.js
// Vercel Serverless Function
// LINE Messaging API でユーザーのトーク画面に診断結果を送信する

export default async function handler(req, res) {
  // CORS ヘッダー（GitHub Pages など別オリジンからの呼び出しを許可）
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

  // ラベル変換
  const lifestyleLabels = ['デスクワーク中心', '立ち仕事中心', '家事・育児で動き回っている'];
  const worryLabels = ['太もものセルライト・横の張り', '冷えが酷く、何をしても温まらない', '全体は痩せたのに脚だけ残っている'];
  const stressLabels = ['穏やか', '低い', '普通', '高い', '限界'];

  // LINEに送るメッセージ（Flex Message でリッチに表示）
  const flexMessage = {
    type: 'flex',
    altText: '🔮 あなたの脚やせ診断結果が届きました',
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🔮 10年後の未来予測',
            weight: 'bold',
            size: 'sm',
            color: '#e5c98e'
          },
          {
            type: 'text',
            text: '脚やせAI診断結果',
            weight: 'bold',
            size: 'xl',
            color: '#ffffff',
            margin: 'sm'
          }
        ],
        backgroundColor: '#1a2a40',
        paddingAll: '20px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          // 診断条件サマリー
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '📋 診断条件',
                size: 'xs',
                color: '#888888',
                weight: 'bold'
              },
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
            margin: 'none'
          },
          // 区切り
          { type: 'separator', margin: 'lg', color: '#e1d4bc' },
          // 未来予測
          {
            type: 'text',
            text: '✨ 未来予測',
            size: 'xs',
            color: '#b5945d',
            weight: 'bold',
            margin: 'lg'
          },
          {
            type: 'text',
            text: vision,
            size: 'sm',
            color: '#3d2e1f',
            wrap: true,
            margin: 'sm',
            lineSpacing: '6px'
          },
          // 区切り
          { type: 'separator', margin: 'lg', color: '#e1d4bc' },
          // カウンセラーメッセージ
          {
            type: 'text',
            text: '💬 カウンセラーより',
            size: 'xs',
            color: '#888888',
            weight: 'bold',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: message,
                size: 'sm',
                color: '#ffffff',
                wrap: true,
                lineSpacing: '6px'
              }
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
          {
            type: 'text',
            text: '© P.U SERVICE CO.,LTD.',
            size: 'xxs',
            color: '#bbbbbb',
            align: 'center',
            margin: 'md'
          }
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
      body: JSON.stringify({
        to: userId,
        messages: [flexMessage]
      })
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
}
