# Configuración de API-Football

## Pasos para configurar API-Football

### 1. Registrarse en API-Football

1. Ve a [https://dashboard.api-football.com/](https://dashboard.api-football.com/)
2. Haz clic en "Register" o "Sign up"
3. Completa el formulario de registro
4. **No se requiere tarjeta de crédito** para el plan gratuito

### 2. Obtener tu API Key

1. Una vez registrado, inicia sesión en el dashboard
2. Ve a la sección "API" o "API Key"
3. Copia tu API Key (tendrá un formato como: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 3. Configurar en la aplicación

1. Abre el archivo `api-config.js`
2. Encuentra la sección `apiFootball`:

```javascript
apiFootball: {
    apiKey: 'TU_API_KEY_AQUI', // Pega tu API key aquí
    baseUrl: 'https://v3.football.api-sports.io',
    leagueId: 1, // FIFA World Cup (verificar cuando esté disponible)
    season: 2026,
}
```

3. Pega tu API Key en el campo `apiKey`
4. Asegúrate de que `provider: 'api-football'` esté configurado

### 4. Verificar la configuración

1. Abre la aplicación en el navegador
2. Haz clic en el botón "🔄 Actualizar Resultados"
3. Si todo está bien configurado, deberías ver un mensaje de éxito
4. Si hay un error, revisa la consola del navegador para más detalles

## Plan Gratuito de API-Football

- **100 requests por día** (suficiente para actualizaciones periódicas)
- **Acceso a todos los endpoints**
- **Livescore actualizado cada 15 segundos**
- **Sin tarjeta de crédito requerida**
- **Siempre gratuito**

## Límites del Plan Gratuito

- 100 requests/día
- Si necesitas más, considera actualizar a un plan de pago:
  - **Pro**: $19/mes - 7,500 requests/día
  - **Ultra**: $29/mes - 75,000 requests/día
  - **Mega**: $39/mes - 150,000 requests/día

## Nota sobre el Mundial 2026

El Mundial 2026 aún no ha comenzado, por lo que:
- Los datos reales estarán disponibles cuando comience el torneo
- El `leagueId` puede necesitar ajustarse cuando la competición esté disponible
- Por ahora, puedes usar el modo de prueba para simular resultados

## Documentación

- [Documentación de API-Football](https://www.api-football.com/documentation-v3)
- [Dashboard de API-Football](https://dashboard.api-football.com/)

## Solución de Problemas

### Error: "API no configurada"
- Verifica que hayas pegado la API key en `api-config.js`
- Asegúrate de que `provider: 'api-football'` esté configurado

### Error: "Invalid API key"
- Verifica que la API key sea correcta
- Asegúrate de que no haya espacios extra al copiar/pegar

### Error: "Rate limit exceeded"
- Has alcanzado el límite de 100 requests/día
- Espera hasta el siguiente día o considera actualizar tu plan

### No se encuentran resultados
- El Mundial 2026 aún no ha comenzado
- Los resultados estarán disponibles cuando comience el torneo
- Por ahora, usa el modo de prueba para simular resultados

