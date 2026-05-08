import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import type { Order } from '../../types/order';
import { OrderSide, OrderStatus, OrderType } from '../../types/order';

export function Orders() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [symbolFilter, setSymbolFilter] = useState('');
  const [sideFilter, setSideFilter] = useState<OrderSide | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const ordersQuery = useQuery<Order[]>({
    queryKey: ['orders'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      // TODO: Add listOrders API method when backend supports it
      // For now, we'll show empty state
      return [];
    },
  });

  const filteredOrders = ordersQuery.data?.filter((order) => {
    const matchesSymbol = symbolFilter === '' || order.symbol.toLowerCase().includes(symbolFilter.toLowerCase());
    const matchesSide = sideFilter === 'all' || order.side === sideFilter;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSymbol && matchesSide && matchesStatus;
  }) ?? [];

  return (
    <section id="orders-page" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View all trading orders across your bots including market and limit orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Symbol</span>
              <input
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                placeholder="BTCUSDT"
                value={symbolFilter}
                onChange={(event) => setSymbolFilter(event.target.value)}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Side</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={sideFilter}
                onChange={(event) => setSideFilter(event.target.value as OrderSide | 'all')}
              >
                <option value="all">all</option>
                <option value={OrderSide.BUY}>buy</option>
                <option value={OrderSide.SELL}>sell</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Status</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as OrderStatus | 'all')}
              >
                <option value="all">all</option>
                <option value={OrderStatus.PENDING}>pending</option>
                <option value={OrderStatus.SUBMITTED}>submitted</option>
                <option value={OrderStatus.ACCEPTED}>accepted</option>
                <option value={OrderStatus.FILLED}>filled</option>
                <option value={OrderStatus.PARTIALLY_FILLED}>partially_filled</option>
                <option value={OrderStatus.CANCELLED}>cancelled</option>
                <option value={OrderStatus.REJECTED}>rejected</option>
                <option value={OrderStatus.FAILED}>failed</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredOrders.length} orders
            </p>
            <Button variant="ghost" onClick={() => void ordersQuery.refetch()}>
              Refresh
            </Button>
          </div>

          {/* Orders Table */}
          {ordersQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading orders...</p>
          ) : ordersQuery.error ? (
            <p className="text-sm text-rose-300">{ordersQuery.error.message}</p>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-2">
              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-800 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge tone={order.side === OrderSide.BUY ? 'success' : 'danger'}>
                          {order.side}
                        </Badge>
                        <span className="text-lg font-semibold text-white">{order.symbol}</span>
                        <Badge tone="neutral">{order.orderType}</Badge>
                        <Badge
                          tone={
                            order.status === OrderStatus.FILLED ? 'success' :
                            order.status === OrderStatus.CANCELLED ? 'warning' :
                            order.status === OrderStatus.REJECTED || order.status === OrderStatus.FAILED ? 'danger' :
                            'info'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span>Qty: {formatNumber(order.quantity)}</span>
                        {order.price && <span>Price: {formatCurrency(order.price)}</span>}
                        <span>Bot: {order.botId.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      {order.exchangeOrderId && (
                        <p className="text-xs text-slate-500 font-mono">
                          {order.exchangeOrderId.slice(0, 12)}...
                        </p>
                      )}
                      <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                No orders found. Orders will appear here when your bots execute trades.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
