import { PathMap } from 'pathmap';
import { AppLink, Href, PathParams } from '@/entities/router';
import { cn } from '@/shared/lib/cn';
import Button, { ButtonProps } from '@/shared/ui/components/button/button.component';

type ButtonLinkProps<P extends Href> = {
  linkTitle: string;
  href: P;
  classNames?: {
    container?: string;
    button?: string;
  };
} & Pick<
  ButtonProps,
  'variant' | 'color' | 'size' | 'typo' | 'Icon' | 'iconPlacement' | 'disabled'
> &
  PathParams<P>;

const ButtonLink = <P extends Href>({
  href,
  linkTitle,
  classNames,
  ...props
}: ButtonLinkProps<P>) => {
  return (
    <AppLink
      href={href}
      path={('path' in props ? props.path : {}) as PathMap[P]['path']}
      className={cn('max-w-full', classNames?.container)}
    >
      <Button tabIndex={-1} className={cn(classNames?.button)} {...props}>
        {linkTitle}
      </Button>
    </AppLink>
  );
};

export default ButtonLink;
