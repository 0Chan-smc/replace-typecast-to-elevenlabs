import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "세마리토끼 Typecast를 ElevenLabs로 대체",
  description: "ElevenLabs API를 사용한 텍스트 음성 변환 서비스",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;