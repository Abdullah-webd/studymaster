import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Plus, MessageCircle, Search, Users } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ChatList from './chat/ChatList';
import ChatWindow from './chat/ChatWindow';
import AddContactModal from './chat/AddContactModal';

const ChatTab = () => {
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchChats();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', handleNewMessage);
      socket.on('chat-updated', handleChatUpdate);

      return () => {
        socket.off('new-message');
        socket.off('chat-updated');
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get('/users/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleNewMessage = (data) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === data.chatId) {
          return {
            ...chat,
            messages: [...chat.messages, data.message],
            lastMessage: {
              content: data.message.content,
              timestamp: data.message.timestamp,
              sender: data.message.sender
            }
          };
        }
        return chat;
      });
      return updatedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const handleChatUpdate = (data) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === data.chatId) {
          return {
            ...chat,
            lastMessage: data.lastMessage,
            updatedAt: new Date()
          };
        }
        return chat;
      });
      return updatedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const handleContactAdded = () => {
    fetchContacts();
    setShowAddContact(false);
  };

  const startChat = async (contactId) => {
    try {
      const response = await api.post('/chat/create', { participantId: contactId });
      const newChat = response.data;
      
      setChats(prevChats => {
        const exists = prevChats.find(chat => chat._id === newChat._id);
        if (!exists) {
          return [newChat, ...prevChats];
        }
        return prevChats;
      });
      
      return newChat._id;
    } catch (error) {
      console.error('Error starting chat:', error);
      return null;
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p._id !== user.id);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading chats...</span>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">Connect with fellow students</p>
              </div>
              <button
                onClick={() => setShowAddContact(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Chat List */}
            {filteredChats.length > 0 ? (
              <ChatList chats={filteredChats} currentUserId={user.id} />
            ) : (
              <div className="card p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4">
                  Start chatting with other students by adding them as contacts
                </p>
                <button
                  onClick={() => setShowAddContact(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Contact
                </button>
              </div>
            )}

            {/* Contacts Section */}
            {contacts.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Your Contacts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact) => (
                    <div key={contact._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{contact.userId.name}</p>
                        <p className="text-sm text-gray-600">{contact.userId.phone}</p>
                      </div>
                      <button
                        onClick={() => startChat(contact.userId._id)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        } />
        <Route path="/:chatId" element={<ChatWindow />} />
      </Routes>

      {/* Add Contact Modal */}
      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onContactAdded={handleContactAdded}
        />
      )}
    </div>
  );
};

export default ChatTab;