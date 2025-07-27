'use client';

import { useChatStore } from '@/stores/chat';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import ConfirmModal from '../common/ConfirmModal';
import {
  SvgCalendarDaysMicro,
  SvgChatList,
  SvgHistory,
  SvgModernDelete,
  SvgModernPlus,
} from '../icon/svgs';

dayjs.extend(relativeTime);

const ChatbotHistory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const t = useTranslations('Chatbot.history');
  const locale = useLocale();

  // Set dayjs locale
  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update button position when dropdown opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside (for Portal)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if delete modal is open
      if (deleteModalOpen) {
        return;
      }

      // Check if click is on button or dropdown content
      if (
        buttonRef.current?.contains(target) ||
        (event.target as Element)?.closest('[data-dropdown-content]')
      ) {
        return;
      }

      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, deleteModalOpen]);

  const {
    currentChatId,
    loadChat,
    deleteChat,
    startNewChat,
    getChatHistories,
  } = useChatStore(
    useShallow((state) => ({
      currentChatId: state.currentChatId,
      loadChat: state.loadChat,
      deleteChat: state.deleteChat,
      startNewChat: state.startNewChat,
      getChatHistories: state.getChatHistories,
    }))
  );

  const histories = getChatHistories();

  const formatDate = (date: Date) => {
    const now = dayjs();
    const targetDate = dayjs(date);
    const diffInHours = now.diff(targetDate, 'hour');

    if (diffInHours < 1) return targetDate.fromNow();

    if (diffInHours < 24) return targetDate.format('HH:mm');

    if (diffInHours < 24 * 7) return targetDate.format('MM/DD');

    return targetDate.format('YYYY/MM/DD');
  };

  const formatChatTitle = (title: string) => {
    if (!title) return t('newConversation');

    return title;
  };

  const handleNewChat = () => {
    startNewChat();
    setIsOpen(false);
  };

  const handleLoadChat = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    loadChat(chatId);
    setIsOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setChatToDelete(null);
    setDeleteModalOpen(false);
  };

  // Prevent hydration mismatch by only rendering on client
  if (!isClient) {
    return (
      <div className="relative z-50">
        <button
          className="group from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 relative flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md"
          title={t('title')}
          disabled
        >
          <div className="relative">
            <SvgHistory />
          </div>
          <span className="hidden sm:inline">{t('title')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-[9999]" ref={containerRef}>
      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="group from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 relative flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md"
        title={t('title')}
      >
        <div className="relative">
          <SvgHistory />
          {histories.length > 0 && (
            <motion.div
              className="bg-primary text-primary-content absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {histories.length > 9 ? '9+' : histories.length}
            </motion.div>
          )}
        </div>
        <span className="hidden sm:inline">{t('title')}</span>
      </button>

      {/* History Dropdown using Portal */}
      {isClient &&
        isOpen &&
        buttonRect &&
        createPortal(
          <AnimatePresence>
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                style={{ zIndex: 999998 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Dropdown Content */}
              <motion.div
                className="border-base-300/50 bg-base-100/95 fixed max-h-[32rem] w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-2xl backdrop-blur-md"
                data-dropdown-content
                style={{
                  zIndex: 999999,
                  top: buttonRect.bottom + 8,
                  right: Math.max(16, window.innerWidth - buttonRect.right),
                }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Header */}
                <div className="border-base-300/50 from-primary/5 to-secondary/5 border-b bg-gradient-to-r p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SvgChatList />
                      <h3 className="text-base-content font-semibold">
                        {t('title')}
                      </h3>
                    </div>
                    <button
                      onClick={handleNewChat}
                      className="group bg-primary text-primary-content hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:shadow-md"
                    >
                      <SvgModernPlus />
                      {t('newChat')}
                    </button>
                  </div>
                </div>

                {/* History List */}
                <div className="z-10 max-h-80 overflow-y-auto scroll-smooth">
                  {histories.length === 0 ? (
                    <motion.div
                      className="flex flex-col items-center justify-center p-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="text-base-content/40 mb-3">
                        <SvgHistory />
                      </div>
                      <p className="text-base-content/60 text-sm">
                        {t('empty')}
                      </p>
                      <p className="text-base-content/40 mt-1 text-xs">
                        {t('emptySubtitle')}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="p-2">
                      {histories.map((chat, index) => (
                        <motion.div
                          key={chat.id}
                          className={`group relative mb-2 cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${
                            currentChatId === chat.id
                              ? 'border-primary/30 from-primary/10 to-secondary/5 bg-gradient-to-r shadow-sm'
                              : 'border-base-300/50 bg-base-50/50 hover:border-primary/20 hover:bg-base-50'
                          }`}
                          onClick={(e) => handleLoadChat(e, chat.id)}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                              <h4 className="text-base-content mb-1 truncate text-sm font-medium">
                                {formatChatTitle(chat.title)}
                              </h4>
                              <div className="text-base-content/60 flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="h-3 w-3">
                                    <SvgCalendarDaysMicro />
                                  </div>
                                  <span>{formatDate(chat.updatedAt)}</span>
                                </div>
                                <span>•</span>
                                <span>
                                  {chat.messages.filter((m) => m.isUser).length}
                                  {t('messageCount')}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteChat(e, chat.id)}
                              className="text-error hover:bg-error/10 cursor-pointer rounded-md p-2 opacity-0 transition-all duration-200 group-hover:opacity-100"
                              title={t('deleteTitle')}
                            >
                              <SvgModernDelete />
                            </button>
                          </div>

                          {/* Active indicator */}
                          {currentChatId === chat.id && (
                            <motion.div
                              className="from-primary to-secondary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b"
                              layoutId="activeChat"
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          </AnimatePresence>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title={t('deleteTitle')}
        message={t('deleteConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        icon={<SvgModernDelete />}
      />
    </div>
  );
};

export default ChatbotHistory;
