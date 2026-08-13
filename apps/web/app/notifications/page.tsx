import React from 'react';
import Link from 'next/link';
import { BasisProvider } from '@basis-forum/ui';
import { Box, Button, Paper, Typography } from '@mui/material';
import { getNotifications } from '@basis-forum/database';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClientLayout from '../components/ClientLayout';
import { markNotificationsReadAction } from '../actions/community';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');

  const notifications = await getNotifications(userId);
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <BasisProvider>
      <ClientLayout user={session?.user}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Notifications</Typography>
            <Typography color="text.secondary">{unreadCount} unread update{unreadCount === 1 ? '' : 's'} from your discussions.</Typography>
          </Box>
          {unreadCount > 0 ? <form action={markNotificationsReadAction}><Button type="submit" variant="outlined">Mark all as read</Button></form> : null}
        </Box>

        {notifications.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}><Typography>No notifications yet. Join a discussion to start receiving updates.</Typography></Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {notifications.map((notification) => (
              <Link key={notification.id} href={notification.threadId ? `/threads/${notification.thread?.slug || ''}` : '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Paper sx={{ p: 2.5, borderRadius: 2.5, borderLeft: '4px solid', borderLeftColor: notification.readAt ? 'transparent' : 'primary.main', bgcolor: notification.readAt ? 'background.paper' : '#f5fbff' }}>
                  <Typography variant="body1" sx={{ fontWeight: notification.readAt ? 500 : 800 }}>{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}</Typography>
                </Paper>
              </Link>
            ))}
          </Box>
        )}
      </ClientLayout>
    </BasisProvider>
  );
}
