import { PathMap } from 'pathmap';
import { cn } from '@/shared/lib/functions/cn';
import { AppLink, Href, PathParams } from '@/shared/lib/router/app-link.component';
import { Button, ButtonProps } from '../button';

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
  disabled,
  ...props
}: ButtonLinkProps<P>) => {
  return (
    <AppLink
      href={href}
      path={('path' in props ? props.path : {}) as PathMap[P]['path']}
      className={cn('max-w-full', classNames?.container)}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        }
      }}
    >
      <Button tabIndex={-1} className={cn(classNames?.button)} disabled={disabled} {...props}>
        {linkTitle}
      </Button>
    </AppLink>
  );
};

export default ButtonLink;
