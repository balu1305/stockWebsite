// Quick test for the chatbot functionality
// Run this with: node test-chatbot.js

const fetch = require('node-fetch'); // You might need to install node-fetch for Node.js < 18

async function testChatbot() {
  const apiUrl = 'http://localhost:3000/api/chat';
  
  const testMessages = [
    "Hello, can you help me with stock trading?",
    "What are the best stocks for beginners?",
    "Explain what is a stop loss?",
    "How does technical analysis work?",
    "Tell me about the CHTR platform features"
  ];

  console.log('🤖 Testing Chatbot API...\n');

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📤 User: ${message}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`🤖 Assistant: ${data.message.substring(0, 100)}...\n`);
      } else {
        console.log(`❌ Error: ${data.error}\n`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}\n`);
    }
  }
  
  console.log('✅ Chatbot test completed!');
  console.log('\n🌐 Open http://localhost:3000 to see the floating chatbot in action!');
}

testChatbot().catch(console.error);
