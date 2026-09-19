import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Verification | Voice Culture',
  robots: { index: false, follow: false },
};

export default function VerifyReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
