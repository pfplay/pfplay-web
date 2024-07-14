import { chatMessageMenuItems } from '@/shared/api/websocket/__fixture__/chat-messages.fixture';
import { ChatMessage } from '@/shared/api/websocket/types/chat';
import { MenuItem } from '@/shared/ui/components/menu';

export type ChatItemProps = {
  menuItemList: MenuItem[];
} & ChatMessage;

// TODO: 실제 api 연결 후 삭제
export const refineChatMessages = (fixturesChatMessages: ChatMessage[]): ChatItemProps[] => {
  return fixturesChatMessages.map((fixture, index) => {
    return {
      ...fixture,
      menuItemList: chatMessageMenuItems[index].menuItemList || [],
    };
  });
};
