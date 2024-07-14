'use client';
import React from 'react';
import { fixtureChatMessages } from '@/shared/api/websocket/__fixture__/chat-messages.fixture';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { PFSend } from '@/shared/ui/icons';
import { ChatItem } from '@/widgets/partyroom-chat-panel/ui/chat-item';
import { refineChatMessages } from '../model/chat-messages.model';

const CHAT_TAB_PANEL_START_POSITION = 130;
const CHAT_TAB_PANEL_END_POSITION = 96;

const PartyroomChatPanel = () => {
  const chatMessages = refineChatMessages(fixtureChatMessages);

  return (
    <>
      <div
        className='flexCol gap-4 overflow-y-auto py-4'
        style={{
          height: `calc(100vh - ${CHAT_TAB_PANEL_START_POSITION + CHAT_TAB_PANEL_END_POSITION}px`,
        }}
      >
        {chatMessages.map((chat, i) => (
          <ChatItem key={i} {...chat} />
        ))}
      </div>
      <div className='absolute bottom-8 inset-x-7'>
        <Input
          size='lg'
          variant='outlined'
          // TODO: i18n 적용
          placeholder='What would you like to talk about?'
          Suffix={
            <Button
              color='secondary'
              variant='fill'
              Icon={<PFSend width={20} height={20} />}
              size='sm'
              className='text-gray-50'
            />
          }
        />
      </div>
    </>
  );
};

export default PartyroomChatPanel;
