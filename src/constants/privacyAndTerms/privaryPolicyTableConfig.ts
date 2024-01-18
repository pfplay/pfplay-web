import { TableConfigType } from '@/components/features/PrivacyAndTerms/Article/TableArticle';

export enum RetainedInfoTableID {
  RetainedData = '보관하는 정보',
  RetentionReason = '보존이유',
  RetentionPeriod = '보존기간',
  Category = '구분',
}

export const retainedInfoBasedOnInternalPolicyTableConfig = {
  columnConfig: [
    {
      id: RetainedInfoTableID.RetainedData,
      label: '구분',
    },
    {
      id: RetainedInfoTableID.RetentionReason,
      label: '보관하는 정보',
    },
    {
      id: RetainedInfoTableID.RetentionPeriod,
      label: '보존 기간',
    },
  ],
  tableData: [
    {
      [RetainedInfoTableID.RetainedData]: 'PFPlay 서비스',
      [RetainedInfoTableID.RetentionReason]: '부정 이용 방지',
      [RetainedInfoTableID.RetentionPeriod]: '유저 탈퇴 시 까지',
    },
    {
      [RetainedInfoTableID.RetainedData]: '회원가입',
      [RetainedInfoTableID.RetentionReason]: '회원 관리 및 탈퇴, 이용자 상담 및 민원 처리',
      [RetainedInfoTableID.RetentionPeriod]: '유저 탈퇴 시 까지',
    },
  ],
} satisfies TableConfigType<RetainedInfoTableID>;

export const retainedInfoBasedOnLawTableConfig = {
  columnConfig: [
    {
      id: RetainedInfoTableID.RetainedData,
      label: '보관하는 정보',
    },
    {
      id: RetainedInfoTableID.RetentionReason,
      label: '보존 이유',
    },
    {
      id: RetainedInfoTableID.RetentionPeriod,
      label: '보존 기간',
    },
  ],
  tableData: [
    {
      [RetainedInfoTableID.RetainedData]: '계약 또는 청약 철회 등에 관한 기록',
      [RetainedInfoTableID.RetentionReason]: '전자상거래 등에서의 소비자 보호에 관한 법률',
      [RetainedInfoTableID.RetentionPeriod]: '5년',
    },
    {
      [RetainedInfoTableID.RetainedData]: '대금결제 및 재화 등의 공급에 대한 기록',
      [RetainedInfoTableID.RetentionReason]: '전자상거래 등에서의 소비자 보호에 관한 법률',
      [RetainedInfoTableID.RetentionPeriod]: '5년',
    },
    {
      [RetainedInfoTableID.RetainedData]: '소비자의 불만 또는 분쟁 처리에 관한 기록',
      [RetainedInfoTableID.RetentionReason]: '전자상거래 등에서의 소비자 보호에 관한 법률',
      [RetainedInfoTableID.RetentionPeriod]: '3년',
    },
    {
      [RetainedInfoTableID.RetainedData]: '표시 / 광고에 관한 기록',
      [RetainedInfoTableID.RetentionReason]: '전자상거래 등에서의 소비자 보호에 관한 법률',
      [RetainedInfoTableID.RetentionPeriod]: '6개월',
    },
    {
      [RetainedInfoTableID.RetainedData]: '세법이 규정하는 모든거래에 관한 장부 및 증빙서류',
      [RetainedInfoTableID.RetentionReason]: '국세기본법, 법인세법',
      [RetainedInfoTableID.RetentionPeriod]: '5년',
    },
    {
      [RetainedInfoTableID.RetainedData]: '전자금융 거래에 관한 기록',
      [RetainedInfoTableID.RetentionReason]: '전자금융거래법',
      [RetainedInfoTableID.RetentionPeriod]: '5년',
    },
    {
      [RetainedInfoTableID.RetainedData]: '로그인 기록',
      [RetainedInfoTableID.RetentionReason]: '통신비밀보호법',
      [RetainedInfoTableID.RetentionPeriod]: '3개월',
    },
  ],
} satisfies TableConfigType<RetainedInfoTableID>;
