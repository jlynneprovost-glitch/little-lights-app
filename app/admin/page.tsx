import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const metadata = {
  title: 'Story Studio · Little Lights',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
