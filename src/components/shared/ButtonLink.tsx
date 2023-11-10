import Link from 'next/link';

import { cn } from '@/utils/cn';
import Button, { ButtonProps } from './atoms/Button';

interface ButtonLinkProps
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

const ButtonLink = ({ href, linkTitle, classNames, ...props }: ButtonLinkProps) => {
  return (
    <Link href={href} className={cn('w-fit', classNames?.container)}>
      <Button tabIndex={-1} className={cn(classNames?.button)} {...props}>
        {linkTitle}
      </Button>
    </Link>
  );
};

export default ButtonLink;
