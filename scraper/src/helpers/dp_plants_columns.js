/**
 * This file contains the database columns and their corresponding types
 */
export default [
  { name: 'common_name_en', cast: 'text[]' },
  { name: 'common_name_de', cast: 'text[]' },
  { name: 'unique_name' },
  { name: 'genus' },
  { name: 'family' },
  { name: 'subfamily' },
  { name: 'edible_uses_en' },
  { name: 'medicinal_uses' },
  { name: 'material_uses_and_functions' },
  { name: 'botanic' },
  { name: 'cultivation' },
  { name: 'material_uses' },
  { name: 'functions' },
  { name: 'provides_forage_for' },
  { name: 'provides_shelter_for' },
  { name: 'hardiness_zone' },
  { name: 'heat_zone' },
  { name: 'shade' },
  { name: 'soil_ph', cast: 'soil_ph[]' },
  { name: 'soil_water_retention', cast: 'soil_water_retention[]' },
  { name: 'environmental_tolerances', cast: 'text[]' },
  { name: 'native_climate_zones' },
  { name: 'adapted_climate_zones' },
  { name: 'native_geographical_range' },
  { name: 'native_environment' },
  { name: 'ecosystem_niche' },
  { name: 'root_zone_tendancy', cast: 'root_zone_tendancy' },
  { name: 'deciduous_or_evergreen', cast: 'deciduous_or_evergreen' },
  { name: 'herbaceous_or_woody', cast: 'herbaceous_or_woody' },
  { name: 'life_cycle', cast: 'life_cycle[]' },
  { name: 'width' },
  { name: 'height' },
  { name: 'fertility', cast: 'fertility[]' },
  { name: 'pollinators' },
  { name: 'flower_colour' },
  { name: 'flower_type', cast: 'flower_type' },
  { name: 'tolerates_wind' },
  { name: 'plant_references', cast: 'text[]' },
  { name: 'is_tree' },
  { name: 'nutrition_demand', cast: 'nutrition_demand' },
  { name: 'article_last_modified_at' },
  { name: 'light_requirement', cast: 'light_requirement[]' },
  { name: 'water_requirement', cast: 'water_requirement[]' },
  { name: 'propagation_method', cast: 'propagation_method[]' },
  { name: 'growth_rate', cast: 'growth_rate[]' },
  { name: 'alternate_name' },
  { name: 'diseases' },
  { name: 'has_drought_tolerance', cast: 'boolean' },
  { name: 'edible', cast: 'boolean' },
  { name: 'edible_parts', cast: 'text[]' },
  { name: 'germination_temperature', cast: 'integer' },
  { name: 'introduced_into' },
  { name: 'layer' },
  { name: 'leaves' },
  { name: 'link' },
  { name: 'medicinal_parts' },
  { name: 'native_to' },
  { name: 'plants_for_a_future' },
  { name: 'plants_of_the_world_online_link' },
  { name: 'plants_of_the_world_online_link_synonym' },
  { name: 'pollination' },
  { name: 'propagation_transplanting' },
  { name: 'resistance' },
  { name: 'root_depth' },
  { name: 'root_type' },
  { name: 'seed_planting_depth_en' },
  { name: 'seed_viability' },
  { name: 'slug' },
  { name: 'soil_texture', cast: 'soil_texture[]' },
  { name: 'spread' },
  { name: 'thining' },
  { name: 'utility' },
  { name: 'warning' },
];
