# Required Dependencies for Razorpay Payment Integration

## Installation Command

```bash
npm install razorpay pdfkit nodemailer
npm install --save-dev @types/pdfkit @types/nodemailer
```

## Dependencies Details

### Production Dependencies

#### 1. **razorpay** (^2.9.0)
- Official Razorpay Node.js SDK
- Payment gateway integration
- Signature verification
- Payment methods support

```bash
npm install razorpay
```

#### 2. **pdfkit** (^0.13.0)
- PDF document generation
- Professional invoice creation
- Custom styling and branding
- Buffer support for email attachments

```bash
npm install pdfkit
```

#### 3. **nodemailer** (^6.9.0)
- SMTP email service
- Multiple transport options
- Attachment support
- HTML email templates

```bash
npm install nodemailer
```

### Development Dependencies

#### 1. **@types/pdfkit**
- TypeScript type definitions for pdfkit
- IDE autocomplete support
- Type safety

```bash
npm install --save-dev @types/pdfkit
```

#### 2. **@types/nodemailer**
- TypeScript type definitions for nodemailer
- IDE autocomplete support
- Type safety

```bash
npm install --save-dev @types/nodemailer
```

## Existing Dependencies to Verify

Make sure these are already in your `package.json`:

```json
{
  "dependencies": {
    "express": "^4.x",
    "firebase-admin": "^11.x or ^12.x",
    "react": "^18.x",
    "motion": "^10.x",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

## Package.json Example

```json
{
  "name": "niklaus-solutions-workshops",
  "version": "1.0.0",
  "description": "Professional workshop registration with Razorpay payment",
  "type": "module",
  "main": "backend/src/server.tsx",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "tsx watch backend/src/server.tsx",
    "start": "node backend/dist/src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "firebase-admin": "^12.0.0",
    "react": "^18.2.0",
    "motion": "^10.16.0",
    "lucide-react": "latest",
    "razorpay": "^2.9.0",
    "pdfkit": "^0.13.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@types/pdfkit": "^0.12.0",
    "@types/nodemailer": "^6.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## Installation Order (Recommended)

1. **Install Razorpay first**
   ```bash
   npm install razorpay
   ```

2. **Install PDF generation**
   ```bash
   npm install pdfkit
   ```

3. **Install Email service**
   ```bash
   npm install nodemailer
   ```

4. **Install type definitions**
   ```bash
   npm install --save-dev @types/pdfkit @types/nodemailer
   ```

## Verification

After installation, verify all packages:

```bash
# List installed versions
npm list razorpay pdfkit nodemailer

# Should output similar to:
# niklaus-solutions-workshops@1.0.0
# ├── nodemailer@6.9.13
# ├── pdfkit@0.13.0
# └── razorpay@2.9.1
```

## Common Installation Issues

### Issue: Pdfkit canvas dependency
**Error:** `ERR! gyp ERR! configure error`

**Solution:**
```bash
# Windows
npm install pdfkit --legacy-peer-deps

# macOS/Linux
npm install pdfkit
```

### Issue: Nodemailer version conflicts
**Solution:**
```bash
npm install nodemailer --save-exact
```

### Issue: TypeScript definitions not found
**Solution:**
```bash
npm install --save-dev @types/pdfkit @types/nodemailer
```

## Update Commands

To update packages to latest versions:

```bash
# Update specific packages
npm update razorpay pdfkit nodemailer

# Check for outdated packages
npm outdated
```

## Node Version Requirement

- **Minimum:** Node.js 14.x
- **Recommended:** Node.js 18.x or later

Check your Node version:
```bash
node --version
```

## Lock File

Commit `package-lock.json` to git to ensure consistent installations:

```bash
git add package.json package-lock.json
git commit -m "Add Razorpay payment dependencies"
```

## Optional but Recommended

```bash
# Add environment variable validation
npm install dotenv

# Add request validation
npm install joi

# Add logging
npm install winston

# Add API documentation
npm install swagger-ui-express swagger-jsdoc
```

Installation:
```bash
npm install dotenv joi winston swagger-ui-express swagger-jsdoc
```

## Troubleshooting npm

Clear npm cache if having issues:
```bash
npm cache clean --force
```

Reinstall all dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Deployment Notes

### For Production Deployment

1. **Install dependencies in production mode:**
   ```bash
   npm install --production
   ```

2. **Install with exact versions:**
   ```bash
   npm ci
   ```

3. **Verify installation:**
   ```bash
   npm audit
   ```

4. **Check for vulnerabilities:**
   ```bash
   npm audit fix
   ```

## Version Pinning

For critical production use, pin exact versions in `package.json`:

```json
{
  "dependencies": {
    "razorpay": "2.9.1",
    "pdfkit": "0.13.0",
    "nodemailer": "6.9.13"
  }
}
```

---

**Last Updated:** December 24, 2025
**Status:** Ready for Installation ✅
