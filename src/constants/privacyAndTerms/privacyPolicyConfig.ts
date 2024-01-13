import { Article } from '@/components/shared/ListItem';

export const privacyPolicyConfig: Article[] = [
  {
    title: 'PFPlay 개인정보 처리방침',
    content: [
      'PFPlay DAO (이하 ‘PFPlay’)는 이용자의 개인정보 보호를 매우 중요하게 생각하며, 이용자가 PFPlay DAO의 서비스(PFPlay)를 이용하기 위해 PFPlay에 제공한 개인정보 보호에 최선을 다하고 있습니다.',
      '이에 PFPlay는 “정보통신망 이용촉진 및 정보보호 등에 관한 법률” , “개인정보보호법” , “통신비밀보호법” , “전기통신사업법” 등 정보통신서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호규정을 준수하고 있습니다.',
      'PFPlay는 본 개인정보처리방침을 사이트 첫 화면에 공개함으로써 이용자가 언제든지 쉽게 확인할 수 있도록 하고 있습니다. 본 개인정보처리방침은 관계 법령 및 PFPlay의 내부 방침에 따라 변경될 수 있으며, 개정 시 버전 관리를 통하여 개정사항을 쉽게 확인할 수 있도록 하고 있습니다.',
      '본 개인정보 처리방침은 PFPlay(이하 ‘서비스’)에 적용됩니다.',
    ],
  },
  {
    title: '제 1조 (개인정보 처리 목적)',
    content:
      'PFPlay는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제 18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.',
    listType: 'list-decimal',
    items: [
      {
        content: '회원가입 또는 서비스 이용 시 수집하는 개인정보 항목',
        listType: 'list-latin',
        subItems: [
          {
            content: 'SNS Email, SNS Provider, Hashed Public Key',
          },
        ],
      },
      {
        content: '서비스 이용 중 자동으로 수집되는 정보',
        listType: 'list-latin',
        subItems: [
          {
            content:
              '서비스 이용 기록, 접속 로그, 거래기록, 쿠키, 불량 및 부정 이용 기록, 모바일 기기 정보 (모델명, 이동통신사 정보, OS 정보, 화면 사이즈, 언어 및 국가정보, 광고 ID, 디바이스 식별정보 등)',
          },
          {
            content:
              '서비스 및 서비스 어플리케이션에 대한 불법/부정 접근 행위 및 관련 기록, 서비스 어플리케이션에 대한 접근 시도 기록, 서비스 및 서비스 어플리케이션의 안전한 동작 환경 확인에 필요한 정보',
          },
        ],
      },
      {
        content: '개인정보 수집 방법',
        listType: 'list-latin',
        subItems: [
          {
            content: '웹, 모바일 웹, 애플리케이션 등을 통한 수집',
          },
          {
            content: '타 서비스에서 제3자 제공을 통한 수집',
          },
          {
            content: '제휴 서비스 회사로부터의 수집',
          },
        ],
      },
    ],
  },
  // Table type 추가
] satisfies Article[];
