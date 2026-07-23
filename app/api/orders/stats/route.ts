import { NextResponse } from 'next/server';
import { orders } from '@/data/mockData';

export async function GET() {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const paidCount = orders.filter((o) => o.status === 'paid').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const countryStats = orders.reduce((acc, order) => {
    acc[order.country] = (acc[order.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    totalOrders,
    totalRevenue: totalRevenue.toFixed(2),
    pendingCount,
    paidCount,
    shippedCount,
    deliveredCount,
    countryStats,
  });
}
