import { syncEmailDeliveries } from '../server/providers';
import { db } from '../server/db';
import { runOutbox,syncPendingSubscribers } from '../server/outbox';
try{console.log(await runOutbox(10));await syncPendingSubscribers();await syncEmailDeliveries();}finally{await db.$disconnect();}
