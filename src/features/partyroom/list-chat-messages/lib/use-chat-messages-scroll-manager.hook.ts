import { useEffect, useState } from 'react';

/**
 * chat messages의 마지막 요소가 변경되었을 때(아마도 chat이 추가되었을 때)
 * 스크롤 컨테이너를 마지막 요소로 스크롤할지 여부를 결정합니다.
 */
export default function useChatMessagesScrollManager<
  ScrollEL extends HTMLElement,
  ItemEL extends HTMLElement
>({ itemsGap }: { itemsGap: number }) {
  const [scrollContainer, setScrollContainer] = useState<ScrollEL | null>(null);
  const [lastItem, setLastItem] = useState<ItemEL | null>(null);

  const scrollToBottom = () => {
    if (!scrollContainer) return;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  };

  useEffect(() => {
    // 마운트 시점에 스크롤을 맨 아래로 이동 (최초 1회)
    if (scrollContainer) {
      scrollToBottom();
    }
  }, [scrollContainer]);

  useEffect(() => {
    if (!lastItem || !scrollContainer) return;

    // 마지막 아이템이 추가되기 직전, 스크롤이 가장 아래쪽에 있었을 때만 자동으로 스크롤을 맨 아래로 이동해줌
    const isScrollAtBottomBeforeLastItemAdded =
      scrollContainer.scrollTop + scrollContainer.clientHeight >= // scrollTop 혹은 clientHeight이 소수점일 경우 발생할 부동소수점 이슈를 대비하여 === 대신 >= 사용
      scrollContainer.scrollHeight - lastItem.clientHeight - itemsGap - 5; // 마지막 아이템이 추가되기 직전의 스크롤 높이. 5px은 여유분

    if (isScrollAtBottomBeforeLastItemAdded) {
      scrollToBottom();
    }
  }, [lastItem]);

  return {
    scrollContainerRef: setScrollContainer,
    lastItemRef: setLastItem,
  };
}
