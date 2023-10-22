import Link from 'next/link';

import { cn } from '@/utils/cn';
import Button, { ButtonProps } from './atoms/Button';

interface CustomLinkProps
  extends Pick<
    ButtonProps,
    'variant' | 'color' | 'size' | 'typo' | 'Icon' | 'iconPlacement' | 'disabled'
  > {
  linkTitle: string;
  href: string;
  classNames?: {
    container?: string;
    button?: string;
  };
}

const CustomLink = ({ href, linkTitle, classNames, ...props }: CustomLinkProps) => {
  return (
    <Link href={href} className={cn('w-fit', classNames?.container)}>
      <Button tabIndex={-1} className={cn(classNames?.button)} {...props}>
        {linkTitle}
      </Button>
    </Link>
  );
};

export default CustomLink;
