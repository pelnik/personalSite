-- =============================================================================
-- Initialize databases for personalSite
-- This script runs automatically when the Postgres container starts fresh
-- =============================================================================

-- Create the three application databases
CREATE DATABASE juicebox;
CREATE DATABASE fitness;
CREATE DATABASE scents;

-- Grant privileges to the postgres user
GRANT ALL PRIVILEGES ON DATABASE juicebox TO postgres;
GRANT ALL PRIVILEGES ON DATABASE fitness TO postgres;
GRANT ALL PRIVILEGES ON DATABASE scents TO postgres;
