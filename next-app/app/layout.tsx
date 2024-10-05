// src/app/layout.tsx

import './styles/globals.css';

export const metadata = {
    title: 'Simple Online Judge',
    description: '問題を解いてコードを提出',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
        <body>{children}</body>
        </html>
    );
}