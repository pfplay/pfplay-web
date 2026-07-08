/**
 * 아바타 머리 위 말풍선(#410). 사용자가 채팅을 칠 때 발신자 아바타에 잠시 노출된다.
 * 좋아요 리액션(ReactionLottie)과 동일한 overlay 슬롯에 얹는다.
 *
 * 순수 CSS — 흰 말풍선 + 아래 꼬리 + 타이핑 인디케이터 스타일의 "..." 3점 staggered bounce.
 * (별도 에셋/Lottie 불필요)
 */
export default function ChatBubble() {
  return (
    <div
      data-testid='avatar-chat-bubble'
      aria-label='Avatar Chat Bubble'
      role='presentation'
      className={
        'relative flex items-center gap-1 rounded-2xl bg-white px-2.5 py-1.5 shadow-md ' +
        // 아래쪽을 향하는 꼬리 (말풍선이 아바타 머리 위에 떠 있고 꼬리가 아래 head 를 가리킴)
        'after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:content-[""] ' +
        'after:border-4 after:border-transparent after:border-t-white'
      }
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className='block h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce'
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
        />
      ))}
    </div>
  );
}
