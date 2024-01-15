import { DefaultArticleType } from '@/components/features/PrivacyAndTerms/Article/New/DefaultArticle';
import { ListArticleType } from '@/components/features/PrivacyAndTerms/Article/New/ListArticle';
import { TableArticleType } from '@/components/features/PrivacyAndTerms/Article/New/TableArticle';
import {
  RetainedInfoTableID,
  retainedInfoBasedOnInternalPolicyTableConfig,
  retainedInfoBasedOnLawTableConfig,
} from './privaryPolicyTableConfig';

export const privacyPolicyConfig = [
  {
    title: 'PFPlay 개인정보 처리방침',
    type: 'default',
    heads: [
      'PFPlay DAO (이하 ‘PFPlay’)는 이용자의 개인정보 보호를 매우 중요하게 생각하며, 이용자가 PFPlay DAO의 서비스(PFPlay)를 이용하기 위해 PFPlay에 제공한 개인정보 보호에 최선을 다하고 있습니다.',
      '이에 PFPlay는 “정보통신망 이용촉진 및 정보보호 등에 관한 법률” , “개인정보보호법” , “통신비밀보호법” , “전기통신사업법” 등 정보통신서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호규정을 준수하고 있습니다.',
      'PFPlay는 본 개인정보처리방침을 사이트 첫 화면에 공개함으로써 이용자가 언제든지 쉽게 확인할 수 있도록 하고 있습니다. 본 개인정보처리방침은 관계 법령 및 PFPlay의 내부 방침에 따라 변경될 수 있으며, 개정 시 버전 관리를 통하여 개정사항을 쉽게 확인할 수 있도록 하고 있습니다.',
      '본 개인정보 처리방침은 PFPlay(이하 ‘서비스’)에 적용됩니다.',
    ],
  },
  {
    title: '제 1조 (개인정보 처리 목적)',
    type: 'list',
    heads: [
      'PFPlay는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제 18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.',
    ],
    contents: [
      {
        listType: 'list-decimal',
        listItems: [
          {
            outerListItem: '회원가입 또는 서비스 이용 시 수집하는 개인정보 항목',
            innerListItems: ['SNS Email, SNS Provider, Hashed Public Key'],
            innerListType: 'list-latin',
          },
          {
            outerListItem: '서비스 이용 중 자동으로 수집되는 정보',
            listItemHeads: [
              '서비스 안정성 확보, 안전한 서비스 제공, 법률 및 서비스 이용약관 위반 행위 제한 등의 목적으로 서비스를 이용하는 과정에서 정보가 자동으로 생성 또는 수집될 수 있습니다.',
            ],
            innerListType: 'list-latin',
            innerListItems: [
              '서비스 이용 기록, 접속 로그, 거래기록, 쿠키, 불량 및 부정 이용 기록, 모바일 기기 정보 (모델명, 이동통신사 정보, OS 정보, 화면 사이즈, 언어 및 국가정보, 광고 ID, 디바이스 식별정보 등)',
              '서비스 및 서비스 어플리케이션에 대한 불법/부정 접근 행위 및 관련 기록, 서비스 어플리케이션에 대한 접근 시도 기록, 서비스 및 서비스 어플리케이션의 안전한 동작 환경 확인에 필요한 정보',
            ],
          },
          {
            outerListItem: '개인정보 수집 방법',
            innerListType: 'list-latin',
            innerListItems: [
              '웹, 모바일 웹, 애플리케이션 등을 통한 수집',
              '타 서비스에서 제3자 제공을 통한 수집',
              '제휴 서비스 회사로부터의 수집',
            ],
          },
        ],
      },
    ],
  },
  {
    title: '제 2조 (개인정보의 처리 및 보유 기간)',
    type: 'table',
    heads: [
      'PFPlay는 법령에 따른 개인정보 보유 ・ 이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유 ・ 이용기간 내에서 개인정보를 처리 ・ 보유합니다.',
      '고객자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.',
    ],
    contents: [
      {
        subTitle: '가. PFPlay 내부 방침에 의한 정보보유 사유',
        table: {
          columnConfig: retainedInfoBasedOnInternalPolicyTableConfig.columnConfig,
          tableData: retainedInfoBasedOnInternalPolicyTableConfig.tableData,
        },
        tail: [
          '다만, 관계 법령 위반에 따른 수사/조사 등이 진행 중인 경우에는 해당 수사/조사 종료 시까지 보유 및 이용합니다.',
        ],
      },
      {
        subTitle: '나. 관련법령에 의한 정보보유 사유',
        heads: [
          '상법, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계법령의 규정에 의하여 보존할 필요가 있는 경우 PFPlay는 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다. 이 경우 PFPlay는 보관하는 정보를 그 보관의 목적으로만 이용하며 보존기간은 아래의 예시와 같습니다.',
        ],
        table: {
          columnConfig: retainedInfoBasedOnLawTableConfig.columnConfig,
          tableData: retainedInfoBasedOnLawTableConfig.tableData,
        },
      },
      {
        subTitle: '다. 휴면 계정 관련 사항',
        heads: [
          '개인정보의 보유 및 이용기간은 서비스 이용계약 체결 시(회원가입)부터 서비스 이용계약 해지(탈퇴신청)까지 입니다. PFPly는 다른 법령에서 별도의 기간을 정하고 있거나 이용자의 요청이 있는 경우를 제외하면, 법령에서 정의하는 기간(1년) 동안 재이용(로그인)하지 아니하는 이용자를 휴면회원으로 정의한다. 휴면회원에 대해서는 개인정보를 파기하거나 다른 이용자의 개인정보와 분리하여 별도로 저장,관리합니다.',
          '단 기간 만료 30일, 7일 이전까지 개인정보가 파기되거나 분리되어 저장,관리되는 사실과 기간 만료일 및 해당 개인 정보의 항목을 전자우편, 서면, FAX, 전화 또는 이와 유사한 방법 중 어느 하나의 방법으로 이용자에게 알립니다.',
        ],
      },
    ],
  },
  {
    type: 'default',
    title: '제 4조 (고객 및 법정대리인의 권리 ・ 의무 및 행사방법)',
    contents: [
      {
        subTitle: '가. 정보주체의 권리',
        heads: [
          '고객은 PFPlay 서비스에 저장되어 있는 자신에 대한 모든 정보를 제공할 것을 언제든지 PFPlay에 요청할 권리가 있습니다.다만, 개인정보보호법 제35조 4항, 제36조 제1항, 제37조 제2항 등 관계 법령에서 정하는 바에 따라 이용자의 개인정보 열람 ・ 정정 ・ 삭제 ・ 처리정지 요구 등의 권리 행사가 제한될 수 있습니다.',
          '고객은 고객의 개인정보를 수정, 차단, 완료 및 삭제하고, 사용을 제한하고, 데이터를 다른 조직으로 이관하도록 PFPlay 서비스에 요청할 권리가 있습니다. 고객은 고객의 개인정보 처리에 관한 추가 정보를 요청할 권리가 있습니다.',
          '또한, 고객은 일부 상황에서 PFPlay 서비스의 데이터 처리에 이의를 제기할 권리가 있으며 귀하의 데이터 처리 동의를 요청한 경우 동의를 철회 할 권리가 있습니다. 또한 위에 명시된 권한에 대한 지원을 원하면 개인정보 보호 책임자(gm@pfpaly.io )에게 문의하십시오.',
        ],
      },
      {
        subTitle: '나. 법정대리인의 권리',
        heads: [
          '고객 및 법정대리인은 언제든지 등록되어 있는 자신의 개인정보를 조회, 수정 또는 가입해지를 요청할 수 있습니다. 혹은 개인정보보호책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.',
          '고객이 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다. 또한 잘못된 개인정보를 제3자에게 이미 제공한 경우에는 정정 처리결과를 제3자에게 지체 없이 통지하여 정정이 이루어지도록 하겠습니다.',
          'PFPlay는 고객 혹은 법정 대리인의 요청에 의해 해지 또는 삭제된 개인정보는 “제2조(개인정보의 처리 및 보유 기간)”에 명시된 바에 따라 처리하고 그 외의 용도로 열람 또는 이용할 수 없도록 처리하고 있습니다.',
        ],
      },
    ],
  },
  {
    title: '제 5조 (처리하는 개인정보 항목)',
    type: 'list',
    contents: [
      {
        subTitle: '가. 수집하는 개인정보의 항목',
        listType: 'list-disc',
        heads: [
          '첫째, PFPlay는 회원 가입, 원활한 고객 지원, 각종 서비스의 제공 등을 위해 아래와 같은 최소한의 개인정보를 필수 항목으로 수집하고 있습니다.',
        ],
        listItems: [
          '[회원가입] SNS Email, SNS Provider, Country Code, Language Code',
          '[서비스 제공 수단 등록] Hashed Public Key',
        ],
      },
      {
        listType: 'list-disc',
        heads: [
          '둘째, 서비스 이용과정이나 서비스 제공 업무 처리 과정에서 아래와 같은 정보들이 자동으로 생성되거나 추가로 수집될 수 있습니다.',
        ],
        listItems: ['IP Address, 쿠키, 접속로그, 방문 일시, 서비스 이용 기록, 불량 이용 기록'],
      },
      {
        subTitle: '나. 기타 서비스를 통한 정보',
        heads: [
          '귀하는 PFPlay가 다른 서비스에서 귀하의 정보를 수집하도록 허가할 수 있습니다. 예를 들어, 귀하는 Google을 사용하여 사이트에 가입할 수 있습니다. 이를 통해 PFPlay는 귀하의 계정을 완성하는 데 필요한 정보(예: 사용자 이름 또는 아바타)를 얻을 수 있습니다.',
        ],
      },
      {
        subTitle: '다. 제3자 서비스',
        listType: 'list-disc',
        heads: [
          'PFPlay는 시간이 지남에 따라 귀하와 귀하의 탐색 및 기타 사용 활동에 대한 정보를 수집하기 위해 쿠키 또는 기타 기술을 사용할 수 있는 제3자 서비스 제공업체를 이용합니다.',
        ],
        listItems: [
          'YouTube API 서비스: PFPlay 서비스의 상당 부분은 YouTube API 서비스를 사용하여 작동합니다. 내장된 검색 기능을 사용하면 입력한 데이터(각각 검색어 또는 재생목록 ID)가 YouTube Data API로 전송됩니다. 그러면 YouTube Data API가 관련 결과를 귀하에게 반환합니다. YouTube API 서비스가 데이터를 처리하는 방법은 여기( https://policies.google.com/privacy) 에서 확인할 수 있습니다.',
          'YouTube 애플리케이션: PFPlay는 YouTube 애플리케이션에서 제공하는 콘텐츠를 표시합니다. YouTube 애플리케이션은 귀하가 PFPlay 사이트의 콘텐츠와 상호 작용하는 방식을 추적하기 위해 쿠키를 사용할 수 있습니다. 위와 유사하게 YouTube 애플리케이션이 데이터를 처리하는 방법은 여기( https://policies.google.com/privacy) 에서 확인할 수 있습니다.',
        ],
      },
    ],
  },
  {
    title: '제 6조 (개인정보 파기에 관한 사항)',
    heads: [
      '고객의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. PFPlay의 개인정보 파기절차 및 방법은 다음과 같습니다.',
    ],
    type: 'list',
    contents: [
      {
        subTitle: '가. 파기절차',
        heads: [
          '고객이 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮기거나 보관장소를 달리하여 보존합니다. (종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조)일정 기간 저장된 후 파기됩니다.개인정보는 법률에 의한 경우가 아니고서는 보유되는 이외의 다른 목적으로 이용되지 않습니다.',
        ],
      },
      {
        listType: 'list-decimal',
        subTitle: '나. 파기방법',
        heads: [
          '종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다. 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.',
        ],
        listItems: [
          'PFPlay는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때는 지체없이 해당 개인정보를 파기합니다.',
          '이용자로부터 동의 받은 개인정보 보유 기간이 지나거나 처리 목적이 달성되었음에도 불구하고 법령에 따라 개인정보를 계속 보조하여야 하는 경우에는, 해당 개인 정보를 별도의 데이터베이스(DB) 로 옮기거나 보관장소를 달리하여 보존합니다.',
          {
            innerListType: 'list-none',
            outerListItem: '개인정보 파기 방법은 다음과 같습니다.',
            innerListItems: [
              '① 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없도록 영구 삭제',
              '② 종이 문서에 기록.저장된 개인정보는 분쇄기로 분쇄하거나 소각',
            ],
          },
        ],
      },
    ],
  },
] satisfies (DefaultArticleType | ListArticleType | TableArticleType<RetainedInfoTableID>)[];
