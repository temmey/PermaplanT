import PaginatedSelectMenu, {
  PageAdditionalInfo,
} from '../../../components/Form/PaginatedSelectMenu';
import SelectMenu from '../../../components/Form/SelectMenu';
import { searchPlants } from '../api/searchPlants';
import { NewSeedDto, Quality, Quantity } from '@/bindings/definitions';
import SimpleButton, { ButtonVariant } from '@/components/Button/SimpleButton';
import { SelectOption } from '@/components/Form/SelectMenuTypes';
import SimpleFormInput from '@/components/Form/SimpleFormInput';
import { enumToSelectOptionArr } from '@/utils/enum';
import { useTranslatedQuality, useTranslatedQuantity } from '@/utils/translated-enums';
import { Suspense } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GroupBase, OptionsOrGroups } from 'react-select';
import { LoadOptions } from 'react-select-async-paginate';

interface CreateSeedFormProps {
  isUploadingSeed: boolean;
  onCancel: () => void;
  onChange: () => void;
  onSubmit: (newSeed: NewSeedDto) => void;
}

const CreateSeedForm = ({ isUploadingSeed, onCancel, onChange, onSubmit }: CreateSeedFormProps) => {
  const { t } = useTranslation(['common', 'seeds']);

  const translatedQuality = useTranslatedQuality();
  const translatedQuantity = useTranslatedQuantity();

  const quality: SelectOption[] = enumToSelectOptionArr(Quality, translatedQuality);
  const quantity: SelectOption[] = enumToSelectOptionArr(Quantity, translatedQuantity);

  const currentYear = new Date().getFullYear();

  const { register, handleSubmit, control, setValue } = useForm<NewSeedDto>();
  const onFormSubmit: SubmitHandler<NewSeedDto> = async (data) => {
    if (data.origin === '') delete data.origin;
    if (data.taste === '') delete data.taste;
    if (data.yield_ === '') delete data.yield_;
    if (data.use_by === '') delete data.use_by;
    if (Number.isNaN(data.generation)) delete data.generation;
    if (Number.isNaN(data.price)) delete data.price;
    if (data.use_by) {
      // Change the date to YYYY-MM-DD format so it can be parsed by the backend
      data.use_by = new Date(String(data.use_by)).toISOString().split('T')[0];
    }

    onSubmit(data);
  };

  /** calls searchPlants and creates options for the select input */
  const loadPlants: LoadOptions<SelectOption, GroupBase<SelectOption>, PageAdditionalInfo> = async (
    inputValue: string,
    options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>,
    additional: PageAdditionalInfo | undefined,
  ) => {
    const pageNumber = additional ? additional.pageNumber : 1;
    const page = await searchPlants(inputValue, pageNumber);

    const plant_options: SelectOption[] = page.results.map((plant) => {
      const common_name_en = plant.common_name_en ? ' (' + plant.common_name_en[0] + ')' : '';

      return {
        value: plant.id,
        label: plant.unique_name + common_name_en,
      };
    });

    return {
      options: plant_options,
      hasMore: page.total_pages > pageNumber,
      additional: {
        pageNumber: pageNumber + 1,
      },
    };
  };

  return (
    <Suspense>
      <div>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="mb-6 grid gap-8 md:grid-cols-2">
            <PaginatedSelectMenu<NewSeedDto, SelectOption, false>
              id="plant_id"
              control={control}
              labelText={t('seeds:binomial_name')}
              placeholder={t('seeds:create_seed_form.placeholder_binomial_name')}
              required={true}
              loadOptions={loadPlants}
              handleOptionsChange={(option) => {
                if (!option) {
                  setValue('plant_id', undefined);
                } else {
                  const temp = option as SelectOption;
                  const mapped = temp.value as number;
                  setValue('plant_id', mapped);
                }
              }}
              onChange={onChange}
            />
            <SimpleFormInput
              labelText={t('seeds:additional_name')}
              placeholder=""
              required={true}
              id="name"
              register={register}
              onChange={onChange}
            />
            <SimpleFormInput
              type="number"
              labelText={t('seeds:harvest_year')}
              defaultValue={currentYear}
              placeholder={currentYear.toString()}
              required={true}
              id="harvest_year"
              register={register}
              onChange={onChange}
            />
            <SelectMenu
              id="quantity"
              control={control}
              options={quantity}
              labelText={t('seeds:quantity')}
              required={true}
              handleOptionsChange={(option) => {
                const temp = option as SelectOption;
                const mapped = temp.value as Quantity;
                setValue('quantity', mapped);
              }}
              onChange={onChange}
            />
            <SimpleFormInput
              type="date"
              labelText={t('seeds:use_by')}
              placeholder=""
              id="use_by"
              register={register}
              onChange={onChange}
            />
            <SimpleFormInput
              labelText={t('seeds:origin')}
              placeholder={t('seeds:create_seed_form.placeholder_origin')}
              id="origin"
              register={register}
              onChange={onChange}
            />
            <SelectMenu
              id="quality"
              control={control}
              options={quality}
              labelText={t('seeds:quality')}
              handleOptionsChange={(option) => {
                const temp = option as SelectOption;
                const mapped = temp.value as Quality;
                setValue('quality', mapped);
              }}
              onChange={onChange}
            />
            <SimpleFormInput
              labelText={t('seeds:taste')}
              placeholder={t('seeds:create_seed_form.placeholder_taste')}
              id="taste"
              register={register}
              onChange={onChange}
            />
            <SimpleFormInput
              labelText={t('seeds:yield')}
              placeholder={t('seeds:create_seed_form.placeholder_yield')}
              id="yield_"
              register={register}
              onChange={onChange}
            />
            <SimpleFormInput
              labelText={t('seeds:price')}
              placeholder={t('seeds:create_seed_form.placeholder_price')}
              id="price"
              register={register}
              valueAsNumber={true}
              errorTitle={t('seeds:create_seed_form.error_price_must_be_number')}
              onChange={onChange}
            />
            <SimpleFormInput
              type="number"
              min={0}
              labelText={t('seeds:generation')}
              placeholder={t('seeds:create_seed_form.placeholder_generation')}
              id="generation"
              register={register}
              onChange={onChange}
            />
          </div>
          <div className="mb-6">
            <SimpleFormInput
              type="textarea"
              labelText={t('seeds:notes')}
              placeholder="..."
              id="notes"
              register={register}
              onChange={onChange}
            />
          </div>
          <div className="flex flex-row justify-between space-x-4">
            <SimpleButton
              type="button"
              onClick={onCancel}
              className="max-w-[240px] grow sm:w-auto"
              variant={ButtonVariant.secondaryBase}
            >
              {t('common:cancel')}
            </SimpleButton>
            <SimpleButton
              title={t('seeds:create_seed_form.btn_create_seed')}
              type="submit"
              className="max-w-[240px] grow sm:w-auto"
            >
              {t('seeds:create_seed_form.btn_create_seed')}
              {isUploadingSeed && (
                <svg
                  className="ml-4 inline-block h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </SimpleButton>
          </div>
        </form>
      </div>
    </Suspense>
  );
};

export default CreateSeedForm;
