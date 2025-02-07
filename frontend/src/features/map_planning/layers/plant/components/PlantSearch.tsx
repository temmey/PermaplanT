import { useIsReadOnlyMode } from '../../../utils/ReadOnlyModeContext';
import { usePlantSearch } from '../hooks/usePlantSearch';
import { useSelectPlantForPlanting } from '../hooks/useSelectPlantForPlanting';
import { PlantListItem } from './PlantListItem';
import IconButton from '@/components/Button/IconButton';
import SearchInput from '@/components/Form/SearchInput';
import { ReactComponent as CloseIcon } from '@/icons/close.svg';
import { ReactComponent as SearchIcon } from '@/icons/search.svg';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** UI component intended for searching plants that can planted on the plants layer */
export const PlantSearch = () => {
  const { plants, actions: plantSearchActions } = usePlantSearch();
  const { actions } = useSelectPlantForPlanting();

  const isReadOnlyMode = useIsReadOnlyMode();

  const [searchVisible, setSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(['plantSearch']);

  const clearSearch = () => {
    plantSearchActions.clearSearchTerm();
    setSearchVisible(false);
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [searchVisible]);

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex items-center justify-between">
        <h2>{t('plantSearch:planting')}</h2>
        {searchVisible ? (
          <IconButton onClick={clearSearch}>
            <CloseIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => {
              setSearchVisible(true);
            }}
            data-tourid="search_button"
            data-testid="plant-search-icon"
          >
            <SearchIcon />
          </IconButton>
        )}
      </div>
      <AnimatePresence>
        {searchVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 100,
              transition: { delay: 0, duration: 0.2 },
            }}
            exit={{
              opacity: 0,
              transition: { delay: 0, duration: 0.2 },
            }}
          >
            <SearchInput
              disabled={isReadOnlyMode}
              placeholder={t('plantSearch:placeholder')}
              handleSearch={(event) => plantSearchActions.searchPlants(event.target.value)}
              ref={searchInputRef}
              onKeyDown={(e) => {
                if (e.key === 'Escape') clearSearch();
              }}
              data-testid="plant-search-input"
            ></SearchInput>
            <ul data-tourid="plant_list">
              {plants.map((plant) => (
                <PlantListItem
                  disabled={isReadOnlyMode}
                  plant={plant}
                  key={plant.id}
                  onClick={() => {
                    actions.selectPlantForPlanting(plant);
                    clearSearch();
                  }}
                />
              ))}
            </ul>
            {plants.length === 0 && (
              <div className="m-4" data-testid="plant-search-results-empty">
                {t('plantSearch:search_empty')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
