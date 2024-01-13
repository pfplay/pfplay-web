import React from 'react';
import Article, { ListArticleType } from './Article/NewArticle';
export const privacyPolicyConfig = [
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
] satisfies ListArticleType[];

const PrivacyPolicy = () => {
  return (
    <section className='flexCol gap-10'>
      {privacyPolicyConfig.map((config, i) => (
        <Article key={i} {...config} />
      ))}
      {/* {privacyPolicyConfig.map((config) => (
        <Article key={config.title} title={config.title}>
          {config?.subTitle && (
            <Typography type='detail2' className='mt-4 text-white'>
              {config.subTitle}
            </Typography>
          )}

          <ArticleHead head={config.head} />
          {config.type === 'default' &&
            config.items &&
            config.items.map((item, i) => (
              <div key={i}>
                {item.subTitle && (
                  <Typography type='detail2' className='mt-5 mb-3 text-white'>
                    {item.subTitle}
                  </Typography>
                )}
                <ArticleHead head={item.head} />
              </div>
            ))}
          {config.type === 'list' && (
            <ArticleList items={config.items} listType={config.listType} />
          )}
          {config.type === 'table' &&
            config?.items &&
            config.items.map((config, i) => {
              return (
                <div key={i}>
                  {config.subTitle && (
                    <Typography type='detail2' className='mt-5 mb-3 text-white'>
                      {config.subTitle}
                    </Typography>
                  )}
                  <ArticleHead head={config.head} />
                  {config.columnConfig && config.tableData && (
                    <Table columnConfig={config.columnConfig} tableData={config.tableData} />
                  )}
                  {config.tail && (
                    <Typography type='caption2' className='mt-4 text-gray-300'>
                      {config.tail}
                    </Typography>
                  )}
                </div>
              );
            })}
          {config.type === 'default' &&
            config.items?.map((item, i) => (
              <div key={i}>
                {item.subTitle && (
                  <Typography type='detail2' className='mt-5 mb-3 text-white'>
                    {item.subTitle}
                  </Typography>
                )}
                {Array.isArray(item.content) &&
                  item.content?.map((content, i) => (
                    <Typography key={i} type='caption2' className='text-gray-300'>
                      {content}
                    </Typography>
                  ))}
              </div>
            ))}

          {config.tail && (
            <Typography type='caption2' className='mt-4 text-gray-300'>
              {config.tail}
            </Typography>
          )}
        </Article>
      ))} */}
    </section>
  );
};

export default PrivacyPolicy;

/**
 *
 * CommonArticleType
 *  title?: string;
    subTitle?: string;
    head?: string[];
    tail?: string[];

    DefaultArticleType extends CommonArticleType
    type?:'default'
    contents?: string[];


ListArticleType
    type?:'list'
 *  title?: string;
    head?: string[];
    contents?:{
        listType?: ListType;
        subTitle?: string;
        heads?: string[];
        listItems?: string[]; // List Type 적용 
        subContents?: ListItemType[];
        tail?: string[];
    }[]
    tail?: string[];

    ListType: 'list-disc' | 'list-decimal' | 'list-inherit' | 'list-latin';
    ListContentsType:{
        listType?: ListType;
        subTitle?: string;
        heads?: string[];
        contents?: string[]; // List Type 적용 
        subContents?: ListContentsType;
        tail?: string[];
    } 


    TableArticleType


export type TableColumnConfig<T> = {
  id: T;
  label: string;
};
export type TableData<T> = {
  [key in T as string]: string;
};
export interface TableType<T extends string> {
  columnConfig: TableColumnConfig<T>[];
  tableData: TableData<T>[];
}

ArticleTableType extends CommonArticleType{
    type?:'table'
    
contents?: {
  subTitle?: string;
  heads?: string[];
    columnConfig?: TableColumnConfig<any>[];
    tableData?: TableData<TableEnumID>[]; //가제
    tails?: string[];

  }[]
}
 */
