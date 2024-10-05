import Link from 'next/link';
import type { NextPage } from 'next';

interface Problem {
  id: number;
  title: string;
}

const Home: NextPage = () => {
  const problems: Problem[] = [
    { id: 1, title: 'Sum of Two Numbers' },
    { id: 2, title: 'Reverse a String' },
    // 追加の問題をここに
  ];

  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6">問題リスト</h1>
          <ul className="space-y-4">
            {problems.map((problem) => (
                <li key={problem.id} className="bg-gray-200 hover:bg-gray-300 rounded-lg p-4 transition">
                  <Link href={`/problems/${problem.id}`} className="text-blue-600 font-semibold hover:underline">
                    {problem.title}
                  </Link>
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
};

export default Home;