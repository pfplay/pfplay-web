import React from 'react';
import Typography from '@/components/shared/atoms/Typography';
import { TableColumnConfig, TableData } from '../Table';

export type TableContentsType<T> = {
  subTitle?: string;
  heads?: string[];
  table?: {
    columnConfig?: TableColumnConfig<T>[];
    tableData?: TableData<T>[];
  };
  tail?: string[];
};

export type TableArticleType<T extends string> = {
  type?: 'table';
  heads?: string[];
  title?: string;
  contents?: TableContentsType<T>[];
};

const ArticleTable = <T extends string>(config: TableArticleType<T>) => {
  return (
    <section>
      {config?.title && (
        <Typography type='body1' className='text-white mb-5'>
          {config.title}
        </Typography>
      )}
      {config.heads?.map((head, i) => {
        return (
          <Typography key={i} type='caption2' className='text-gray-300'>
            {head}
          </Typography>
        );
      })}
      {config.contents?.map((content, i) => {
        return (
          <article key={i}>
            {content?.subTitle && (
              <Typography type='detail2' className='mt-5 mb-3 text-white'>
                {content.subTitle}
              </Typography>
            )}
            {content.heads?.map((head, i) => {
              return (
                <Typography key={i} type='caption2' className='mb-1 text-gray-300'>
                  {head}
                </Typography>
              );
            })}
            <table className='min-w-full table-auto mt-3'>
              <thead className='bg-gray-800 text-white'>
                <tr>
                  {content.table?.columnConfig?.map((column) => (
                    <th key={column.id} className='px-4 py-2 border border-gray-700'>
                      <Typography type='caption1' className='text-white'>
                        {column.label}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.table?.tableData?.map((data, index) => (
                  <tr key={index} className='bg-gray-100 border-b'>
                    {content.table?.columnConfig?.map((column) => (
                      <td key={column.id} className='px-4 py-2 border border-gray-700 bg-gray-900'>
                        <Typography type='caption1' className='text-gray-300'>
                          {data[column.id]}
                        </Typography>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {content.tail && (
              <Typography type='caption2' className='mt-4 text-gray-300'>
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
