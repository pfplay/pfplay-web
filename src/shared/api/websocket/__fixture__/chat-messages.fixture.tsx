import { MenuItem } from '@/shared/ui/components/menu';
import { PFAddCircle } from '@/shared/ui/icons';
import { PartyroomGrade } from '../../http/types/@enums';
import { ChatMessage } from '../types/chat';

export const fixtureChatMessages = [
  {
    type: 'received',
    message:
      'Hello, this is a message from User1.Hello, this is a message from User1. Hello, this is a message from User1.',
    fromUser: {
      id: 1,
      partyroomId: '1',
      userId: {
        uid: 'asdf',
      },
      src: 'https://example.com/profile1.jpg',
      nickname: 'User1',
      partyroomGrade: PartyroomGrade.ADMIN,
    },
  },
  {
    type: 'received',
    message: 'Hello, this is a message from User2.',
    fromUser: {
      id: 2,
      partyroomId: '1',
      userId: {
        uid: 'qwer',
      },
      src: 'https://example.com/profile2.jpg',
      nickname: 'User2',
      partyroomGrade: PartyroomGrade.MOD,
    },
  },
  {
    type: 'received',
    message: 'Hello, this is a message from User3.',
    fromUser: {
      id: 3,
      partyroomId: '1',
      userId: {
        uid: 'zxcv',
      },
      src: 'https://example.com/profile3.jpg',
      nickname: 'User3',
      partyroomGrade: PartyroomGrade.CM,
    },
  },
  {
    type: 'received',
    message: 'Hello, this is a message from User4.',
    fromUser: {
      id: 4,
      partyroomId: '1',
      userId: {
        uid: 'asdf',
      },
      src: 'https://example.com/profile4.jpg',
      nickname: 'User4',
      partyroomGrade: PartyroomGrade.LISTENER,
    },
  },
  {
    type: 'received',
    message: 'Hello, this is a message from User5.',
    fromUser: {
      id: 5,
      partyroomId: '1',
      userId: {
        uid: 'qwer',
      },
      src: 'https://example.com/profile5.jpg',
      nickname: 'User5',
      partyroomGrade: PartyroomGrade.CLUBBER,
    },
  },
  {
    type: 'sent',
    message: 'Hello, this is a message from User6.',
    fromUser: {
      partyroomId: '1',
      src: 'https://example.com/profile6.jpg',
      nickname: 'User6',
      partyroomGrade: PartyroomGrade.ADMIN,
    },
  },
] satisfies ChatMessage[];

export const chatMessageMenuItems: { type: 'received' | 'sent'; menuItemList: MenuItem[] }[] = [
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 1',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'sent',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 3',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 4',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 5',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
  {
    type: 'received',
    menuItemList: [
      {
        label: 'Option 6',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
  },
];
