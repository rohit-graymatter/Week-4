import { createClient } from 'redis';
import redisClient from './redisClient.js';

const subscriber = createClient({ url: process.env.REDIS_URL });

subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

async function initSubscriber() {
  await subscriber.connect();

  const handleMessage = async (message, channel) => {
    try {
      const data = JSON.parse(message);
      let action = '';
      if (channel === 'employee:add') action = 'New Employee Added';
      else if (channel === 'employee:update') action = 'Employee Updated';
      else if (channel === 'employee:delete') action = 'Employee Deleted';

      console.log(`Admin notified: ${action} →`, data.name);

      // Save unified notification
      await redisClient.set('latest:employee:notification', JSON.stringify({ ...data, type: channel }), {
        EX: 300,
      });
    } catch (err) {
      console.error(`Error parsing ${channel} message:`, err);
    }
  };

  await subscriber.subscribe('employee:add', (message) => handleMessage(message, 'employee:add'));
  await subscriber.subscribe('employee:update', (message) => handleMessage(message, 'employee:update'));
  await subscriber.subscribe('employee:delete', (message) => handleMessage(message, 'employee:delete'));
}

export { subscriber, initSubscriber };
