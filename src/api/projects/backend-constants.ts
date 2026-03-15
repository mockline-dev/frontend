/**
 * Backend Constants
 * Constants for backend generation and execution
 */

/**
 * Timeout for pip install operations (6 minutes)
 */
export const PIP_INSTALL_TIMEOUT_MS = 6 * 60 * 1000;

/**
 * Number of health check retries
 */
export const HEALTH_CHECK_RETRIES = 5;

/**
 * Delay between health check retries (2 seconds)
 */
export const HEALTH_CHECK_RETRY_DELAY_MS = 2000;

/**
 * Timeout for health check requests (3 seconds)
 */
export const HEALTH_CHECK_TIMEOUT_MS = 3000;

/**
 * Projects prefix in file keys
 */
export const PROJECTS_PREFIX = 'projects/';

/**
 * Essential FastAPI files
 */
export const ESSENTIAL_FASTAPI_FILES = ['main.py', 'server.py'];

/**
 * Non-Python packages to filter from requirements.txt
 */
export const NON_PYTHON_PACKAGES = new Set([
    'express',
    'bcryptjs',
    'next',
    'react',
    'react-dom',
    'vite',
    'typescript',
    'nodemon',
    'npm',
    'pnpm',
    'yarn'
]);

/**
 * Default Python dependencies
 */
export const DEFAULT_PYTHON_DEPENDENCIES = [
    'fastapi',
    'uvicorn[standard]',
    'python-multipart',
    'email-validator'
];

/**
 * Minimum file size for Python files (bytes)
 */
export const MIN_PYTHON_FILE_SIZE = 50;

/**
 * Maximum file name length
 */
export const MAX_FILE_NAME_LENGTH = 255;

/**
 * Temporary backend directory name
 */
export const TEMP_BACKEND_DIR = '.temp-backend';

/**
 * Default server host
 */
export const DEFAULT_SERVER_HOST = '0.0.0.0';

/**
 * Default uvicorn port range
 */
export const UVICORN_PORT_RANGE = {
    min: 8000,
    max: 9999
};
