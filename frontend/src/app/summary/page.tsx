'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Summary = {
  totalStudents: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
  subjectFailCounts: Record<string, number>;
  worstSubject: { code: string; failCount: number } | null;
};

export default function SummaryPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/checking/summary`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto p-8 text-gray-500">Loading...</div>;
  if (!summary) return <div className="max-w-2xl mx-auto p-8">Failed to load</div>;

  return (
    <main className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <Link href="/" className="text-indigo-600 hover:underline text-sm">&larr; Back</Link>
      <h1 className="text-2xl font-bold mt-3 mb-6">Class Summary</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-500 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-indigo-700">{summary.totalStudents}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Pass Rate</p>
          <p className="text-3xl font-bold text-green-700">{summary.passRate}%</p>
        </div>
      </div>

      <h2 className="font-semibold mb-2 text-gray-700">Grade Distribution</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {Object.entries(summary.gradeDistribution).map(([grade, count]) => (
              <tr key={grade} className="border-t border-gray-100 first:border-t-0">
                <td className="p-3 font-semibold">{grade}</td>
                <td className="p-3 text-gray-600">{count} students</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-semibold mb-2 text-gray-700">Subject Fail Counts</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {Object.entries(summary.subjectFailCounts).map(([code, count]) => (
              <tr key={code} className="border-t border-gray-100 first:border-t-0">
                <td className="p-3 font-semibold">{code}</td>
                <td className="p-3 text-gray-600">{count} failures</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summary.worstSubject && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="font-semibold text-red-700">
            Subject with most failures: {summary.worstSubject.code} ({summary.worstSubject.failCount} students)
          </p>
        </div>
      )}
    </main>
  );
}