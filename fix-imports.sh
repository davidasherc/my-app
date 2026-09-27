#!/bin/bash
set -e

echo "Fixing package.json duplicate/invalid dependency keys..."
sed -i '' -E '/"[^"]+@[0-9]+\.[0-9]+\.[0-9]+[^"]*": *"npm:/d' package.json

echo "Fixing versioned imports in source files (double quotes)..."
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' -E 's/(from ["\x27][^"\x27]*)@[0-9]+\.[0-9]+\.[0-9]+([^"\x27]*["\x27])/\1\2/g' {} +

echo "Fixing versioned imports (scoped and unscoped packages, all quote styles)..."
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' -E "s/(from ['\"]@?[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?)@[0-9]+\.[0-9]+\.[0-9]+(['\"])/\1\3/g" {} +

echo ""
echo "Checking for any remaining versioned imports (excluding valid URL imports)..."
REMAINING=$(grep -rn "@[0-9]\+\.[0-9]\+\.[0-9]\+['\"]" src/app --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "esm.sh\|jsr\|http" || true)

if [ -z "$REMAINING" ]; then
  echo "All clear! No more versioned imports found."
else
  echo "Found remaining versioned imports that need manual attention:"
  echo "$REMAINING"
fi

echo ""
echo "Done. Next steps:"
echo "  pnpm install"
echo "  pnpm build"
echo "  npx cap sync ios"
echo "  npx cap open ios"
