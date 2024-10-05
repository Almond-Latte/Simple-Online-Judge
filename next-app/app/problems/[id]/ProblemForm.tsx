'use client'; // クライアントコンポーネントとして宣言

import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python'; // Pythonのシンタックスハイライトをサポート
import '@/app/styles/prism-atom-dark.css'; // Atom Darkのテーマをインポート

interface TestResult {
    input: string;
    expected_output: string;
    actual_output: string;
    passed: boolean;
}

interface ProblemFormProps {
    problemId: string;
}

const ProblemForm = ({ problemId }: ProblemFormProps) => {
    const [code, setCode] = useState<string>(''); // ユーザーが入力するコード
    const [testResults, setTestResults] = useState<TestResult[]>([]); // テスト結果
    const [error, setError] = useState<string>(''); // エラーメッセージ
    const [allTestsPassed, setAllTestsPassed] = useState<boolean>(false); // 全てのテストが合格したかどうか
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 提出中かどうか

    // シンタックスハイライト用の関数
    const highlightCode = (code: string) => {
        return Prism.highlight(code, Prism.languages.python, 'python');
    };

    // コードの行番号を生成する関数
    const generateLineNumbers = (code: string) => {
        return code.split('\n').map((_, index) => index + 1).join('\n');
    };

    // コードの提出処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setTestResults([]);
        setAllTestsPassed(false);
        setIsSubmitting(true); // 提出中状態に変更

        try {
            // FastAPIのエンドポイントに直接リクエスト
            const response = await fetch('http://localhost:8000/api/submit', { // FastAPIのURLに変更
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, problemId }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || '提出に失敗しました。');
            } else {
                setTestResults(data.results); // テスト結果をセット
                setAllTestsPassed(data.allTestsPassed); // すべてのテスト合格かどうかをセット
            }
        } catch (err) {
            setError('ネットワークエラーが発生しました。');
        } finally {
            setIsSubmitting(false); // 提出処理完了後にボタンを元に戻す
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex bg-gray-800 rounded-lg overflow-hidden">
                {/* 行番号 */}
                <div className="bg-gray-700 text-gray-400 p-2 text-right select-none"
                     style={{ fontFamily: '"Inconsolata", Monaco, Consolas, "Courier New", Courier, monospace', fontSize: 16, lineHeight: '1.5' }}>
                    <pre>{generateLineNumbers(code)}</pre>
                </div>

                {/* シンタックスハイライト付きのコードエディタ */}
                <div className="flex-grow px-2">
                    <Editor
                        value={code}
                        onValueChange={setCode}
                        highlight={highlightCode}
                        padding={8}
                        style={{
                            fontFamily: '"Inconsolata", Monaco, Consolas, "Courier New", Courier, monospace',
                            fontSize: 16,
                            lineHeight: '1.5', // 行の高さを設定してエディタと行番号を揃える
                            minHeight: '200px',
                            color: '#c5c8c6',
                        }}
                    />
                </div>
            </div>

            {/* 提出ボタンの状態を動的に変更 */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                {isSubmitting ? 'ジャッジ中...' : '提出'}
            </button>

            {/* 結果の表示 */}
            {allTestsPassed && <p className="text-green-500 mt-4">すべてのテストに合格しました！</p>}
            {!allTestsPassed && testResults.length > 0 && <p className="text-red-500 mt-4">一部のテストケースに失敗しました。</p>}

            {/* テスト結果の詳細を表示 */}
            {testResults.map((result, index) => (
                <div key={index} className="mt-4">
                    <p>テストケース {index + 1}:</p>
                    <p>入力: {result.input}</p>
                    <p>期待される出力: {result.expected_output}</p>
                    <p>実際の出力: {result.actual_output}</p>
                    <p>結果: {result.passed ? '合格' : '不合格'}</p>
                    <hr className="mt-2" />
                </div>
            ))}

            {/* エラーメッセージ */}
            {error && <p className="text-red-500 mt-4">エラー: {error}</p>}
        </form>
    );
};

export default ProblemForm;
