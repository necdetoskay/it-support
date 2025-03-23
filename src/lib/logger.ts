/**
 * Basit loglama sistemi - production ortamında hata gizleme
 */

// Log seviyeleri
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Production mod kontrolü
const isProduction = process.env.NODE_ENV === 'production';

// Varsayılan log seviyesi
const defaultLogLevel = isProduction ? LogLevel.ERROR : LogLevel.DEBUG;

// Log gönderme fonksiyonu - production ortamında bir loglama servisine göndermek için kullanılabilir
const sendLogToService = (level: LogLevel, message: string, meta?: any) => {
  // Bu fonksiyon, gerçek bir log servisine (Sentry, LogRocket vb.) log göndermek için özelleştirilebilir
  if (isProduction) {
    // Örnek: Sentry, LogRocket veya başka bir servise gönderme 
    // Burada entegrasyonu yapabilirsiniz
    
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ level, message, meta, timestamp: new Date().toISOString() })
    // }).catch(e => {
    //   // Log gönderiminde hata olursa sessizce yoksay
    // });
  }
};

// Log formatı
const formatLog = (level: LogLevel, message: string, meta?: any) => {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && { meta }),
  };
};

// Loglama fonksiyonları
export const logger = {
  /**
   * Debug seviyesinde log
   * Production ortamında konsola çıktı vermez
   */
  debug: (message: string, meta?: any) => {
    if (!isProduction) {
      console.debug(formatLog(LogLevel.DEBUG, message, meta));
    }
    sendLogToService(LogLevel.DEBUG, message, meta);
  },

  /**
   * Info seviyesinde log
   * Production ortamında konsola çıktı vermez
   */
  info: (message: string, meta?: any) => {
    if (!isProduction) {
      console.info(formatLog(LogLevel.INFO, message, meta));
    }
    sendLogToService(LogLevel.INFO, message, meta);
  },

  /**
   * Uyarı seviyesinde log
   * Production ortamında konsola çıktı vermez
   */
  warn: (message: string, meta?: any) => {
    if (!isProduction) {
      console.warn(formatLog(LogLevel.WARN, message, meta));
    }
    sendLogToService(LogLevel.WARN, message, meta);
  },

  /**
   * Hata seviyesinde log
   * Kritik hatalar için, production ortamında da konsola çıktı verebilir
   * Ayrıca hata servise de gönderilir
   */
  error: (message: string, error?: Error, meta?: any) => {
    const errorMeta = {
      ...(meta || {}),
      ...(error && {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }),
    };

    if (!isProduction) {
      console.error(formatLog(LogLevel.ERROR, message, errorMeta));
    }
    
    // Hata her zaman servise gönderilir
    sendLogToService(LogLevel.ERROR, message, errorMeta);

    return {
      message,
      timestamp: new Date().toISOString(),
      error: error?.message
    };
  },
};

// Özel konsol override
export const setupLogger = () => {
  if (isProduction && typeof window !== 'undefined') {
    // Production ortamında konsol çıktılarını engelle/özelleştir
    const originalConsole = { ...console };
    
    // Debug ve log fonksiyonlarını devre dışı bırak
    console.debug = () => {};
    console.log = () => {};
    
    // Info ve warn fonksiyonlarını özelleştir (isteğe bağlı)
    console.info = (...args) => {
      sendLogToService(LogLevel.INFO, args.join(' '));
    };
    
    console.warn = (...args) => {
      sendLogToService(LogLevel.WARN, args.join(' '));
    };
    
    // Error fonksiyonu için özel işleme
    console.error = (...args) => {
      const message = args.join(' ');
      sendLogToService(LogLevel.ERROR, message);
      
      // Kritik hatalar için orijinal konsol hatası gösterilebilir (isteğe bağlı)
      // originalConsole.error(...args);
    };
  }
};

export default logger; 