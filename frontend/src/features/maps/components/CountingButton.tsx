import { ReactComponent as HeartIcon } from '@/icons/heart.svg';
import { ReactComponent as UserIcon } from '@/icons/user.svg';
import { useTranslation } from 'react-i18next';

enum IconType {
  honors,
  visits,
}

interface CountingButtonProps {
  iconType: IconType;
  count: number;
}

export default function CountingButton({ iconType, count }: CountingButtonProps) {
  const { t } = useTranslation(['maps']);

  return (
    <div
      className="m-1 flex h-2/3 cursor-default rounded-xl bg-neutral-200 p-1 dark:bg-neutral-700"
      title={
        IconType[iconType] === 'honors'
          ? t('maps:overview.honors_title')
          : t('maps:overview.visits_title')
      }
      onClick={(e) => e.stopPropagation()}
    >
      <div className="stroke-neutral-800 dark:stroke-neutral-800-dark">
        {IconType[iconType] === 'honors' ? (
          <HeartIcon className="h-6 w-6" />
        ) : (
          <UserIcon className="h-6 w-6" />
        )}
      </div>
      <span className="mx-1">{count}</span>
    </div>
  );
}
