'use client';
import { api, Student } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.getStudents().then((data) => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        String(s.roll).includes(q),
    );
  }, [students, query]);

  if (loading) return <div className="max-w-5xl mx-auto p-8 text-gray-500">Loading...</div>;

  return (
    <main className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/checking/optional" className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium transition">Optional Checking</Link>
        <Link href="/checking/practical-fail" className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition">Practical Fail</Link>
        <Link href="/checking/absent" className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-sm font-medium transition">Absent List</Link>
        <Link href="/summary" className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition">Class Summary</Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Students ({filtered.length})</h2>
        <input
          type="text"
          placeholder="Search by name, roll, or class..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              <th className="p-3 font-semibold">Roll</th>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Class</th>
              <th className="p-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                <td className="p-3">{s.roll}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{s.className}</span>
                </td>
                <td className="p-3">
                  <Link href={`/students/${s.id}`} className="text-indigo-600 hover:underline font-medium">View Trace →</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">No matching students.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}