import Chat from './chat';

describe('Chat', () => {
  test('빈 초기 메시지로 생성', () => {
    const chat = Chat.create<string>([]);
    expect(chat.getMessages()).toEqual([]);
  });

  test('초기 메시지와 함께 생성', () => {
    const chat = Chat.create(['hello', 'world']);
    expect(chat.getMessages()).toEqual(['hello', 'world']);
  });

  describe('appendMessage', () => {
    test('메시지 추가', () => {
      const chat = Chat.create<string>([]);
      chat.appendMessage('hello');
      chat.appendMessage('world');
      expect(chat.getMessages()).toEqual(['hello', 'world']);
    });

    test('메시지 추가 시 리스너에 알림', () => {
      const chat = Chat.create<string>([]);
      const listener = jest.fn();
      chat.addMessageListener(listener);

      chat.appendMessage('hello');

      expect(listener).toHaveBeenCalledWith('hello');
    });
  });

  describe('updateMessage', () => {
    test('조건에 맞는 메시지 업데이트', () => {
      const chat = Chat.create([
        { id: 1, text: 'hello' },
        { id: 2, text: 'world' },
      ]);

      chat.updateMessage(
        (msg) => msg.id === 1,
        (msg) => ({ ...msg, text: 'updated' })
      );

      expect(chat.getMessages()).toEqual([
        { id: 1, text: 'updated' },
        { id: 2, text: 'world' },
      ]);
    });

    test('업데이트 시 리스너에 알림', () => {
      const chat = Chat.create([{ id: 1, text: 'hello' }]);
      const listener = jest.fn();
      chat.addMessageListener(listener);

      chat.updateMessage(
        (msg) => msg.id === 1,
        (msg) => ({ ...msg, text: 'updated' })
      );

      expect(listener).toHaveBeenCalledWith({ id: 1, text: 'updated' });
    });

    test('조건에 맞는 메시지가 없으면 리스너 호출 안 됨', () => {
      const chat = Chat.create([{ id: 1, text: 'hello' }]);
      const listener = jest.fn();
      chat.addMessageListener(listener);

      chat.updateMessage(
        (msg) => msg.id === 999,
        (msg) => ({ ...msg, text: 'updated' })
      );

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    test('메시지와 리스너 모두 초기화', () => {
      const chat = Chat.create(['hello', 'world']);
      const listener = jest.fn();
      chat.addMessageListener(listener);

      chat.clear();

      expect(chat.getMessages()).toEqual([]);

      chat.appendMessage('after clear');
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
