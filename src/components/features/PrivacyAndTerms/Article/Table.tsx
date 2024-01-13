import React from 'react';
import Typography from '@/components/shared/atoms/Typography';

export type TableColumnConfig<T> = {
  id: T;
  label: string;
};
export type TableData<T> = {
  [key in T as string]: string;
};
export interface TableProps<T extends string> {
  columnConfig: TableColumnConfig<T>[];
  tableData: TableData<T>[];
}

const Table = <T extends string>({ columnConfig: tableColumnConfig, tableData }: TableProps<T>) => {
  return (
    <table className='min-w-full table-auto mt-3'>
      <thead className='bg-gray-800 text-white'>
        <tr>
          {tableColumnConfig.map((column) => (
            <th key={column.id} className='px-4 py-2 border border-gray-700'>
              <Typography type='caption1' className='text-white'>
                {column.label}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((data, index) => (
          <tr key={index} className='bg-gray-100 border-b'>
            {tableColumnConfig.map((column) => (
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
  );
};

export default Table;
