import {
  RetainedInfoTableID,
  retainedInfoBasedOnInternalPolicyTableConfig,
  retainedInfoBasedOnLawTableConfig,
} from './privacy-policy-table-config';
import { ArticleTableProps } from '../_ui/article-table.component';
import { DefaultArticleProps } from '../_ui/default-article.component';
import { ListArticleProps } from '../_ui/list-article.component';

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
    title: '제 3조 (개인정보의 제3자 제공에 관한 사항)',
    heads: [
      'PFPlay는 고객들의 개인정보를 “제1조(개인정보의 처리목적)”에서 명시한 범위 내에서 사용하며 개인정보 보호법 제 17조 및 제 18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 고객 사전 동의 후 개인정보 제공이 발생하는 경우',
    ],
  },
  {
    type: 'default',
    title: '제 4조 (고객 및 법정대리인의 권리 ・ 의무 및 행사방법)',
    contents: [
      {
        subTitle: '가. 정보주체의 권리',
        heads: [
          '고객은 PFPlay 서비스에 저장되어 있는 자신에 대한 모든 정보를 제공할 것을 언제든지 PFPlay에 요청할 권리가 있습니다. 다만, 개인정보보호법 제35조 4항, 제36조 제1항, 제37조 제2항 등 관계 법령에서 정하는 바에 따라 이용자의 개인정보 열람 ・ 정정 ・ 삭제 ・ 처리정지 요구 등의 권리 행사가 제한될 수 있습니다.',
          '고객은 고객의 개인정보를 수정, 차단, 완료 및 삭제하고, 사용을 제한하고, 데이터를 다른 조직으로 이관하도록 PFPlay 서비스에 요청할 권리가 있습니다. 고객은 고객의 개인정보 처리에 관한 추가 정보를 요청할 권리가 있습니다.',
          '또한, 고객은 일부 상황에서 PFPlay 서비스의 데이터 처리에 이의를 제기할 권리가 있으며 귀하의 데이터 처리 동의를 요청한 경우 동의를 철회 할 권리가 있습니다. 또한 위에 명시된 권한에 대한 지원을 원하면 개인정보 보호 책임자(gm@pfpaly.io)에게 문의하십시오.',
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
          'YouTube API 서비스: PFPlay 서비스의 상당 부분은 YouTube API 서비스를 사용하여 작동합니다. 내장된 검색 기능을 사용하면 입력한 데이터(각각 검색어 또는 재생목록 ID)가 YouTube Data API로 전송됩니다. 그러면 YouTube Data API가 관련 결과를 귀하에게 반환합니다. YouTube API 서비스가 데이터를 처리하는 방법은 여기(https://policies.google.com/privacy)에서 확인할 수 있습니다.',
          'YouTube 애플리케이션: PFPlay는 YouTube 애플리케이션에서 제공하는 콘텐츠를 표시합니다. YouTube 애플리케이션은 귀하가 PFPlay 사이트의 콘텐츠와 상호 작용하는 방식을 추적하기 위해 쿠키를 사용할 수 있습니다. 위와 유사하게 YouTube 애플리케이션이 데이터를 처리하는 방법은 여기(https://policies.google.com/privacy)에서 확인할 수 있습니다.',
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
  {
    title: '제 7조 (개인정보 안전성 확보조치에 관한 사항)',
    heads: [
      'PFPlay는 고객들의 개인정보를 처리함에 있어 개인정보가 분실, 도난, 누출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 다음과 같은 기술적/관리적 대책을 강구하고 있습니다.',
    ],
    type: 'list',
    contents: [
      {
        subTitle: '가. 비밀번호 암호화',
        listType: 'list-disc',
        listItems: [
          '회원 비밀번호는 암호화되어 저장 및 관리되고 있어 본인만이 알고 있으며, 개인정보의 확인 및 변경도 비밀번호를 알고 있는 본인에 의해서만 가능합니다.',
        ],
      },
      {
        subTitle: '나. 해킹 등에 대비한 대책',
        listType: 'list-disc',
        listItems: [
          'PFPlay는 해킹이나 컴퓨터 바이러스 등에 의해 회원의 개인정보가 유출되거나 훼손되는 것을 막기 위해 최선을 다하고 있습니다. 개인정보의 훼손에 대비해서 자료를 수시로 백업하고 있고, 최신 백신프로그램을 이용하여 고객들의 개인정보나 자료가 누출되거나 손상되지 않도록 방지하고 있으며, 암호화통신 등을 통하여 네트워크상에서 개인정보를 안전하게 전송할 수 있도록 하고 있습니다. 그리고 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있으며, 기타 시스템적으로 보안성을 확보하기 위한 가능한 모든 기술적 장치를 갖추려 노력하고 있습니다.',
        ],
      },
      {
        subTitle: '다. 개인정보보호 운영',
        listType: 'list-disc',
        listItems: [
          '개인정보처리방침의 이행사항 및 담당자의 준수여부를 확인하여 문제가 발견될 경우 즉시 수정하고 바로 잡을 수 있도록 노력하고 있습니다. 단, PFPlay가 개인정보보호 의무를 다 하였음에도 불구하고 고객 본인의 부주의나 PFPlay가 관리하지 않는 영역에서의 사고 등 PFPlay의 귀책에 기인하지 않은 손해에 대해서는 PFPlay는 책임을 지지 않습니다.',
        ],
      },
    ],
  },
  {
    title: '제 8조 (개인정보 자동 수집 장치의 설치 ・ 운영 및 그 거부에 관한 사항)',
    type: 'list',
    contents: [
      {
        listType: 'list-disc',
        subTitle: '가. 쿠키란',
        listItems: [
          'PFPlay는 개인화되고 맞춤화된 서비스를 제공하기 위해서 고객의 정보를 저장하고 수시로 불러오는 ‘쿠키(cookie)’를 사용합니다.',
          '쿠키는 웹사이트를 운영하는데 이용되는 서버가 고객의 브라우저에게 보내는 아주 작은 텍스트 파일로 고객 컴퓨터의 하드디스크에 저장됩니다. 이후 고객이 웹 사이트에 방문할 경우 웹 사이트 서버는 고객의 하드 디스크에 저장되어 있는 쿠키의 내용을 읽어 고객의 환경설정을 유지하고 맞춤화된 서비스를 제공하기 위해 이용됩니다.',
          '쿠키는 개인을 식별하는 정보를 자동적/능동적으로 수집하지 않으며, 고객은 언제든지 이러한 쿠키의 저장을 거부하거나 삭제할 수 있습니다.',
        ],
      },
      {
        listType: 'list-disc',
        subTitle: '나. 쿠키의 사용 목적',
        listItems: [
          '고객들이 PFPlay의 서비스와 웹 사이트들에 대한 방문 및 이용형태, 인기 검색어, 고객 규모 등을 파악하여 고객에게 광고를 포함한 최적화된 맞춤형 정보 제공을 위해 사용합니다.',
        ],
      },
      {
        listType: 'list-disc',
        subTitle: '다. 쿠키의 설치/운영 및 거부',
        listItems: [
          '고객은 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 고객은 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.',
          '다만, 쿠키의 저장을 거부할 경우에는 로그인이 필요한 PFPlay의 일부 서비스는 이용에 어려움이 있을 수 있습니다',
          {
            innerListType: 'list-none',
            outerListItem: '쿠키 설치 허용 여부를 지정하는 방법은 다음과 같습니다',
            innerListItems: [
              '▶︎ Internet Explorer : 도구 메뉴 선택 > 인터넷 옵션 선택 > 개인정보 탭 클릭 > 고급 개인정보 설정 > 쿠키 수준 설정',
              '▶︎ Chrome : 설정 메뉴 선택 > 고급 설정 표시 선택 > 개인정보 및 보안 > 콘텐츠 설정 선택 > 쿠키 수준 설정',
            ],
          },
        ],
      },
    ],
  },
  {
    title: '제 9조 개인정보 처리방침 변경에 관한 사항',
    heads: [
      '현 개인정보 처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 이전부터 홈페이지 공지사항 을 통해 변경 사실을 고지할 것입니다. 다만, 개인정보의 수집 및 활용, 제 3자 제공 등과 같이 이용자 권리의 중요한 변경이 있을 때는 최소 30일 이전에 알립니다.',
    ],
    type: 'list',
    contents: [
      {
        listType: 'list-disc',
        listItems: [
          '이 개인정보 처리방침은 2024. 04. 01.부터 적용됩니다.',
          '이전의 개인정보처리방침은 아래에서 확인하실 수 있습니다.',
        ],
      },
    ],
  },
  {
    title: '제 10조 개인정보 처리방침 변경에 관한 사항',
    type: 'default',
    heads: [
      'PFPlay는 고객의 피드백과 서비스에 대한 변경 사항을 반영하기 위해 필요한 경우 본 개인정보 처리방침을 업데이트합니다. PFPlay는 본 방침의 변경 사항을 게시할 때 방침 상단의 "최종 업데이트" 날짜를 수정할 것입니다. 본 방침에 중대한 변경이 있거나 https://pfplay.io 가 귀하의 개인 데이터를 사용하는 방식이 변경되는 경우, PFPlay는 변경 사항이 적용되기 전에 해당 변경 사항을 눈에 잘 띄게 게시하거나 귀하에게 직접 통지함으로써 귀하에게 통지할 것입니다. 본 개인정보 보호정책을 주기적으로 검토하여 https://pfplay.io 가 귀하의 정보를 어떻게 보호하고 있는지 알아보시기 바랍니다.',
    ],
  },
  {
    title: '제 11조 PFPlay에 연락하는 방법',
    type: 'default',
    heads: [
      '기술 또는 지원 관련 질문이 있는 경우 gm@pfplay.io 로 이메일을 보내주십시오.',
      '개인정보 보호 관련 우려 사항, 불만 사항 또는 https://pfplay.io 의 데이터 보호 책임자에 대한 질문이 있는 경우, gm@pfplay.io 으로 이메일을 보내주시면 30일 이내에 질문이나 우려 사항에 대해 답변해 드리겠습니다.',
    ],
  },
] satisfies (DefaultArticleProps | ListArticleProps | ArticleTableProps<RetainedInfoTableID>)[];
