import { ChatMessage } from '@/components/chatbot/ChatbotClient';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  // Current chat
  messages: ChatMessage[];
  isLoading: boolean;
  loadingMessage: string;
  hasAIResponses: boolean;
  currentChatId: string | null;

  // Chat history
  chatHistories: ChatHistory[];

  // Actions
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  clearMessages: () => void;
  initializeWelcomeMessage: (welcomeText: string) => void;

  // Chat history actions
  saveCurrentChat: () => void;
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  startNewChat: () => void;
  getChatHistories: () => ChatHistory[];
  generateChatTitle: (messages: ChatMessage[]) => string;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Current chat state
      messages: [],
      isLoading: false,
      loadingMessage: '',
      hasAIResponses: false,
      currentChatId: null,

      // Chat history
      chatHistories: [],

      addMessage: (message) =>
        set((state) => {
          const newMessages = [...state.messages, message];
          const hasAIResponses = newMessages.some(
            (msg) => !msg.isUser && msg.id !== 'welcome'
          );

          if (!message.isUser && hasAIResponses) {
            setTimeout(() => {
              get().saveCurrentChat();
            }, 100);
          }

          return {
            messages: newMessages,
            hasAIResponses,
          };
        }),

      setMessages: (messages) =>
        set({
          messages,
          hasAIResponses: messages.some(
            (msg) => !msg.isUser && msg.id !== 'welcome'
          ),
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setLoadingMessage: (message) => set({ loadingMessage: message }),

      clearMessages: () =>
        set({
          messages: [],
          hasAIResponses: false,
        }),

      initializeWelcomeMessage: (welcomeText) => {
        const currentMessages = get().messages;
        if (
          currentMessages.length === 0 ||
          !currentMessages.some((msg) => msg.id === 'welcome')
        ) {
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            content: welcomeText,
            isUser: false,
            timestamp: new Date(),
            type: 'text',
          };
          set({
            messages: [welcomeMessage],
            hasAIResponses: false,
          });
        }
      },

      saveCurrentChat: () => {
        const state = get();
        const { messages, currentChatId, chatHistories } = state;

        const meaningfulMessages = messages.filter(
          (msg) => msg.id !== 'welcome'
        );
        if (meaningfulMessages.length === 0) return;

        const now = new Date();
        const title = state.generateChatTitle(messages);

        if (currentChatId) {
          const updatedHistories = chatHistories.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages, title, updatedAt: now }
              : chat
          );
          set({ chatHistories: updatedHistories });
        } else {
          // Create new chat
          const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newChat: ChatHistory = {
            id: newChatId,
            title,
            messages,
            createdAt: now,
            updatedAt: now,
          };
          set({
            chatHistories: [newChat, ...chatHistories],
            currentChatId: newChatId,
          });
        }
      },

      loadChat: (chatId) => {
        const { chatHistories } = get();
        const chat = chatHistories.find((c) => c.id === chatId);
        if (chat) {
          set({
            messages: chat.messages,
            currentChatId: chatId,
            hasAIResponses: chat.messages.some(
              (msg) => !msg.isUser && msg.id !== 'welcome'
            ),
          });
        }
      },

      deleteChat: (chatId) => {
        const state = get();
        const updatedHistories = state.chatHistories.filter(
          (chat) => chat.id !== chatId
        );

        set({
          chatHistories: updatedHistories,
          ...(state.currentChatId === chatId && {
            currentChatId: null,
            messages: [],
            hasAIResponses: false,
          }),
        });
      },

      startNewChat: () => {
        set({
          messages: [],
          currentChatId: null,
          hasAIResponses: false,
          isLoading: false,
          loadingMessage: '',
        });
      },

      getChatHistories: () => {
        return get().chatHistories.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      generateChatTitle: (messages) => {
        const userMessages = messages.filter(
          (msg) => msg.isUser && typeof msg.content === 'string'
        );

        if (userMessages.length === 0) return '';

        const firstUserMessage = userMessages[0].content as string;
        const title =
          firstUserMessage.length > 30
            ? firstUserMessage.substring(0, 30) + '...'
            : firstUserMessage;

        return title;
      },
    }),
    {
      name: 'fujifilm-chat-storage',
      partialize: (state) => ({
        chatHistories: state.chatHistories,
        currentChatId: state.currentChatId,
      }),
    }
  )
);
