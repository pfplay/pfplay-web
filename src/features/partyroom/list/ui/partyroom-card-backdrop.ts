const PARTYROOM_CARD_FALLBACK_SRC = '/images/Background/Partyroom.png';
const PARTYROOM_CARD_FALLBACK_IMAGE_CLASS_NAME = 'object-[24%_60%] scale-110';

export function getPartyroomCardBackdropProps(thumbnailImage?: string) {
  return {
    fallbackSrc: PARTYROOM_CARD_FALLBACK_SRC,
    imageClassName: thumbnailImage ? undefined : PARTYROOM_CARD_FALLBACK_IMAGE_CLASS_NAME,
  };
}
