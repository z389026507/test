import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Star, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { getAIScore } from '../api/score';

export default function AiScoreUI() {
  const fileInputRef = useRef(null);
  const [radarData, setRadarData] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await getAIScore(base64);
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
    total = Math.round((total / dimensions.length) * 20); // scale to 100
    text.split('\n').forEach(line => {
      if (line.includes('建议')) feedbacks.push(line.trim());
    });
    return { dimensions, feedbacks, total };
  };

  return (
    <div className="p-6 space-y-8">
      <Card className="border-dashed border-2 border-gray-300 h-60 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50" onClick={handleUploadClick}>
        <UploadCloud className="w-10 h-10 mb-2" />
        <p className="text-lg font-semibold">拖拽图片到此处，或点击上传</p>
        <Button className="mt-4">上传图片</Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" /> 总评分：{totalScore} / 100
        </h2>
        <Progress value={totalScore} />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">评分维度雷达图</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar name="得分" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {radarData.map((item, idx) => (
        <Card key={idx} className="p-4">
          <h4 className="font-semibold text-base mb-2">{item.dimension}：{item.score} 分</h4>
          <p className="text-sm text-gray-600">{feedbacks[idx] || '暂无建议'}</p>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button className="flex gap-2">
          <Download className="w-4 h-4" /> 下载评分报告
        </Button>
      </div>
    </div>
  );
}
