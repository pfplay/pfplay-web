import { ChatItemProps } from '@/entities/chat-item/ui/chat-item.component';
import { PartyroomGrade } from '@/shared/api/http/types/@enums';
import { PFAddCircle } from '@/shared/ui/icons';

export const getMockChatMessages = (): ChatItemProps[] => [
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile1.jpg',
    nickname: 'User1',
    message:
      'Hello, this is a message from User1.Hello, this is a message from User1. Hello, this is a message from User1.',
    menuItemList: [
      {
        label: 'Option 1',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.HOST,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile2.jpg',
    nickname: 'User2',
    message: 'Hello, this is a message from User2.',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.MOD,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile2.jpg',
    nickname: 'User2',
    message: 'Hello, this is a message from User2.',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.MOD,
  },
  {
    type: 'sent',
    partyroomGrade: PartyroomGrade.HOST,
    partyroomId: '1',
    src: 'https://example.com/profile2.jpg',
    nickname: 'User2',
    message: 'Hello, this is a message from User2.',
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
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile2.jpg',
    nickname: 'User2',
    message: 'Hello, this is a message from User2.',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.MOD,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile2.jpg',
    nickname: 'User2',
    message: 'Hello, this is a message from User2.',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.MOD,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile2.jpg',
    nickname: 'User2',
    message: 'Hello, this is a message from User2.',
    menuItemList: [
      {
        label: 'Option 2',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.MOD,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile3.jpg',
    nickname: 'User3',
    message: 'Hello, this is a message from User3.',
    menuItemList: [
      {
        label: 'Option 3',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.CM,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile4.jpg',
    nickname: 'User4',
    message: 'Hello, this is a message from User4.',
    menuItemList: [
      {
        label: 'Option 4',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.LISTENER,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile5.jpg',
    nickname: 'User5',
    message: 'Hello, this is a message from User5.',
    menuItemList: [
      {
        label: 'Option 5',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.CLUBBER,
  },
  {
    type: 'received',
    id: 1,
    partyroomId: '1',
    userId: {
      uid: 'asdf',
    },
    src: 'https://example.com/profile6.jpg',
    nickname: 'User6',
    message: 'Hello, this is a message from User6.',
    menuItemList: [
      {
        label: 'Option 6',
        Icon: <PFAddCircle />,
        onClickItem: () => {
          console.log('hi');
        },
      },
    ],
    partyroomGrade: PartyroomGrade.HOST,
  },
];
