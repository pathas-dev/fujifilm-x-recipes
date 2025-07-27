import { create } from 'zustand';
import { ChatMessage } from '@/components/chatbot/ChatbotClient';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingMessage: string;
  hasAIResponses: boolean;

  // Actions
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  clearMessages: () => void;
  initializeWelcomeMessage: (welcomeText: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  loadingMessage: '',
  hasAIResponses: false,

  addMessage: (message) =>
    set((state) => {
      const newMessages = [...state.messages, message];
      return {
        messages: newMessages,
        hasAIResponses: newMessages.some(
          (msg) => !msg.isUser && msg.id !== 'welcome'
        ),
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
}));
