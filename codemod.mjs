import fs from 'fs';
import path from 'path';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Replace Imports
  if (content.includes('react-router-dom')) {
    const rrdImportsMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]react-router-dom['"];?/);
    if (rrdImportsMatch) {
      let importsStr = rrdImportsMatch[1];
      const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
      
      let nextLinkImports = [];
      let nextNavImports = [];

      if (imports.includes('Link')) {
        nextLinkImports.push('Link');
      }
      if (imports.includes('useNavigate') || imports.includes('useLocation') || imports.includes('useParams')) {
        if (imports.includes('useNavigate')) nextNavImports.push('useRouter');
        if (imports.includes('useLocation')) nextNavImports.push('usePathname');
        if (imports.includes('useParams')) nextNavImports.push('useParams');
      }

      // Replace original import
      content = content.replace(rrdImportsMatch[0], '');
      
      let newImports = '';
      if (nextLinkImports.length > 0) {
        newImports += `import Link from 'next/link';\n`;
      }
      if (nextNavImports.length > 0) {
        newImports += `import { ${nextNavImports.join(', ')} } from 'next/navigation';\n`;
      }
      
      // Inject at top
      content = newImports + content;
    }
  }

  // 2. Replace hooks: useNavigate() -> useRouter()
  content = content.replace(/useNavigate\(\)/g, 'useRouter()');

  // 3. Replace hook usages: navigate(path) -> router.push(path)
  // This is tricky because `useRouter` is named `navigate` now if we just renamed the hook, 
  // but it's better to keep `navigate` as the variable name and dynamically catch its calls:
  // e.g., navigate('/dashboard') -> navigate.push('/dashboard')
  // We'll replace the variable instantiation `useNavigate()` -> `useRouter()` above, 
  // so `const navigate = useRouter();` is valid.
  // Then we need to replace `navigate(path)` with `navigate.push(path)`.
  // Regex to find `navigate(something)` where `something` is not just destructured args.
  // Exception: `navigate(-1)` -> `navigate.back()`
  content = content.replace(/navigate\(\s*-1\s*\)/g, 'navigate.back()');
  // navigate('/path', { replace: true }) -> navigate.replace('/path')
  content = content.replace(/navigate\(([^,]+),\s*\{\s*replace:\s*true\s*\}\s*\)/g, 'navigate.replace($1)');
  // navigate('/path') -> navigate.push('/path') (matches navigate with 1 arg, not containing brackets for dict)
  content = content.replace(/navigate\(([^,{}]+)\)/g, 'navigate.push($1)');

  // 4. Replace <Link to="..."> with <Link href="...">
  content = content.replace(/<Link([^>]*)to=/g, '<Link$1href=');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

// Ensure execution inside src directory only
processDirectory('./src/components');
processDirectory('./src/hooks');
processDirectory('./src/pages');
processDirectory('./src/lib');

console.log("Codemod completed.");
