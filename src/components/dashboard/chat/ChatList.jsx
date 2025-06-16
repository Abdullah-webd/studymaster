import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ChatList = ({ chats, currentUserId }) => {
  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
        const lastMessage = chat.lastMessage;
        
        return (
          <Link
            key={chat._id}
            to={`/dashboard/chat/${chat._id}`}
            className="block card p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {otherParticipant?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {otherParticipant?.name}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                {lastMessage ? (
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage.sender._id === currentUserId ? 'You: ' : ''}
                    {lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No messages yet</p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ChatList;