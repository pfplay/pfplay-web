import { ChatItemProps } from '@/entities/chat-item/ui/chat-item.component';
import { PartyroomGrade } from '@/shared/api/http/types/@enums';
import { PFAddCircle } from '@/shared/ui/icons';

export const getMockChatMessages = (): ChatItemProps[] => [
  {
    src: 'https://example.com/profile1.jpg',
    name: 'User1',
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
    authority: PartyroomGrade.ADMIN,
  },
  {
    src: 'https://example.com/profile2.jpg',
    name: 'User2',
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
    authority: PartyroomGrade.MOD,
  },
  {
    src: 'https://example.com/profile2.jpg',
    name: 'User2',
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
    authority: PartyroomGrade.MOD,
  },
  {
    src: 'https://example.com/profile2.jpg',
    name: 'User2',
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
    src: 'https://example.com/profile2.jpg',
    name: 'User2',
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
    authority: PartyroomGrade.MOD,
  },
  {
    src: 'https://example.com/profile2.jpg',
    name: 'User2',
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
    authority: PartyroomGrade.MOD,
  },
  {
    src: 'https://example.com/profile2.jpg',
    name: 'User2',
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
    authority: PartyroomGrade.MOD,
  },
  {
    src: 'https://example.com/profile3.jpg',
    name: 'User3',
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
    authority: PartyroomGrade.CM,
  },
  {
    src: 'https://example.com/profile4.jpg',
    name: 'User4',
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
    authority: PartyroomGrade.LISTENER,
  },
  {
    src: 'https://example.com/profile5.jpg',
    name: 'User5',
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
    authority: PartyroomGrade.CLUBBER,
  },
  {
    src: 'https://example.com/profile6.jpg',
    name: 'User6',
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
    authority: PartyroomGrade.ADMIN,
  },
];
