import React, { useRef, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { UploadCloud, Star, Download } from 'lucide-react';

export default function AiScoreUI() {
  const fileInputRef = useRef(null);
  const [radarData, setRadarData] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await (await import('../api/score')).getAIScore(base64);
      const parsed = parseAIScore(res);
      if (parsed) {
        setRadarData(parsed.dimensions);
        setTotalScore(parsed.total);
        setFeedbacks(parsed.feedbacks);
      }
    };
    reader.readAsDataURL(file);
  };

  const parseAIScore = (text: string) => {
    const regex = /(\w+)[:：]\s*(\d+(\.\d+)?)/g;
    const dimensions = [];
    const feedbacks = [];
    let match;
    let total = 0;
    while ((match = regex.exec(text)) !== null) {
      dimensions.push({ dimension: match[1], score: parseFloat(match[2]), fullMark: 5 });
      total += parseFloat(match[2]);
    }
    total = Math.round((total / dimensions.length) * 20);
    text.split('\n').forEach(line => {
      if (line.includes('建议')) feedbacks.push(line.trim());
    });
    return { dimensions, feedbacks, total };
  };

  return (
    <div className="p-6 space-y-8">
      <div className="border-dashed border-2 border-gray-300 h-60 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50" onClick={handleUploadClick}>
        <UploadCloud className="w-10 h-10 mb-2" />
        <p className="text-lg font-semibold">拖拽图片到此处，或点击上传</p>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">上传图片</button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="p-6 border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" /> 总评分：{totalScore} / 100
        </h2>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div className="h-2 bg-green-500 rounded" style={{ width: `${totalScore}%` }}></div>
        </div>
      </div>

      <div className="p-6 border">
        <h3 className="text-lg font-semibold mb-4">评分维度雷达图</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar name="得分" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {radarData.map((item, idx) => (
        <div key={idx} className="p-4 border">
          <h4 className="font-semibold text-base mb-2">{item.dimension}：{item.score} 分</h4>
          <p className="text-sm text-gray-600">{feedbacks[idx] || '暂无建议'}</p>
        </div>
      ))}

      <div className="flex justify-end">
        <button className="flex gap-2 bg-gray-200 px-4 py-2 rounded">
          <Download className="w-4 h-4" /> 下载评分报告
        </button>
      </div>
    </div>
  );
}
