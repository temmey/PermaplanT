interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The variant specifies the look of the button. */
  variant?: ButtonVariant;
}

export enum ButtonVariant {
  primary,
  secondary,
}

const variantStyles = {
  [ButtonVariant.primary]:
    'hover:text-primary-500 dark:hover:text-primary-500 hover:stroke-primary-500 dark:hover:stroke-primary-500 active:stroke-primary-200 dark:active:stroke-primary-200 hover:fill-primary-500 dark:hover:fill-primary-500 active:fill-primary-200 dark:active:fill-primary-200 focus:ring-primary-300 ',
  [ButtonVariant.secondary]:
    'hover:text-secondary-500 dark:hover:text-secondary-500 hover:stroke-secondary-500 dark:hover:stroke-secondary-500 active:stroke-secondary-200 dark:active:stroke-secondary-200 hover:fill-secondary-500 dark:hover:fill-secondary-500 active:fill-secondary-200 dark:active:fill-secondary-200 focus:ring-secondary-300 ',
};

/**
 * A clickable icon.
 * @param props.variant The variant specifies the look of the button.
 * @param props All React props for buttons can be applied.
 */
export default function IconButton({ variant = ButtonVariant.primary, ...props }: IconButtonProps) {
  const className =
    'inline-flex h-6 w-6 justify-center rounded-lg items-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 stroke-neutral-800 dark:stroke-neutral-800-dark fill-neutral-800 dark:fill-neutral-800-dark' +
    ' disabled:stroke-neutral-500 dark:disabled:stroke-neutral-500-dark disabled:fill-neutral-500 dark:disabled:fill-neutral-500-dark disabled:cursor-not-allowed' +
    ' ' +
    variantStyles[variant];
  return (
    <button
      type="button"
      {...props}
      className={className + ' ' + (props.className ? props.className : '')}
    ></button>
  );
}
