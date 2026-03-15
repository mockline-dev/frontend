/**
 * Project Creation Loader Constants
 * Constants for the project creation loader component
 */

import type { LucideIcon } from 'lucide-react';
import {
    Cpu,
    Layers,
    FileCode2,
    Code2,
    Zap
} from 'lucide-react';

/**
 * Stage definition
 */
export interface Stage {
    icon: LucideIcon;
    label: string;
    key: string;
    description: string;
    estimatedTime: string;
}

/**
 * Enhanced stage definitions with detailed descriptions
 */
export const STAGES: Stage[] = [
    {
        icon: Cpu,
        label: 'Analyzing prompt',
        key: 'analyzing',
        description: 'Understanding requirements and planning architecture',
        estimatedTime: '5-10s'
    },
    {
        icon: Layers,
        label: 'Planning architecture',
        key: 'planning',
        description: 'Designing system structure and dependencies',
        estimatedTime: '10-15s'
    },
    {
        icon: FileCode2,
        label: 'Generating files',
        key: 'generating',
        description: 'Creating project files and code',
        estimatedTime: '20-40s'
    },
    {
        icon: Code2,
        label: 'Validating code',
        key: 'validating',
        description: 'Checking code quality and consistency',
        estimatedTime: '5-10s'
    },
    {
        icon: Zap,
        label: 'Finalizing project',
        key: 'finalizing',
        description: 'Completing setup and preparing workspace',
        estimatedTime: '5-10s'
    }
];

/**
 * Context-aware status messages inspired by Claude Code
 */
export const CONTEXT_MESSAGES: Record<string, string[]> = {
    analyzing: [
        'Parsing your requirements...',
        'Identifying key components...',
        'Mapping out dependencies...',
        'Understanding project scope...'
    ],
    planning: [
        'Designing system architecture...',
        'Planning data models...',
        'Defining API structure...',
        'Setting up project structure...'
    ],
    generating: [
        'Creating configuration files...',
        'Generating models and services...',
        'Building API endpoints...',
        'Writing database schemas...'
    ],
    validating: [
        'Checking code consistency...',
        'Validating imports...',
        'Running quality checks...',
        'Ensuring best practices...'
    ],
    finalizing: [
        'Finalizing project setup...',
        'Preparing workspace...',
        'Optimizing configuration...',
        'Almost ready...'
    ]
};

/**
 * Tech stack indicators for visual interest
 */
export const TECH_STACK: string[] = [
    'FastAPI',
    'Python',
    'PostgreSQL',
    'Redis',
    'Docker',
    'SQLAlchemy',
    'Pydantic',
    'JWT'
];

/**
 * Code snippets for background animation
 */
export const CODE_SNIPPETS: string[] = [
    'from fastapi import FastAPI, HTTPException',
    'from sqlalchemy import create_engine',
    'app = FastAPI(title="Generated API")',
    '@router.get("/users/{id}")',
    'async def get_user(id: int, db: Session):',
    'class UserModel(BaseModel):',
    '    email: EmailStr',
    '    hashed_password: str',
    'def verify_token(token: str) -> dict:',
    '    return jwt.decode(token, SECRET_KEY)',
    'engine = create_engine(DATABASE_URL)',
    'SessionLocal = sessionmaker(bind=engine)',
    'CORS(app, origins=["*"])',
    '@app.on_event("startup")',
    'async def startup_event():',
    '    await database.connect()',
    'class AuthService:',
    '    async def login(self, body: LoginDto):'
];
