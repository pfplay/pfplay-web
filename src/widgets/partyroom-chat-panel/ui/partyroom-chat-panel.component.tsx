'use client';
import React from 'react';
import { fixtureChatMessages } from '@/shared/api/websocket/__fixture__/chat-messages.fixture';
import { useVerticalStretch } from '@/shared/lib/hooks/use-vertical-stretch.hook';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { PFSend } from '@/shared/ui/icons';
import { ChatItem } from '@/widgets/partyroom-chat-panel/ui/chat-item';
import { refineChatMessages } from '../model/chat-messages.model';

const PartyroomChatPanel = () => {
  const containerRef = useVerticalStretch<HTMLDivElement>();
  const chatMessages = refineChatMessages(fixtureChatMessages);

  return (
    <div ref={containerRef} className='flexCol gap-1'>
      <div className='flex-[1_0_0] flexCol gap-4 overflow-y-auto py-4'>
        {chatMessages.map((chat, i) => (
          <ChatItem key={i} {...chat} />
        ))}
        {chatMessages.map((chat, i) => (
          <ChatItem key={i + chatMessages.length} {...chat} />
        ))}
      </div>

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
  );
};

export default PartyroomChatPanel;
