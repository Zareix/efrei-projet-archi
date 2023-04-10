import amqp from 'amqplib';

async function connectQueue(queueName: string) {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'
    );
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    return [connection, channel] as const;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function sendData(queueName: string, data: any) {
  const [connection, channel] = await connectQueue(queueName);
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  await channel.close();
  await connection.close();
}

export { connectQueue, sendData };
