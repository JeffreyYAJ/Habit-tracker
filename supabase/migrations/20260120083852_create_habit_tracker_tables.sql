/*
  # Create Habit Tracker Tables

  1. New Tables
    - `habits`
      - `id` (uuid, primary key)
      - `name` (text, not null) - The habit name
      - `month` (integer, not null) - Month number (1-12)
      - `year` (integer, not null) - Year
      - `created_at` (timestamptz) - Timestamp of creation
    
    - `habit_completions`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, foreign key) - References habits table
      - `day_number` (integer, not null) - Day of month (1-30)
      - `completed` (boolean, default false) - Whether habit was completed
      - `created_at` (timestamptz) - Timestamp of creation
  
  2. Security
    - Enable RLS on both tables
    - Add policies for public access (anyone can read, create, update, delete)
    
  3. Indexes
    - Add index on habit_id for faster lookups
    - Add unique constraint on habit_id + day_number to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 31),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view habits"
  ON habits FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert habits"
  ON habits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update habits"
  ON habits FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete habits"
  ON habits FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view completions"
  ON habit_completions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert completions"
  ON habit_completions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update completions"
  ON habit_completions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete completions"
  ON habit_completions FOR DELETE
  USING (true);