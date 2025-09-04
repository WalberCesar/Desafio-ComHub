-- Initial setup for PitchLab database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log the successful execution
SELECT 'PitchLab database initialized successfully' as status;







