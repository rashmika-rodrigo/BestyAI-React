import { useState, useEffect, useRef } from 'react';
import logo from './assets/logo.svg';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      parts: [{ text: inputValue }],
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      const apiHistory = chatHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts,
      }));

      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: apiHistory,
          message: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const modelMessage = {
        role: 'model',
        parts: [{ text: data.message }],
      };
      
      setChatHistory(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Error fetching from backend:', error);
      const errorMessage = {
        role: 'model',
        parts: [{ text: 'Sorry, I am busy right now. Please try again later..' }],
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header with Logo */}
      <header className="bg-gray-800 shadow-md p-4">
        <div className="flex items-center justify-center">
          <img src={logo} alt="BestyAI Logo" className="h-11 w-11 mr-3" />
          <h1 className="text-2xl font-bold text-cyan-400">BestyAI</h1>
      </div>
    </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatHistory.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg ${message.role === 'user' ? 'bg-cyan-600' : 'bg-gray-700'}`}>
              <p className="text-sm whitespace-pre-wrap">{message.parts[0].text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm">Wait, I'm thinking..</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Section */}
      <footer className="bg-gray-900 p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 p-3 bg-gray-700 rounded-l-lg border-0 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="👋🏻 Hello! Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-cyan-600 text-white p-3 rounded-r-lg hover:bg-cyan-700 disabled:bg-gray-600 ml-1"
              disabled={isLoading || !inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </footer>

      {/* NEW: Transparent footer for branding */}
      <div className="text-center text-xs text-gray-400 py-4">
        All rights reserved. BestyAI (v1.0) by Rashmika Rodrigo.
      </div>
    </div>
  );
}

export default App;