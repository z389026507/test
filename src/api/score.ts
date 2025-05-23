export async function getAIScore(imageBase64: string) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `请对以下图片进行视觉评分，维度包括：构图排版、色彩系统、字体风格、人物素材、字数控制、安全风控。返回每项0-5分，并附简评。图片数据为base64：${imageBase64.slice(0, 500)}...`
        }
      ]
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "评分失败";
}
