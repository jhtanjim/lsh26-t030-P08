'use client';
import { api, ResultTrace } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StudentTrace() {
  const params = useParams();
  const id = Number(params.id);
  const [trace, setTrace] = useState<ResultTrace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrace(id).then((data) => {
      setTrace(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto p-8 text-gray-500">Loading...</div>;
  if (!trace) return <div className="max-w-4xl mx-auto p-8">Not found</div>;

  const isFail = trace.finalGrade === 'F';

  return (
    <main className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <Link href="/" className="text-indigo-600 hover:underline text-sm">&larr; Back to students</Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{trace.name}</h1>
          <p className="text-gray-500 text-sm">Class {trace.className} · Student ID {trace.studentId}</p>
        </div>
        <span className={`px-4 py-2 rounded-lg text-lg font-bold ${isFail ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {trace.finalGpa.toFixed(2)} · {trace.finalGrade}
        </span>
      </div>

      {trace.failureReason && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm font-medium">
          ⚠ {trace.failureReason}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              <th className="p-3 font-semibold">Subject</th>
              <th className="p-3 font-semibold">Theory</th>
              <th className="p-3 font-semibold">Practical</th>
              <th className="p-3 font-semibold">Total</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">GP</th>
              <th className="p-3 font-semibold">Rule</th>
            </tr>
          </thead>
          <tbody>
            {trace.subjects.map((s) => (
              <tr key={s.code} className={`border-t border-gray-100 ${s.status === 'FAIL' ? 'bg-red-50' : s.status === 'ABSENT' ? 'bg-yellow-50' : ''}`}>
                <td className="p-3 font-medium">{s.code}{!s.isCompulsory && <span className="ml-1 text-xs text-gray-400">(opt)</span>}</td>
                <td className="p-3">{s.isAbsent ? <span className="text-yellow-700 font-medium">AB</span> : s.theoryMark}</td>
                <td className="p-3">{s.hasPractical ? (s.isAbsent ? <span className="text-yellow-700 font-medium">AB</span> : s.practicalMark) : '—'}</td>
                <td className="p-3">{s.isAbsent ? 'AB' : s.totalMark}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    s.status === 'PASS' ? 'bg-green-100 text-green-700' :
                    s.status === 'FAIL' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{s.status}</span>
                </td>
                <td className="p-3 font-semibold">{s.gradePoint}</td>
                <td className="p-3 text-xs text-gray-500">{s.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5 border border-gray-200">
        <p className="flex justify-between"><span className="text-gray-500">Compulsory GP Sum</span><span className="font-medium">{trace.compulsoryGradePointSum}</span></p>
        <p className="flex justify-between"><span className="text-gray-500">Optional GP</span><span className="font-medium">{trace.optionalGradePoint}</span></p>
        <p className="flex justify-between"><span className="text-gray-500">Optional Bonus</span><span className="font-medium">{trace.optionalBonus}</span></p>
        <p className="flex justify-between"><span className="text-gray-500">Uncancelled GPA</span><span className="font-medium">{trace.uncancelledGpa.toFixed(2)}</span></p>
        <div className="border-t border-gray-200 my-2"></div>
        <p className="flex justify-between text-base"><span className="font-semibold">Final GPA</span><span className="font-bold">{trace.finalGpa.toFixed(2)} ({trace.finalGrade})</span></p>
      </div>
    </main>
  );
}