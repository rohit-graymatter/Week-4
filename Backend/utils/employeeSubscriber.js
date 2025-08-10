import { createClient } from 'redis';

const subscriber = createClient({ url: process.env.REDIS_URL });

subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

async function initSubscriber() {
  await subscriber.connect();
  await subscriber.subscribe('employee:add', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Admin notified: New Employee Added →', data.name);
    } catch (err) {
      console.error('Error parsing employee:add message:', err);
    }
  });
}

export { subscriber, initSubscriber };
