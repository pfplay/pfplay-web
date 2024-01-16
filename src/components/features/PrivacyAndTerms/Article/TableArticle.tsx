import React from 'react';
import Typography from '@/components/shared/atoms/Typography';
import ArticleHeadContents from './ArticleHeadContents';
import ArticleSubTitle from './ArticleSubTitle';
import ArticleTitle from './ArticleTitle';

export type TableConfigType<T> = {
  columnConfig: {
    id: T;
    label: string;
  }[];
  tableData: {
    [key in T as string]: string;
  }[];
};
export interface TableContentsType<T> {
  subTitle?: string;
  heads?: string[];
  table?: TableConfigType<T>;
  tail?: string[];
}

export interface TableArticleProps<T extends string> {
  type?: 'table';
  heads?: string[];
  title: string;
  contents?: TableContentsType<T>[];
}

const ArticleTable = <T extends string>(config: TableArticleProps<T>) => {
  return (
    <section>
      {config?.title && <ArticleTitle title={config.title} />}
      <div className='mb-4'>{config?.heads && <ArticleHeadContents heads={config.heads} />}</div>
      {config.contents?.map((content, i) => {
        return (
          <article key={i}>
            {content?.subTitle && <ArticleSubTitle subTitle={content.subTitle} />}
            {content?.heads && <ArticleHeadContents heads={content.heads} />}

            {content?.table && (
              <table className='min-w-full table-auto mt-3 mb-4'>
                <thead className='bg-gray-800 text-white'>
                  <tr>
                    {content.table.columnConfig.map((column) => (
                      <th key={column.id} className='px-4 py-2 border border-gray-700'>
                        <Typography type='caption1' className='text-white'>
                          {column.label}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.table.tableData.map((data, i) => (
                    <tr key={i} className='bg-gray-100 border-b'>
                      {content.table?.columnConfig.map((column) => (
                        <td
                          key={column.id}
                          className='px-4 py-2 border border-gray-700 bg-gray-900'
                        >
                          <Typography type='caption1' className='text-gray-300'>
                            {data[column.id]}
                          </Typography>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {content.tail && (
              <Typography type='caption2' className='mb-4 text-gray-300'>
                {content.tail}
              </Typography>
            )}
          </article>
        );
      })}
    </section>
  );
};

export default ArticleTable;
