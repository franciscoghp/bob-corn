# 🚀 Guía de Configuración Rápida - Bob's Corn

## Pasos para Ejecutar el Proyecto

### 1. Configurar PostgreSQL

Asegúrate de tener PostgreSQL instalado y ejecutándose. Luego crea la base de datos:

```sql
CREATE DATABASE bobs_corn;
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/bobs_corn
PORT=3000
NODE_ENV=development
```

**Importante:** Reemplaza `postgres` y `tu_password` con tus credenciales de PostgreSQL.

### 3. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Ejecutar el Proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ Database connection established
✅ Database schema initialized successfully
🌽 Bob's Corn API running on port 3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 5. Abrir en el Navegador

Abre `http://localhost:5173` en tu navegador y deberías ver la aplicación funcionando.

## ✅ Verificación

1. **Backend funcionando:** Visita `http://localhost:3000/health` - deberías ver `{"status":"ok",...}`
2. **Frontend funcionando:** Deberías ver la interfaz de Bob's Corn
3. **Rate Limiting:** Intenta comprar maíz dos veces seguidas - la segunda vez debería mostrar error 429

## 🐛 Solución de Problemas

### Error: "DATABASE_URL not set"
- Asegúrate de haber creado el archivo `.env` en la carpeta `backend/`
- Verifica que la ruta de conexión sea correcta

### Error: "Connection refused" o "ECONNREFUSED"
- Verifica que PostgreSQL esté ejecutándose
- Verifica que las credenciales en `.env` sean correctas
- Verifica que el puerto 5432 sea el correcto

### Error: "Cannot find module"
- Ejecuta `npm install` en ambas carpetas (backend y frontend)
- Asegúrate de estar en el directorio correcto

### El frontend no se conecta al backend
- Verifica que el backend esté ejecutándose en el puerto 3000
- Verifica que el proxy en `vite.config.ts` apunte a `http://localhost:3000`

## 📝 Notas Importantes

- La base de datos se inicializa automáticamente al iniciar el backend
- Los clientes se identifican mediante un ID almacenado en localStorage
- El rate limiting es de 1 maíz por minuto por cliente
- El contador de tiempo se actualiza automáticamente en el frontend



