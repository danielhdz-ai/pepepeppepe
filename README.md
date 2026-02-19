# 📊 Trading Survivor

**Trading Journal & Performance Analytics Platform**

Una plataforma completa para gestionar, analizar y mejorar tu trading con integración automática de múltiples brokers.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/trading-survivor)

## ✨ Características Principales

### 📈 Análisis de Trading
- Dashboard completo con métricas en tiempo real
- Gráficos de equity curve y drawdown
- Análisis por símbolos, sesiones y días de la semana
- Profit factor, win rate, expectativa matemática
- Calendario de trading con heat map

### 🔌 Integraciones Automáticas
- **BingX** - Futures & Spot
- **MEXC** - Futures
- **Bitget** - Futures & Spot
- **NinjaTrader** - Importación CSV
- **cTrader** - Importación HTML
- **MetaTrader 4/5** - Importación HTML
- **PrimeXBT** - Crypto & CFDs

### 📊 Funcionalidades
- **Chartbook** - Visualización de gráficos de trading
- **Daily Journal** - Diario de operaciones
- **Playbook** - Estrategias y setups
- **Audición** - Modo evaluación para cuentas fondeadas
- **Funded Accounts** - Gestión de cuentas financiadas
- **Calendario** - Seguimiento temporal de operaciones

### 🎯 Multi-Usuario
- Sistema de autenticación con Supabase
- Datos aislados por usuario
- Sincronización en tiempo real
- Exportación e importación de datos

## 🚀 Despliegue Rápido

### Deploy en Vercel (Recomendado)

1. Haz clic en el botón "Deploy with Vercel" arriba
2. Configura las variables de entorno:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. ¡Listo! La app estará disponible en tu dominio de Vercel

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/your-username/trader-survivor.git
cd trader-survivor

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El servidor estará disponible en `http://127.0.0.1:8003`

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script SQL en `/supabase/schema.sql`
3. Copia las credenciales a las variables de entorno

## 📁 Estructura del Proyecto

```
trader-survivor/
├── api/                    # Serverless functions (Vercel)
│   ├── bingx/
│   │   └── [...path].js   # BingX proxy dinámico
│   ├── bitget/
│   │   └── [...path].js   # Bitget proxy dinámico
│   ├── mexc.js            # MEXC proxy
│   └── health.js          # Health check
├── frontend/              # Frontend logic
│   ├── api-client.js
│   └── ninjatrader-*.js
├── supabase/              # Database schema
│   └── schema.sql
├── index.html             # Main application
├── server.js              # Local dev server
└── vercel.json            # Vercel configuration
```

## 🔐 Seguridad

- **Autenticación**: Supabase Auth
- **Aislamiento**: Row Level Security (RLS) en Supabase
- **API Keys**: Almacenadas encriptadas en Supabase
- **CORS**: Configurado correctamente para todas las APIs
- **Firmas**: HMAC SHA256 para todas las solicitudes API

## 📖 Documentación

- [Guía de Despliegue](DEPLOYMENT.md) - Instrucciones detalladas de deployment
- [Guía NinjaTrader](GUIA-NINJATRADER.md) - Integración con NinjaTrader
- [NinjaTrader README](NINJATRADER-README.md) - Documentación técnica NT

## 🛠️ API Endpoints

### BingX
```
GET /api/bingx/openApi/swap/v2/user/balance
GET /api/bingx/openApi/swap/v2/trade/allOrders
```

### MEXC
```
POST /api/mexc
Body: { apiKey, secretKey, endpoint, params }
```

### Bitget
```
GET /api/bitget/api/v2/mix/order/fills
GET /api/bitget/api/v2/mix/account/account
```

## 🎨 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Charts**: TradingView Widgets, Chart.js
- **Auth**: Supabase Auth

## 📊 Capturas de Pantalla

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Chartbook
![Chartbook](screenshots/chartbook.png)

### Analytics
![Analytics](screenshots/analytics.png)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

Daniel HDZ - [@danielhdz](https://twitter.com/danielhdz)

Project Link: [https://github.com/your-username/trader-survivor](https://github.com/your-username/trader-survivor)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Deployment & Hosting
- [TradingView](https://www.tradingview.com) - Trading Charts
- [Chart.js](https://www.chartjs.org) - Data Visualization

---

⭐️ Si este proyecto te ayuda, considera darle una estrella en GitHub!
