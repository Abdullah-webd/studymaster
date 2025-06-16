import Chat from '../models/Chat.js';
import User from '../models/User.js';

export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join', async (userId) => {
      socket.userId = userId;
      socket.join(userId);
      
      // Join all chat rooms for this user
      try {
        const chats = await Chat.find({ participants: userId });
        chats.forEach(chat => {
          socket.join(chat._id.toString());
        });
      } catch (error) {
        console.error('Error joining chat rooms:', error);
      }
    });

    // Join specific chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content, senderId } = data;

        // Find or create chat
        let chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', 'Chat not found');
        }

        // Add message to chat
        const newMessage = {
          sender: senderId,
          content,
          timestamp: new Date(),
          read: false
        };

        chat.messages.push(newMessage);
        chat.lastMessage = {
          content,
          timestamp: new Date(),
          sender: senderId
        };

        await chat.save();

        // Populate sender info
        await chat.populate('messages.sender', 'name');
        const populatedMessage = chat.messages[chat.messages.length - 1];

        // Emit to all participants in the chat room
        io.to(chatId).emit('new-message', {
          chatId,
          message: populatedMessage
        });

        // Emit to participants for chat list update
        chat.participants.forEach(participantId => {
          io.to(participantId.toString()).emit('chat-updated', {
            chatId,
            lastMessage: chat.lastMessage
          });
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.chatId).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};