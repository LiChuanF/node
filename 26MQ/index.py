import pika

try:
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    
    channel = connection.channel()
    
    queueName = 'task_queue'
    
    channel.queue_declare(queue=queueName,durable=True)
    
    message = '小满zs'
    
    channel.basic_publish(exchange='',routing_key=queueName,body=message)
    
    print(f"消息已发送: {message}")
    
    connection.close()
except Exception as e:
    print(f"错误: {e}")
