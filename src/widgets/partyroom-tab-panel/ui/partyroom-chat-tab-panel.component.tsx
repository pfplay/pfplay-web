'use client';
import React from 'react';
import ChatItem from '@/entities/chat-item/ui/chat-item.component';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { PFSend } from '@/shared/ui/icons';
import { getMockChatMessages } from '../model/mock-chat-messages.model';

const PartyroomChatTabPanel = () => {
  const mockChatMessages = getMockChatMessages();
  return (
    <>
      <div
        className='h-full flexCol gap-4 overflow-y-auto py-4'
        style={{
          height: `calc(100vh - ${130 + 96}px`,
        }}
      >
        {mockChatMessages.map((chat, i) => (
          <ChatItem key={i} {...chat} />
        ))}
      </div>
      <div className='absolute bottom-8 inset-x-7'>
        <Input
          size='lg'
          variant='outlined'
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

export default PartyroomChatTabPanel;
