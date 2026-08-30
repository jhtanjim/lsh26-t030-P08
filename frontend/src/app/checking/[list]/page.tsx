'use client';
import { api, CheckingRow, downloadCsv } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const TITLES: Record<string, string> = {
  optional: 'Optional Subject Checking List',
  'practical-fail': 'Practical Fail Checking List',
  absent: 'Absent Checking List',
};

export default function CheckingList() {
  const params = useParams();
  const list = params.list as string;
  const [rows, setRows] = useState<CheckingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher =
      list === 'optional' ? api.getOptionalList :
      list === 'practical-fail' ? api.getPracticalFailList :
      api.getAbsentList;
    fetcher().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, [list]);

  if (loading) return <div className="max-w-4xl mx-auto p-8 text-gray-500">Loading...</div>;

  return (
    <main className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <Link href="/" className="text-indigo-600 hover:underline text-sm">&larr; Back</Link>
      <div className="flex items-center justify-between mt-3 mb-6">
        <h1 className="text-xl font-bold">{TITLES[list] || 'Checking List'} ({rows.length})</h1>
        <button
          onClick={() => downloadCsv(`${list}-checking-list.csv`, rows)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              <th className="p-3 font-semibold">ID</th>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Class</th>
              <th className="p-3 font-semibold">Subject</th>
              <th className="p-3 font-semibold">Reason/Mark</th>
              <th className="p-3 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3">{r.studentId}</td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.className}</td>
                <td className="p-3">{r.subject}</td>
                <td className="p-3 text-gray-500">{r.reason ?? r.practicalMark ?? '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.finalResult === 'F' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.finalResult}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="text-gray-400 mt-4 text-center py-8">No students on this list.</p>}
    </main>
  );
}