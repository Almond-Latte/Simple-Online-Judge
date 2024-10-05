import { markdownToHtml } from '@/utils/markdownToHtml';
import fs from 'fs';
import path from 'path';
import 'github-markdown-css/github-markdown.css'; // GitHubのMarkdownスタイルをインポート
import ProblemForm from './ProblemForm';

interface ProblemPageProps {
    params: {
        id: string;
    };
}

const ProblemPage = async ({ params }: ProblemPageProps) => {
    const { id } = params;

    // Markdownファイルのパス
    const markdownFilePath = path.join(process.cwd(), 'problems', `problem${id}.md`);

    // Markdownファイルが存在するかチェック
    if (!fs.existsSync(markdownFilePath)) {
        return <div>問題が見つかりませんでした。</div>;
    }

    // Markdownファイルの内容を読み込む
    const markdown = fs.readFileSync(markdownFilePath, 'utf-8');

    // MarkdownをHTMLに変換
    const htmlContent = await markdownToHtml(markdown);

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-8">
            <div className="w-full max-w-3xl bg-white p-8 shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold mb-4">問題 {id}</h1>

                {/* GitHubスタイルのMarkdownを適用 */}
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />

                {/* 問題の提出フォーム */}
                <ProblemForm problemId={id} />

            </div>
        </div>
    );
};

export default ProblemPage;