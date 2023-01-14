CREATE TYPE tag AS ENUM (
  'Blattgemüse',  -- English: Leaf crops
  'Fruchtpflanzen', -- English: Fruit crops
  'Wurzelpflanzen', -- English: Root crops
  'Blütenpflanzen', -- English: Flowering crops
  'Kräuter', -- English: Herbs
  'Sonstiges' -- English: Other
);

CREATE TYPE quality AS ENUM (
  'Bio', -- English: Organic
  'Nicht-Bio', -- English: Not organic
  'Unbekannt' -- English: Unknown
);

CREATE TYPE quantity AS ENUM (
  'Nichts', -- English: Nothing
  'Nicht Genug', -- English: Not enough
  'Genug', -- English: Enough
  'Mehr als genug' -- More than enough
);

CREATE TABLE varieties ( -- English: Sorten
  id SERIAL PRIMARY KEY,
  tags tag[] NOT NULL, -- if not given (via inserting an empty array: ARRAY[]::tag[]), plants take preference.
  species VARCHAR(255) NOT NULL,
  sowing_from SMALLINT, -- 1 = January, ... , 12 = December
  sowing_to SMALLINT,
  sowing_depth INTEGER, -- in cm
  germination_temperature INTEGER,
  prick_out BOOLEAN,
  transplant DATE,
  row_spacing INTEGER,
  plant_spacing INTEGER,
  germination_time SMALLINT, -- in days
  harvest_time DATE,
  location VARCHAR(255),
  care VARCHAR(255),
  height INTEGER,
  CHECK (sowing_from >= 1 AND sowing_from <= 12),
  CHECK (sowing_to >= 1 AND sowing_to <= 12)
);

CREATE TABLE variety_synonyms (
  id SERIAL PRIMARY KEY,
  synonym_name VARCHAR(255) NOT NULL,
  variety_id INTEGER REFERENCES varieties(id) NOT NULL
);

CREATE TABLE seeds (
  id SERIAL PRIMARY KEY,
  tags tag[] NOT NULL,
  species VARCHAR(255) NOT NULL, -- English: Art
  variety_id INTEGER REFERENCES varieties(id) NOT NULL,
  harvest_year SMALLINT NOT NULL,
  use_by DATE,
  origin VARCHAR(255),
  taste VARCHAR(255),
  yield VARCHAR(255),
  quantity quantity NOT NULL,
  quality quality,
  price money,
  generation INTEGER,
  notes TEXT
);

-- Minimal insert examples
INSERT INTO varieties (id, tags, species) VALUES (1, ARRAY['Fruchtpflanzen']::tag[], 'Wildtomate');
INSERT INTO variety_synonyms (variety_id, synonym_name) VALUES (1, 'Tomate Synonym');
INSERT INTO seeds (variety_id, tags, species, harvest_year, quantity) VALUES (1, ARRAY['Fruchtpflanzen']::tag[], 2023, 'Genug');