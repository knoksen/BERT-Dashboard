# 🚀 BERT-Dashboard - Development Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Workflow](#development-workflow)
3. [Code Quality](#code-quality)
4. [Testing](#testing)
5. [Building & Deployment](#building--deployment)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: For version control
- **Gemini API Key**: Required for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/knoksen/BERT-Dashboard.git
cd BERT-Dashboard

# Install dependencies
npm install

# Create .env file with your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

---

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Check for linting issues |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run electron:dev` | Run as Electron app |
| `npm run electron:build` | Build Electron app |

### Project Structure

```
BERT-Dashboard/
├── components/          # React components
│   ├── shared/         # Reusable components
│   ├── *BertStudio.tsx # Feature components
│   └── *View.tsx       # View components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── services/           # API services (Gemini)
├── __tests__/          # Test files
├── electron/           # Electron main process
├── scripts/            # Build scripts
├── public/             # Static assets
├── types.ts            # TypeScript type definitions
├── constants.ts        # App constants
└── App.tsx            # Root component
```

### Development Guidelines

#### Component Organization
- **Place shared components in `components/shared/`**
- **Feature-specific components in `components/`**
- **Each major feature gets its own `*Studio` or `*View` component**
- **Keep components focused and under 300 lines**

#### State Management
- **Use React Context for global state** (e.g., CreditContext)
- **Use custom hooks for reusable logic** (e.g., useChat, usePersistentState)
- **Prefer local state when possible**

#### Styling
- **Use Tailwind CSS classes**
- **Follow the dark theme convention**
- **Use CSS variables for consistent theming**

---

## Code Quality

### TypeScript

#### Strict Mode Enabled
The project uses strict TypeScript checking:
- All types must be explicitly defined
- No implicit `any` types
- Unused variables/parameters are flagged
- Strict null checks enabled

#### Best Practices
```typescript
// ✅ Good - Explicit types
interface UserProps {
  name: string;
  credits: number;
}

const User: React.FC<UserProps> = ({ name, credits }) => {
  return <div>{name} has {credits} credits</div>;
};

// ❌ Bad - Implicit any
const User = (props) => {
  return <div>{props.name}</div>;
};
```

### ESLint

#### Enabled Rules
- **React Hooks rules** - Enforces Hooks best practices
- **TypeScript rules** - Type safety and consistency
- **No console.log** - Use console.warn or console.error for debugging
- **Unused variables** - Prefix with `_` if intentionally unused

#### Auto-fix Issues
```bash
# Fix all auto-fixable issues
npm run lint:fix

# Check issues without fixing
npm run lint
```

### Code Formatting

#### Prettier Configuration
The project uses Prettier for consistent formatting:
- 2 space indentation
- Single quotes
- Semicolons
- Trailing commas

---

## Testing

### Test Structure

```typescript
// Example test file: __tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report (opens in browser)
npm run test:coverage
open coverage/index.html
```

### Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Lines | 20% |
| Statements | 20% |
| Functions | 20% |
| Branches | 15% |

### Testing Best Practices

1. **Test user behavior, not implementation**
   ```typescript
   // ✅ Good
   expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
   
   // ❌ Bad
   expect(wrapper.find('.submit-button')).toHaveLength(1);
   ```

2. **Mock external dependencies**
   ```typescript
   vi.mock('../services/geminiService', () => ({
     generateResponse: vi.fn()
   }));
   ```

3. **Clean up after tests**
   ```typescript
   afterEach(() => {
     vi.clearAllMocks();
     localStorage.clear();
   });
   ```

---

## Building & Deployment

### Production Build

```bash
# Build for web
npm run build

# Build outputs to dist/
ls dist/
```

### Build Optimization

The Vite build automatically:
- **Minifies code** with esbuild
- **Code splits** by route and vendor
- **Tree shakes** unused code
- **Optimizes assets** (images, fonts)

### Bundle Analysis

Check bundle sizes after build:
```bash
npm run build

# Check output
# dist/assets/ contains all chunks with gzipped sizes
```

### Deployment Options

#### 1. GitHub Pages (Automated)
Push to `main` branch triggers automatic deployment.

#### 2. Static Hosting (Netlify, Vercel)
```bash
# Build command
npm run build

# Publish directory
dist
```

#### 3. Electron Desktop App
```bash
# Windows
npm run electron:build:win

# Portable version
npm run electron:build:portable
```

### Environment Variables

Create `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
```

**Never commit `.env` to version control!**

---

## Troubleshooting

### Common Issues

#### 1. Tests Running Out of Memory

**Symptom**: `JavaScript heap out of memory` during tests

**Solution**: 
- Tests are configured to run in single-thread mode
- Reduce parallel test execution
- Clear test cache: `rm -rf node_modules/.vitest`

#### 2. Build Fails with TypeScript Errors

**Symptom**: `error TS2307: Cannot find module`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify TypeScript version
npm list typescript
```

#### 3. Lint Errors

**Symptom**: ESLint errors blocking commit

**Solution**:
```bash
# Auto-fix most issues
npm run lint:fix

# For React Hooks errors, check:
# - Hooks are at top level
# - Hooks are in function components
# - Hooks are not conditional
```

#### 4. Vite Dev Server Not Starting

**Symptom**: Port 3000 already in use

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in vite.config.ts
# server: { port: 3001 }
```

#### 5. API Key Not Working

**Symptom**: 401 Unauthorized errors

**Solution**:
- Check `.env` file exists
- Verify `GEMINI_API_KEY` is set correctly
- Restart dev server after changing `.env`
- Check API key is active in Google AI Studio

### Debug Mode

Enable debug logging:
```typescript
// In your component
console.warn('Debug:', { state, props });

// In tests
import { debug } from '@testing-library/react';
render(<Component />);
debug(); // Prints DOM
```

---

## Performance Tips

### 1. Code Splitting
Already configured! Each feature component lazy loads:
```typescript
const DarkbertStudio = lazy(() => import('./components/DarkbertStudio'));
```

### 2. Memoization
Use for expensive computations:
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 3. Lazy Image Loading
```tsx
<img loading="lazy" src={imageUrl} alt="Description" />
```

---

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Write tests for your changes**
4. **Ensure all tests pass**: `npm test`
5. **Lint your code**: `npm run lint:fix`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Pull Request Checklist

- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No lint errors
- [ ] TypeScript compiles without errors
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Code follows project conventions

---

**Last Updated**: January 12, 2026
**Maintained by**: @knoksen
