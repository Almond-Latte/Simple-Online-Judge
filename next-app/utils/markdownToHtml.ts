import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';  // GitHub Flavored Markdownのサポート
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from 'rehype-prism-plus'; // シンタックスハイライト

export const markdownToHtml = async (markdown: string): Promise<string> => {
    const result = await unified()
        .use(remarkParse)   // Markdownを解析
        .use(remarkGfm)     // GitHub Flavored Markdownをサポート
        .use(remarkRehype)  // HTMLに変換
        .use(rehypeSlug)    // 見出しにスラッグを追加
        .use(rehypePrism)   // シンタックスハイライト
        .use(rehypeStringify) // HTMLにシリアライズ
        .process(markdown);

    return result.toString();
};