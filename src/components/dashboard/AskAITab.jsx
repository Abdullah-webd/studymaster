import { useState, useEffect, useRef } from 'react';
import { Send, Brain, History, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AskAITab = () => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching AI history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setLoading(true);

    // Add user question to conversation
    setConversation(prev => [...prev, { type: 'user', content: userQuestion }]);

    try {
      const response = await api.post('/ai/ask', { question: userQuestion });
      
      // Add AI response to conversation
      setConversation(prev => [...prev, { 
        type: 'ai', 
        content: response.data.answer,
        id: response.data.id
      }]);

      // Refresh history
      fetchHistory();
    } catch (error) {
      toast.error('Error getting AI response');
      setConversation(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setConversation([
      { type: 'user', content: item.question },
      { type: 'ai', content: item.answer, id: item._id }
    ]);
    setShowHistory(false);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600">Ask any educational question</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </button>
            {conversation.length > 0 && (
              <button
                onClick={clearConversation}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                title="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversation.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to AI Assistant
              </h3>
              <p className="text-gray-600 mb-6">
                Ask me anything about your studies, exam preparation, or any educational topic!
              </p>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  "Explain photosynthesis in simple terms",
                  "How do I solve quadratic equations?",
                  "What are the causes of World War I?",
                  "Help me understand chemical bonding"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(example)}
                    className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${
                    message.type === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white border border-gray-200'
                  } rounded-2xl p-4 shadow-sm`}>
                    {message.type === 'ai' && (
                      <div className="flex items-center mb-2">
                        <Brain className="h-4 w-4 text-primary-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">AI Assistant</span>
                      </div>
                    )}
                    <div className={`prose prose-sm max-w-none ${
                      message.type === 'user' ? 'prose-invert' : ''
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 text-primary-600 mr-2" />
                      <span className="text-sm font-medium text-gray-600 mr-3">AI Assistant</span>
                      <div className="loading-spinner"></div>
                    </div>
                    <p className="text-gray-500 mt-2">Thinking...</p>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-6">
          <form onSubmit={askQuestion} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="w-full input-field resize-none"
                rows="3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askQuestion(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Chat History</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {history.length > 0 ? (
              <div className="p-4 space-y-3">
                {history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      {item.question}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.answer.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No chat history yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AskAITab;