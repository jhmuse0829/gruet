import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "돈그릇 | 12월 목표 프로젝트",
  description: "돈그릇 멤버들의 목표를 기록하고 함께 실행하는 공간",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
