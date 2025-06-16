import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { formatDistanceToNow } from 'date-fns';

const ChatWindow = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchChat();
  }, [chatId]);

  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join-chat', chatId);

      socket.on('new-message', handleNewMessage);

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const fetchChat = async () => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      setChat(response.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.chatId === chatId) {
      setChat(prevChat => ({
        ...prevChat,
        messages: [...prevChat.messages, data.message]
      }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    const messageContent = message.trim();
    setMessage('');

    try {
      socket.emit('send-message', {
        chatId,
        content: messageContent,
        senderId: user.id
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading chat...</span>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chat not found</p>
        <Link to="/dashboard/chat" className="text-primary-600 hover:text-primary-700">
          Back to chats
        </Link>
      </div>
    );
  }

  const otherParticipant = chat.participants.find(p => p._id !== user.id);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard/chat"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {otherParticipant?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900">{otherParticipant?.name}</h2>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chat.messages.map((msg, index) => {
            const isOwn = msg.sender._id === user.id;
            const showTime = index === 0 || 
              new Date(msg.timestamp).getTime() - new Date(chat.messages[index - 1].timestamp).getTime() > 300000; // 5 minutes

            return (
              <div key={index} className="space-y-1">
                {showTime && (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;