/**
 * 엑셀 시트에 정식 번역이 추가되기 전, `I18nRenderer` 컴포넌트의 기능을 사용하기 위해 임시로 추가한 번역
 */
export const __dev__preTranslation = {
  // 'party.para.penalty_chat_ban': '관리자에 의해 $1초간 채팅이 금지됩니다',
  'party.para.penalty_chat_ban':
    'You have been banned from chatting\nfor $1 seconds by an administrator.',
  // 'party.para.penalty_one_time_expulsion': '관리자에 의해 퇴출되셨습니다',
  'party.para.penalty_one_time_expulsion': 'You have been expelled by an administrator.',
  // 'party.para.penalty_permanent_expulsion': '관리자에 의해 영구 퇴출되셨으며\n재입장은 불가능합니다',
  'party.para.penalty_permanent_expulsion':
    'You have been permanently expelled by an administrator\nand cannot rejoin.',
} as const;
