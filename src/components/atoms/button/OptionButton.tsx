import { ArrowSVG } from '@/components/svg/ArrowSVG';
import { ButtonProps } from '@/types/props';
import { twMerge } from 'tailwind-merge';

export const OptionButton = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={twMerge(
        'flex h-[70px] w-full items-center justify-between px-4 text-gray-700 body-16 hover:bg-primary-200 hover:text-white active:bg-primary-500 active:text-white lg:justify-center lg:subTitle-20',
        props.className,
      )}
    >
      {children}
      <ArrowSVG className='h-5 w-5 lg:hidden' direction='right' />
    </button>
  );
};
