# Docusaurus Integration Guide

## Files Needed

Copy these **7 files** to your Docusaurus project:

```
WeaviateConfigurator/
├── index.jsx                          ← Main component
├── styles.css                         ← Scoped styles
├── parameters.json                    ← Configuration
├── components/
│   ├── ParameterStep.jsx
│   └── ResultPage.jsx
└── utils/
    ├── conditionEvaluator.js
    └── dockerComposeGenerator.js
```

## Step-by-Step Integration

### 1. Copy the folder

```bash
# From your configuration-generator repo
cd frontend/src

# Copy to your Docusaurus project
cp -r WeaviateConfigurator /path/to/your-docusaurus/src/components/
```

### 2. Use in your documentation

Create or edit an MDX file:

```mdx
---
title: Docker Compose Configuration
---

import WeaviateConfigurator from '@site/src/components/WeaviateConfigurator';

# Generate Your Configuration

<WeaviateConfigurator />
```

### 3. Done!

That's it! The component is fully self-contained.

## File Structure in Docusaurus

```
your-docusaurus-site/
├── docs/
│   └── installation.mdx               ← Your doc page
├── src/
│   └── components/
│       └── WeaviateConfigurator/      ← Paste here
│           ├── index.jsx
│           ├── styles.css
│           ├── parameters.json
│           ├── components/
│           │   ├── ParameterStep.jsx
│           │   └── ResultPage.jsx
│           └── utils/
│               ├── conditionEvaluator.js
│               └── dockerComposeGenerator.js
└── docusaurus.config.js
```

## Example Usage

### Basic

```mdx
<WeaviateConfigurator />
```

### Custom Section

```mdx
# Quick Start

Generate a `docker-compose.yml` file for your Weaviate setup:

<WeaviateConfigurator />

## What's Next?

After downloading your configuration file...
```

### With Context

```mdx
## Local Development Setup

Use this configurator to create a docker-compose file tailored to your needs.
The generated file will include:

- Weaviate server configuration
- Module containers (if selected)
- Volume management
- Environment variables

<WeaviateConfigurator />
```

## Customization

### Match Your Branding

Edit `WeaviateConfigurator/styles.css`:

```css
/* Use your primary color */
.wc-button-primary {
  background: #your-primary-color;
}

.wc-progress-fill {
  background: linear-gradient(90deg, #your-color-1 0%, #your-color-2 100%);
}

/* Use your font */
.weaviate-configurator {
  font-family: 'Your Font', sans-serif;
}
```

### Or use Docusaurus theme colors:

```css
.wc-button-primary {
  background: var(--ifm-color-primary);
}

.wc-button-primary:hover {
  background: var(--ifm-color-primary-dark);
}
```

## Testing

### Development

```bash
cd your-docusaurus-site
npm start
```

Navigate to the page with the configurator and test:
1. Step through the wizard
2. Try different selections
3. Generate docker-compose file
4. Copy/download the result

### Build

```bash
npm run build
npm run serve
```

Test the production build to ensure everything works.

## Common Issues

### Import Error

If you see: `Module not found: Can't resolve '@site/src/components/WeaviateConfigurator'`

**Solution**: Check the path. Use `@site/src/components/WeaviateConfigurator` (no `.jsx` extension)

### Styles Not Applied

If styles don't apply correctly:

**Solution**: Ensure `styles.css` is in the `WeaviateConfigurator` folder and imported in `index.jsx`

### Parameters Not Loading

If wizard doesn't start:

**Solution**: Check browser console. Ensure `parameters.json` exists in the `WeaviateConfigurator` folder

## Deployment Checklist

- [x] Copy all 7 files to Docusaurus
- [x] Import in MDX file
- [x] Test in development (`npm start`)
- [x] Customize colors/branding
- [x] Test production build (`npm run build`)
- [x] Deploy!

## What Makes This Easy?

1. **Self-Contained**: No external dependencies
2. **Scoped CSS**: Won't conflict with your styles
3. **No Backend**: Runs entirely in browser
4. **Works Offline**: After initial load
5. **Small Bundle**: Only ~15 KB

## Need Help?

Check the full README.md in the `WeaviateConfigurator` folder for:
- Advanced customization
- Adding parameters
- Extending the generator
- Troubleshooting
- API reference

---

**That's it!** Just 7 files, one import, and you're done. 🎉

