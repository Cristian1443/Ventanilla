# 🧪 Guía de Testing

Esta guía explica cómo ejecutar y escribir tests para el proyecto **Ventanilla Digital**.

## 📋 Configuración

El proyecto usa:
- **Jest**: Framework de testing
- **React Testing Library**: Para testing de componentes React
- **@testing-library/jest-dom**: Matchers adicionales para DOM

## 🚀 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al cambiar archivos)
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

## 📁 Estructura de Tests

Los tests están organizados en la carpeta `__tests__/` siguiendo la misma estructura del proyecto:

```
__tests__/
├── lib/
│   ├── config.test.ts
│   ├── sla-calculator.test.ts
│   └── ticket-utils.test.ts
├── components/
│   └── SignIn.test.tsx
└── app/
    └── actions/
        └── createTicket.test.ts
```

## ✍️ Escribir Tests

### Test de Utilidades

```typescript
import { isAdmin } from "@/lib/config";

describe("isAdmin", () => {
  it("debe retornar true para email de admin", () => {
    expect(isAdmin("pasantedesarrollo@investinbogota.org")).toBe(true);
  });
});
```

### Test de Componentes

```typescript
import { render, screen } from "@testing-library/react";
import MyComponent from "@/components/MyComponent";

describe("MyComponent", () => {
  it("debe renderizar correctamente", () => {
    render(<MyComponent />);
    expect(screen.getByText("Texto esperado")).toBeInTheDocument();
  });
});
```

### Test de Server Actions

```typescript
import { myAction } from "@/app/actions/myAction";
import { getPrismaClient } from "@/lib/prisma";

jest.mock("@/lib/prisma");

describe("myAction", () => {
  it("debe ejecutar correctamente", async () => {
    // Mock setup
    const result = await myAction(data);
    expect(result).toBeDefined();
  });
});
```

## 🎯 Cobertura de Tests

El proyecto tiene un umbral mínimo de cobertura del 50%:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## 📝 Buenas Prácticas

1. **Nombres descriptivos**: Usa nombres claros para `describe` e `it`
2. **Un test, una cosa**: Cada test debe verificar una funcionalidad específica
3. **Arrange-Act-Assert**: Organiza tus tests en estas tres secciones
4. **Mock dependencies**: Mockea servicios externos (DB, APIs, etc.)
5. **Tests independientes**: Cada test debe poder ejecutarse de forma independiente

## 🔧 Mocks Configurados

El archivo `jest.setup.js` ya incluye mocks para:
- `next/navigation` (useRouter, usePathname, etc.)
- `@/auth` (auth, signIn, signOut)
- Variables de entorno

## 📊 Ver Cobertura

Después de ejecutar `npm run test:coverage`, se genera un reporte en `coverage/`:
- Abre `coverage/lcov-report/index.html` en tu navegador para ver el reporte visual

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Verifica que las rutas en `jest.config.js` estén correctas
- Asegúrate de que `moduleNameMapper` tenga el alias `@/*`

### Error: "SyntaxError: Unexpected token"
- Verifica que `jest-environment-jsdom` esté instalado
- Revisa la configuración de `testEnvironment` en `jest.config.js`

### Tests muy lentos
- Usa `jest --maxWorkers=2` para limitar workers
- Considera usar `jest --runInBand` para tests que requieren secuencialidad
